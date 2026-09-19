import JournalEntry from "../models/JournalEntry.js";
import MemoryNode from "../models/MemoryNode.js";
import mongoose from "mongoose";

import { querySemanticMemory } from "./vectorService.js";

const isMongoReady = () => mongoose.connection.readyState === 1;

export const buildUserContext = async (userId, currentMessage) => {
  if (!userId) return "";
  if (!isMongoReady()) return "";

  const recentEntries = await JournalEntry.find({ userId: String(userId) })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const memoryNodes = await MemoryNode.find({ userId: String(userId) }).lean();

  let contextParts = [];

  // MongoDB context (structured)
  const emotionCounts = {};
  recentEntries.forEach(entry => {
    if (entry.detectedEmotion && entry.detectedEmotion !== "neutral") {
      emotionCounts[entry.detectedEmotion] = (emotionCounts[entry.detectedEmotion] || 0) + 1;
    }
  });
  const emotionStrings = Object.entries(emotionCounts).map(([e, count]) => `${e}(${count}x)`);
  if (emotionStrings.length > 0) {
    contextParts.push(`STRUCTURED PATTERNS:\n- User's recent emotions: ${emotionStrings.join(", ")}`);
  }

  const recentTriggers = new Set();
  recentEntries.forEach(entry => {
    if (entry.triggers && Array.isArray(entry.triggers)) {
      entry.triggers.forEach(t => recentTriggers.add(t));
    }
  });
  if (recentTriggers.size > 0) {
    contextParts.push(`- Active triggers: ${Array.from(recentTriggers).join(", ")}`);
  }

  const importantNodes = memoryNodes
    .filter(n => n.type === "person" || n.type === "life_area" || n.type === "trauma")
    .map(n => n.label);
  if (importantNodes.length > 0) {
    contextParts.push(`- Important factors in their life: ${importantNodes.slice(0, 10).join(", ")}`);
  }

  // Pinecone context (semantic)
  if (currentMessage) {
    const semanticMemories = await querySemanticMemory(userId, currentMessage, 3);
    
    // Temporary development logging
    console.log(`\n🌲 [Pinecone Dev Log] Retrieved ${semanticMemories?.length || 0} semantic memories`);
    if (semanticMemories && semanticMemories.length > 0) {
      semanticMemories.forEach((match, idx) => {
        console.log(`   └─ Match ${idx + 1}: Score = ${match.score?.toFixed(4)}, ID = ${match.id}, Type = ${match.metadata?.type}`);
      });
    }

    if (semanticMemories && semanticMemories.length > 0) {
      contextParts.push(`\nRELEVANT PAST EXPERIENCES:`);
      semanticMemories.forEach((match, index) => {
        const metadata = match.metadata || {};
        const text = metadata.text || metadata.label || "A past memory.";
        const date = metadata.timestamp ? new Date(metadata.timestamp).toLocaleDateString() : "Previously";
        
        if (metadata.type === 'journal') {
          contextParts.push(`${index + 1}. [${date}] User said: "${text}" (Emotion: ${metadata.emotion})`);
        } else if (metadata.type === 'onboarding') {
          contextParts.push(`${index + 1}. [Onboarding] User background: "${text}"`);
        } else if (metadata.type === 'memory_node') {
          contextParts.push(`${index + 1}. [Memory Node] Concept: "${text}"`);
        } else {
          contextParts.push(`${index + 1}. ${text}`);
        }
      });
    }
  }

  return contextParts.join("\n");
};

export const detectPattern = async (userId, triggers, emotion) => {
  const THRESHOLD = 3;
  if (!userId) return null;
  if (!isMongoReady()) return null;

  for (const trigger of triggers) {
    const node = await MemoryNode.findOne({
      label: trigger,
      userId: String(userId)
    });

    console.log(`🔍 Pattern check — trigger: ${trigger} | userId: ${userId} | count: ${node?.emotionHistory?.length || 0}`);

    const count = node?.emotionHistory?.length || 0;

    if (count >= THRESHOLD) {
      const dominantEmotion = node.emotionHistory
        .map(h => h.emotion)
        .reduce((acc, e) => {
          acc[e] = (acc[e] || 0) + 1;
          return acc;
        }, {});
      const topEmotion = Object.entries(dominantEmotion)
        .sort((a, b) => b[1] - a[1])[0][0];

      return `I've noticed "${trigger}" has been coming up a lot — ${count} times now, often linked to ${topEmotion}. Would you like to explore why ${trigger} carries this weight for you?`;
    }
  }
  return null;
};