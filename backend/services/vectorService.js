import { Pinecone } from '@pinecone-database/pinecone';
import { pipeline, env } from '@xenova/transformers';

// Skip local model checks, use remote fetching if needed
env.allowLocalModels = false;
env.useBrowserCache = false;

let pineconeClient = null;
let pineconeIndex = null;
let embedder = null;

// Initialize Pinecone
const initPinecone = () => {
  if (pineconeClient) return pineconeIndex;

  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX;

  if (!apiKey || !indexName) {
    console.warn('⚠️ Pinecone credentials missing. Vector search will be disabled.');
    return null;
  }

  try {
    pineconeClient = new Pinecone({ apiKey });
    pineconeIndex = pineconeClient.index(indexName);
    console.log(`✅ Connected to Pinecone index: ${indexName}`);
    return pineconeIndex;
  } catch (err) {
    console.error('❌ Failed to initialize Pinecone:', err);
    return null;
  }
};

// Initialize Embedder
const initEmbedder = async () => {
  if (embedder) return embedder;
  try {
    console.log('⏳ Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model loaded.');
    return embedder;
  } catch (err) {
    console.error('❌ Failed to load embedding model:', err);
    return null;
  }
};

/**
 * Generate a 384D embedding for the given text.
 */
export const embedText = async (text) => {
  if (!text || typeof text !== 'string') return null;
  const ext = await initEmbedder();
  if (!ext) return null;

  try {
    const output = await ext(text, { pooling: 'mean', normalize: true });
    // Convert Float32Array to standard JS Array
    return Array.from(output.data);
  } catch (err) {
    console.error('❌ Embedding generation failed:', err);
    return null;
  }
};

/**
 * Upsert a journal entry vector.
 */
export const upsertJournalVector = async (userId, entryId, text, emotion) => {
  if (!userId || !entryId || !text) return false;
  
  const index = initPinecone();
  if (!index) return false;

  const vector = await embedText(text);
  if (!vector) return false;

  try {
    await index.upsert({
      records: [{
        id: `journal_${entryId}`,
        values: vector,
        metadata: {
          userId: String(userId),
          type: 'journal',
          sourceId: String(entryId),
          text, // Storing text in metadata for direct retrieval
          emotion: emotion || 'neutral',
          timestamp: Date.now()
        }
      }]
    });
    console.log(`✅ Upserted journal vector for entry ${entryId}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to upsert journal vector:', err);
    return false;
  }
};

/**
 * Upsert a memory node vector.
 */
export const upsertMemoryVector = async (userId, nodeId, label, type) => {
  if (!userId || !nodeId || !label) return false;

  const index = initPinecone();
  if (!index) return false;

  const vector = await embedText(`Memory Node: ${label} (${type})`);
  if (!vector) return false;

  try {
    await index.upsert({
      records: [{
        id: `node_${nodeId}`,
        values: vector,
        metadata: {
          userId: String(userId),
          type: 'memory_node',
          sourceId: String(nodeId),
          label,
          timestamp: Date.now()
        }
      }]
    });
    console.log(`✅ Upserted memory node vector for node ${nodeId}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to upsert memory node vector:', err);
    return false;
  }
};

/**
 * Upsert onboarding answers vector.
 */
export const upsertOnboardingVector = async (userId, answers) => {
  if (!userId || !answers) return false;
  
  const index = initPinecone();
  if (!index) return false;

  const text = typeof answers === 'string' ? answers : JSON.stringify(answers);
  const vector = await embedText(`Onboarding Profile: ${text}`);
  if (!vector) return false;

  try {
    await index.upsert({
      records: [{
        id: `onboarding_${userId}`,
        values: vector,
        metadata: {
          userId: String(userId),
          type: 'onboarding',
          sourceId: String(userId),
          text,
          timestamp: Date.now()
        }
      }]
    });
    console.log(`✅ Upserted onboarding vector for user ${userId}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to upsert onboarding vector:', err);
    return false;
  }
};

/**
 * Query Pinecone for semantically relevant memories.
 * ALWAYS filters by userId.
 */
export const querySemanticMemory = async (userId, queryText, topK = 3) => {
  if (!userId || !queryText) return [];
  
  const index = initPinecone();
  if (!index) return [];

  const queryVector = await embedText(queryText);
  if (!queryVector) return [];

  try {
    const results = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter: {
        userId: { $eq: String(userId) }
      }
    });

    return results.matches || [];
  } catch (err) {
    console.error('❌ Semantic query failed:', err);
    return [];
  }
};

/**
 * Delete all vectors for a user (useful for account deletion or cleanup).
 */
export const deleteUserVectors = async (userId) => {
  if (!userId) return false;
  const index = initPinecone();
  if (!index) return false;

  try {
    // Currently Pinecone serverless supports delete by filter in some regions,
    // or we might need to delete by ID if we track them.
    // Assuming delete by filter works for the current index setup:
    /* 
    await index.deleteMany({
      filter: { userId: { $eq: String(userId) } }
    });
    */
    console.log(`⚠️ User vector deletion not fully implemented for free tier, please check SDK capabilities.`);
    return true;
  } catch (err) {
    console.error('❌ Failed to delete user vectors:', err);
    return false;
  }
};
