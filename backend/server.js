import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import Groq from "groq-sdk";
import { fileURLToPath } from "url";
import path from "path";

import User from "./models/User.js";
import JournalEntry from "./models/JournalEntry.js";
import MemoryNode from "./models/MemoryNode.js";
import WeeklyInsight from "./models/WeeklyInsight.js";
import brainMapRoutes from "./routes/brainMapRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import { processChatMessage } from "./controllers/chatController.js";

dotenv.config();
mongoose.set("bufferCommands", false);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let isMongoConnected = false;

app.use(cors());
app.use(express.json());
// Serve test.html and other static files from the backend root
app.use(express.static(__dirname));

/* ----------------------------
   MongoDB Connection
-----------------------------*/

mongoose
.connect(process.env.MONGO_URI)
.then(() => {
  isMongoConnected = true;
  console.log("MongoDB Connected");
})
.catch(() => {
  isMongoConnected = false;
  console.warn("MongoDB unavailable. Running in demo mode without database.");
});




/* ----------------------------
   Groq Setup
-----------------------------*/

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});




app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, isLogin } = req.body;

    if (!isMongoConnected) {
      return res.json({
        message: "Success (demo mode)",
        user: {
          _id: "demo-user",
          name: name || "Demo User",
          email: email || "demo@lumina.ai",
          hasCompletedOnboarding: false,
        },
      });
    }
    
    // For "remove auth" request: Always return a demo user if email is missing or just bypass
    const targetEmail = email || "demo@lumina.ai";
    let user = await User.findOne({ email: targetEmail });

    if (!user) {
      user = new User({ 
        name: name || "Demo User", 
        email: targetEmail, 
        password: password || "password",
        hasCompletedOnboarding: false
      });
      await user.save();
    }
    
    res.json({ message: "Success", user });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Auth failed" });
  }
});


app.use("/api/onboarding", onboardingRoutes);

app.post("/api/onboarding/legacy", async (req, res) => {
  try {
    const { userId, answers, brainData } = req.body;
    
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const updateData = { onboardingAnswers: answers };
    if (brainData) {
      updateData.brainNetwork = brainData;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.json({ message: "Onboarding data saved successfully", user: updatedUser });
  } catch(error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: "Failed to store onboarding data" });
  }
});

app.post("/api/user/brain-network", async (req, res) => {
  try {
    const { userId, brainData } = req.body;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    await User.findByIdAndUpdate(userId, { brainNetwork: brainData });
    res.json({ message: "Brain network saved" });
  } catch (error) {
    console.error("Save brain network error:", error);
    res.status(500).json({ error: "Failed to save brain network" });
  }
});

app.get("/api/user/brain-network/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }
    const user = await User.findById(userId).select("brainNetwork");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ brainNetwork: user.brainNetwork || null });
  } catch (error) {
    console.error("Fetch brain network error:", error);
    res.status(500).json({ error: "Failed to fetch brain network" });
  }
});

app.use("/api/brain-map", brainMapRoutes);
app.use("/api/journal", journalRoutes);

/* Get basic user profile (name + onboarding status) — works with string userId */
app.get("/api/user/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });

    // Try to get user from User collection
    let user = null;
    try {
      user = await User.findById(userId).lean();
      if (!user) {
        user = await User.findOne({ email: "demo@lumina.ai" }).lean();
      }
    } catch (_) {}

    const name = user?.name || "Demo User";
    const hasOnboarding = Boolean(
      user?.hasCompletedOnboarding ||
      (user?.onboardingAnswers && Object.keys(user.onboardingAnswers).length > 0)
    );
    const hasBrainNetwork = Boolean(
      user?.brainNetwork?.nodes?.length || user?.brainNetwork?.edges?.length
    );

    res.json({ name, hasOnboarding, hasBrainNetwork });
  } catch (error) {
    console.error("Fetch profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});


/* Get user's memory nodes formatted as a brain graph (nodes + edges) */
app.get("/api/user/memory-nodes/:userId", async (req, res) => {
  try {
    if (!isMongoConnected) {
      return res.json({ nodes: {}, edges: [] });
    }
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const nodes = await MemoryNode.find({ userId: String(userId), label: { $ne: '__brain_snapshot__' }, type: { $ne: 'onboarding' } }).lean();

    // Build a graph object compatible with the brain map's LOAD_GRAPH message
    const graphNodes = {};
    const graphEdges = [];

    nodes.forEach(node => {
      const nodeId = node.label;
      graphNodes[nodeId] = {
        id: nodeId,
        type: node.type === "life_area" ? "lifeArea" : node.type,
        label: node.label,
        emotion: node.emotionHistory?.slice(-1)[0]?.emotion || "Neutral",
        strength: Math.min(1, 0.4 + (node.emotionHistory?.length || 0) * 0.08),
        mentions: node.emotionHistory?.length || 1,
        timestamp: node._id.getTimestamp().getTime(),
        connections: []
      };
    });

    // Add edges between life area nodes that share emotions
    const nodeIds = Object.keys(graphNodes);
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const a = graphNodes[nodeIds[i]];
        const b = graphNodes[nodeIds[j]];
        if (a.emotion === b.emotion && a.emotion !== "Neutral") {
          graphEdges.push({
            source: nodeIds[i],
            target: nodeIds[j],
            rel: "shared_emotion",
            emotion: a.emotion,
            strength: 0.5
          });
          if (!a.connections.includes(nodeIds[j])) a.connections.push(nodeIds[j]);
          if (!b.connections.includes(nodeIds[i])) b.connections.push(nodeIds[i]);
        }
      }
    }

    res.json({ nodes: graphNodes, edges: graphEdges });
  } catch (error) {
    console.error("Fetch memory nodes error:", error);
    res.status(500).json({ error: "Failed to fetch memory nodes" });
  }
});

/* ----------------------------
   Root Route
-----------------------------*/

app.get("/", (req, res) => {
  res.send("Lumina Backend Running");
});


/* ----------------------------
   Chat Pipeline
-----------------------------*/

app.post("/chat", processChatMessage);




/* ----------------------------
   Test Routes
-----------------------------*/

app.get("/test-user", async (req, res) => {

  const user = new User({
    name: "Samidha",
    email: "samidha@test.com"
  });

  await user.save();

  res.json(user);

});


app.get("/test-journal", async (req, res) => {

  const entry = new JournalEntry({
    text: "I feel anxious about exams",
    detectedEmotion: "fear",
    moodScore: 4,
    triggers: ["college"]
  });

  await entry.save();

  res.json(entry);

});


app.get("/test-node", async (req, res) => {

  const node = new MemoryNode({
    label: "college",
    type: "life_area"
  });

  await node.save();

  res.json(node);

});


app.get("/test-insight", async (req, res) => {

  const insight = new WeeklyInsight({

    topEmotion: "fear",

    mainTrigger: "college",

    summary: "You mentioned exam stress several times this week.",

    reflectionPrompt:
      "What part of your studies is causing the most pressure?"

  });

  await insight.save();

  res.json(insight);

});


/* ----------------------------
   Start Server
-----------------------------*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});