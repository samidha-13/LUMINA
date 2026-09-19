import axios from "axios";
import Groq from "groq-sdk";
import JournalEntry from "../models/JournalEntry.js";
import mongoose from "mongoose";
import {
  saveBrainMapSnapshot,
  updateOrAddMemoryNode,
  getFullMemoryGraph
} from "../services/brainMapService.js";
import {
  buildUserContext,
  detectPattern
} from "../services/contextService.js";

export const processChatMessage = async (req, res) => {
  try {
    const mongoReady = mongoose.connection.readyState === 1;
    const { message, userId: rawUserId, personalityPrompt, personalityMode } = req.body;
    const userId = rawUserId ? String(rawUserId) : null;
    console.log(`📩 userId: ${userId} | personality: ${personalityMode || 'default'} | message:`, message);

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Step 1: BERT emotion detection
    let emotion = "neutral";
    let confidence = 0.5;
    try {
      const emotionResponse = await axios.post(
        "http://127.0.0.1:8000/detect-emotion",
        { text: message }
      );
      emotion = (emotionResponse.data.emotion || "neutral").toLowerCase();
      confidence = emotionResponse.data.confidence || 0.5;
    } catch (err) {
      console.warn("⚠️ BERT unavailable, defaulting to neutral:", err.message);
    }
    console.log("🎭 Emotion:", emotion, "| Confidence:", confidence);

    // Step 2: Extract triggers
    const triggers = new Set();
    const categoryMap = {
      work: ["work", "office", "boss", "job", "deadline", "colleague", "colleagues", "meeting", "project", "presentation", "client", "manager", "hr", "promotion", "salary", "overtime", "workload", "career"],
      school: ["school", "exam", "college", "study", "assignment", "university", "placement", "placements", "interview", "class", "lecture", "professor", "teacher", "grade", "marks", "semester", "thesis", "homework", "tutor", "course"],
      family: ["mom", "dad", "family", "parents", "sister", "brother", "aunt", "uncle", "grandmother", "grandfather", "spouse", "husband", "wife", "child", "son", "daughter", "relative", "home"],
      relationship: ["breakup", "girlfriend", "boyfriend", "partner", "crush", "dating", "ex", "love", "romance", "marriage", "divorce", "cheating"],
      health: ["sick", "doctor", "health", "hospital", "pain", "headache", "anxiety", "sleep", "tired", "scared", "fatigue", "mental health", "therapy", "insomnia", "exercise", "diet", "weight"],
      finance: ["money", "loan", "salary", "rent", "debt", "bill", "payment", "budget", "savings", "expensive", "afford", "financial", "invest"]
    };

    const lower = message.toLowerCase();
    Object.entries(categoryMap).forEach(([category, keywords]) => {
      if (keywords.some(kw => lower.includes(kw))) {
        triggers.add(category);
      }
    });

    const triggersArray = Array.from(triggers);
    console.log("🎯 Triggers:", triggersArray);

    // Step 3: Save journal entry to MongoDB when available
    let entry = null;
    if (mongoReady) {
      entry = await new JournalEntry({
        userId: String(userId),
        text: message,
        detectedEmotion: emotion,
        moodScore: Math.round(confidence * 10),
        triggers: triggersArray
      }).save();

      if (!entry || !entry._id) {
        console.error("❌ Journal entry failed to save");
        return res.status(500).json({ error: "Failed to save journal entry" });
      }
      console.log("✅ Journal entry saved:", entry._id);
    } else {
      console.warn("⚠️ Mongo unavailable: skipping journal/memory persistence.");
    }

    // Step 4 & 5: Find or create MemoryNode + update connections
    if (mongoReady && entry?._id) {
      for (const trigger of triggersArray) {
        let nodeType = "trauma";
        if (Object.keys(categoryMap).includes(trigger)) nodeType = "life_area";
        if (["joy", "sadness", "fear", "anger", "love", "surprise", "disgust", "trust", "anxiety", "happy", "calm", "stressed", "overwhelmed"].includes(trigger)) nodeType = "emotion";

        const node = await updateOrAddMemoryNode(
          userId,
          trigger,
          emotion,
          confidence,
          entry._id,
          nodeType
        );

        if (node && node._id) {
          await JournalEntry.findByIdAndUpdate(entry._id, {
            $addToSet: { memoryNodes: node._id }
          });
          console.log("✅ Node saved:", node.label);
        } else {
          console.warn("⚠️ Node was null for trigger:", trigger);
        }
      }
    }

    // Step 6: Pattern detection
    const patternInsight = await detectPattern(userId, triggersArray, emotion);
    console.log("🔍 Pattern insight:", patternInsight);

    // Step 7: Build user context from MongoDB history
    const userContextStr = await buildUserContext(userId);

    // Step 8: Generate Groq response using personality prompt if provided
    // Only friend + listener personalities get Hinglish
    const isHinglish = personalityMode === 'supportive_friend' || personalityMode === 'calm_listener';

    const systemPrompt = personalityPrompt
      ? `${personalityPrompt}

Detected emotion: ${emotion} (confidence: ${Math.round(confidence * 100)}%)
Topics mentioned: ${triggersArray.join(', ')}
${patternInsight ? 'Pattern detected: ' + patternInsight : ''}

Context from past conversations:
${userContextStr}

${isHinglish
  ? `IMPORTANT: Respond in Hinglish — mix Hindi and English naturally like Indian friends talk.
Only sprinkle Hindi words naturally — don't overdo it.
Keep 70% English, 30% Hindi words. Natural, not forced.`
  : `Respond in clear English only. Be professional and focused.`}`
      : patternInsight
        ? `You are Lumina, an emotional reflection AI companion.
The user said: "${message}"
Detected emotion: ${emotion} (confidence: ${Math.round(confidence * 100)}%)
Topics mentioned: ${triggersArray.join(", ")}
Pattern detected: ${patternInsight}

Context based on user's past data:
${userContextStr}

In 2-3 warm sentences, gently acknowledge the pattern detected and ask one reflective question.`
        : `You are Lumina, an emotional reflection AI companion.
The user said: "${message}"
Detected emotion: ${emotion} (confidence: ${Math.round(confidence * 100)}%)
Topics mentioned: ${triggersArray.join(", ")}

Context based on user's past data:
${userContextStr}

Respond empathetically in 2-3 sentences and ask one gentle reflective question.`;

    const completion = await new Groq({ apiKey: process.env.GROQ_API_KEY }).chat.completions.create({
      model: process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 220
    });

    const rawReply = completion.choices[0].message.content;
    console.log("💬 Groq reply generated");

    // Parse JSON if AI returned structured response (personality prompts request JSON)
    let finalReply = rawReply;
    let finalEmotion = emotion;
    let finalConfidence = confidence;
    let finalPatternInsight = patternInsight || null;

    try {
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        finalReply = parsed.reply || parsed.response || parsed.text || rawReply;
        if (parsed.emotion) finalEmotion = parsed.emotion.toLowerCase();
        if (parsed.confidence) finalConfidence = Number(parsed.confidence);
        if (parsed.patternInsight) finalPatternInsight = parsed.patternInsight;
        console.log("✅ Parsed JSON reply | emotion:", finalEmotion);
      }
    } catch {
      // Not JSON — use raw text as-is
      console.log("💬 Plain text reply (no JSON wrapper)");
    }

    // Step 9: Save updated brain map snapshot to MongoDB
    const memoryGraph = await getFullMemoryGraph(userId);
    if (memoryGraph) {
      await saveBrainMapSnapshot(userId, memoryGraph.nodes, memoryGraph.edges);
      console.log("🧠 Brain map snapshot saved to MongoDB");
    }

    // Step 10: Return full response
    res.json({
      reply: finalReply,
      emotion: finalEmotion,
      confidence: finalConfidence,
      triggers: triggersArray,
      patternInsight: finalPatternInsight,
      memoryGraph
    });

  } catch (error) {
    console.error("❌ Chat pipeline error:", error?.message || error);
    res.status(500).json({
      error: "Chat pipeline failed",
      detail: error?.message || String(error)
    });
  }
};