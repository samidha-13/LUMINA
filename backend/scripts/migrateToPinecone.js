import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import JournalEntry from "../models/JournalEntry.js";
import MemoryNode from "../models/MemoryNode.js";
import User from "../models/User.js";
import { 
  upsertJournalVector, 
  upsertMemoryVector, 
  upsertOnboardingVector 
} from "../services/vectorService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const migrate = async () => {
  console.log("Starting Pinecone migration...");

  if (!process.env.MONGO_URI || !process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
    console.error("❌ Missing required environment variables (MONGO_URI, PINECONE_API_KEY, PINECONE_INDEX).");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Migrate Journal Entries
    console.log("\n--- Migrating Journal Entries ---");
    const journals = await JournalEntry.find({}).lean();
    console.log(`Found ${journals.length} journal entries.`);
    for (const entry of journals) {
      if (entry.text) {
        await upsertJournalVector(entry.userId, entry._id, entry.text, entry.detectedEmotion);
      }
    }

    // Migrate Memory Nodes (including onboarding and snapshot data if applicable, but focusing on normal nodes)
    console.log("\n--- Migrating Memory Nodes ---");
    const memoryNodes = await MemoryNode.find({}).lean();
    console.log(`Found ${memoryNodes.length} memory nodes.`);
    for (const node of memoryNodes) {
      if (node.label === '__brain_snapshot__') continue;
      
      if (node.label === '__onboarding_answers__') {
        if (node.snapshotData && node.snapshotData.answers) {
            await upsertOnboardingVector(node.userId, node.snapshotData.answers);
        }
      } else {
        await upsertMemoryVector(node.userId, node._id, node.label, node.type);
      }
    }
    
    // Check users for legacy onboarding data if any
    console.log("\n--- Checking Users for Legacy Onboarding ---");
    const users = await User.find({}).lean();
    for(const user of users) {
        if(user.onboardingAnswers && Object.keys(user.onboardingAnswers).length > 0) {
            // Only upsert if not already covered by memory node to avoid double, but upsert is idempotent by ID.
            // ID used in upsertOnboardingVector is `onboarding_${userId}`, so it will overwrite safely.
            await upsertOnboardingVector(user._id.toString(), user.onboardingAnswers);
        }
    }

    console.log("\n✅ Migration complete!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

migrate();
