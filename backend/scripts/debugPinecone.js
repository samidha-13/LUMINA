import { Pinecone } from '@pinecone-database/pinecone';
import { pipeline, env } from '@xenova/transformers';
import dotenv from 'dotenv';
dotenv.config();

env.allowLocalModels = false;
env.useBrowserCache = false;

async function test() {
  const ext = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await ext('test text', { pooling: 'mean', normalize: true });
  const vector = Array.from(output.data);
  console.log('Vector length:', vector.length);
  console.log('Vector [0-3]:', vector.slice(0, 3));
  
  const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = client.index(process.env.PINECONE_INDEX);
  
  try {
    const res = await index.upsert([{
      id: 'test_1',
      values: vector,
      metadata: { test: '1' }
    }]);
    console.log('Upsert array successful:', res);
  } catch (err) {
    console.error('Upsert array failed:', err.message);
  }

  try {
    const res2 = await index.upsert({
      records: [{
        id: 'test_2',
        values: vector,
        metadata: { test: '2' }
      }]
    });
    console.log('Upsert object successful:', res2);
  } catch (err) {
    console.error('Upsert object failed:', err.message);
  }
}
test();
