import MemoryNode from "../models/MemoryNode.js";
import { getFullMemoryGraph } from "../services/brainMapService.js";
import mongoose from "mongoose";

export const getBrainMap = async (req, res) => {
  const { userId } = req.params;

  const graph = await getFullMemoryGraph(userId);

  // Purge any corrupted snapshot node from the D3 dictionary
  if (graph && graph.nodes && graph.nodes['__brain_snapshot__']) {
    delete graph.nodes['__brain_snapshot__'];
  }

  res.json({
    brainMap: graph || null,
    memoryNodes: []
  });
};

export const saveBrainMap = async (req, res) => {
  const { userId, nodes, edges, profile } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  if (mongoose.connection.readyState !== 1) {
    // Keep frontend flow alive in demo mode when Atlas is unreachable.
    return res.json({ success: true, demoMode: true });
  }

  await MemoryNode.findOneAndUpdate(
    { userId: String(userId), label: '__brain_snapshot__' },
    {
      userId: String(userId),
      label: '__brain_snapshot__',
      type: 'snapshot',
      snapshotData: { nodes, edges, profile },
      lastUpdated: new Date()
    },
    { upsert: true, returnDocument: "after" }
  );

  res.json({ success: true });
};
