import axios from "axios";
import Groq from "groq-sdk";

import JournalEntry from "../models/JournalEntry.js";
import MemoryNode from "../models/MemoryNode.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const chat = async (req, res) => {

  try {

    const { message, userId } = req.body;

    // 1️⃣ Emotion detection
    const emotionResponse = await axios.post(
      "http://127.0.0.1:8000/detect-emotion",
      { text: message }
    );

    const emotion = emotionResponse.data.emotion;
    const confidence = emotionResponse.data.confidence;

    // 2️⃣ Trigger detection (simple version)
    const triggers = [];

    const keywords = ["work","college","family","money","health","relationship"];

    keywords.forEach(word => {
      if(message.toLowerCase().includes(word)){
        triggers.push(word);
      }
    });

    // 3️⃣ Save journal entry
    const entry = new JournalEntry({
      userId,
      text: message,
      detectedEmotion: emotion,
      moodScore: Math.floor(Math.random()*10)+1,
      triggers
    });

    await entry.save();

    // 4️⃣ Update memory nodes
    for(const trigger of triggers){

      let node = await MemoryNode.findOne({ label: trigger });

      if(!node){
        node = new MemoryNode({
          label: trigger,
          type: "life_area",
          emotionHistory: []
        });
      }

      node.emotionHistory.push({
        emotion,
        intensity: confidence,
        date: new Date()
      });

      await node.save();
    }

    // 5️⃣ Generate chatbot response
    const completion = await groq.chat.completions.create({

      model: "llama3-8b-8192",

      messages: [
        {
          role: "system",
          content: "You are Lumina, a calm emotional reflection companion. Respond gently and supportively."
        },
        {
          role: "user",
          content: message
        }
      ]

    });

    const reply = completion.choices[0].message.content;

    // 6️⃣ Return everything to frontend
    res.json({
      reply,
      emotion,
      confidence,
      triggers
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Chat pipeline failed" });

  }

};