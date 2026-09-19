import User from "../models/User.js";
import MemoryNode from "../models/MemoryNode.js";
import mongoose from "mongoose";

const isMongoReady = () => mongoose.connection.readyState === 1;

export const saveBrainMapSnapshot = async (userId, nodes, edges) => {
  if (!userId) return null;
  if (!isMongoReady()) return false;
  console.log("💾 Saving brain snapshot for:", userId);
  await MemoryNode.findOneAndUpdate(
    { userId: String(userId), label: '__brain_snapshot__' },
    {
      userId: String(userId),
      label: '__brain_snapshot__',
      type: 'snapshot',
      snapshotData: { nodes, edges },
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
  return true;
};

export const loadBrainMap = async (userId) => {
  if (!userId) return null;
  if (!isMongoReady()) {
    return { user: null, nodes: [], brainNetwork: null };
  }
  let user = null;
  try {
    user = await User.findOne({ _id: userId });
  } catch (err) {
    console.warn("⚠️ User lookup skipped:", userId);
  }
  const nodes = await MemoryNode.find({ userId: String(userId) });
  return {
    user,
    nodes,
    brainNetwork: user ? user.brainNetwork : null
  };
};

export const updateOrAddMemoryNode = async (userId, label, emotion, confidence, journalEntryId, type = "trauma") => {
  if (!userId) return null;
  if (!isMongoReady()) return null;

  let node = await MemoryNode.findOne({ label, userId: String(userId) });
  if (!node) {
    node = new MemoryNode({
      userId: String(userId),
      label,
      type,
      emotionHistory: [],
      connections: []
    });
  }

  node.emotionHistory.push({
    emotion,
    intensity: confidence,
    date: new Date(),
    journalEntryId
  });

  const entryIdStr = String(journalEntryId);
  if (!node.connections.some(id => String(id) === entryIdStr)) {
    node.connections.push(journalEntryId);
  }

  await node.save();
  return node;
};

export const getFullMemoryGraph = async (userId) => {
  if (!userId) return null;
  if (!isMongoReady()) {
    return {
      nodes: {},
      edges: [],
      profile: {
        dominant: "Balanced",
        stressors: [],
        strengths: [],
        primaryEmotion: "Neutral",
        internalizer: 0,
        externalizer: 0,
        avoidant: 0
      }
    };
  }
  const snapshotNode = await MemoryNode.findOne({ userId: String(userId), label: '__brain_snapshot__' }).lean();
  const allNodes = await MemoryNode.find({ userId: String(userId), label: { $ne: '__brain_snapshot__' } }).lean();

  const baseNodes = (snapshotNode?.snapshotData?.nodes) || {};
  const baseEdges = (snapshotNode?.snapshotData?.edges) || [];
  const baseProfile = (snapshotNode?.snapshotData?.profile) || {
    dominant: "Balanced",
    stressors: [],
    strengths: [],
    primaryEmotion: "Neutral",
    internalizer: 0,
    externalizer: 0,
    avoidant: 0
  };

  allNodes.forEach(node => {
    const nodeId = node.label;
    let rawEmotion = node.emotionHistory?.slice(-1)[0]?.emotion || "Neutral";
    const emotionCap = rawEmotion.charAt(0).toUpperCase() + rawEmotion.slice(1).toLowerCase();
    
    // Preserve existing D3 dimensional data
    const existing = baseNodes[nodeId] || {};

    baseNodes[nodeId] = {
      ...existing,
      id: nodeId,
      type: node.type === "life_area" ? "lifeArea" : node.type,
      label: node.label,
      emotion: emotionCap,
      strength: Math.min(1, 0.4 + (node.emotionHistory?.length || 0) * 0.08),
      mentions: node.emotionHistory?.length || 1,
      connections: existing.connections || []
    };
  });

  const nodeIds = Object.keys(baseNodes);
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      const a = baseNodes[nodeIds[i]];
      const b = baseNodes[nodeIds[j]];
      if (a.emotion === b.emotion && a.emotion !== "Neutral") {
        const edgeExists = baseEdges.some(
          e => e.source === nodeIds[i] && e.target === nodeIds[j]
        );
        if (!edgeExists) {
          baseEdges.push({
            source: nodeIds[i],
            target: nodeIds[j],
            rel: "shared_emotion",
            emotion: a.emotion,
            strength: 0.5
          });
        }
      }
    }
  }

  return { nodes: baseNodes, edges: baseEdges, profile: baseProfile };
};