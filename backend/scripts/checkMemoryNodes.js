import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import MemoryNode from '../models/MemoryNode.js';

await mongoose.connect(process.env.MONGO_URI);

// Delete all garbage nodes for test123 that are not valid life areas
const validLabels = ['work', 'school', 'family', 'relationship', 'health', 'finance', '__brain_snapshot__'];

const result = await MemoryNode.deleteMany({
  userId: 'test123',
  label: { $nin: validLabels }
});

console.log(`Deleted ${result.deletedCount} garbage nodes`);
await mongoose.disconnect();