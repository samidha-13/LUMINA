import mongoose from "mongoose";

const memoryNodeSchema = new mongoose.Schema({

  userId: { type: String, default: "test123" },

  label: String,

  type: String, 
  // person, life_area, trauma, emotion, snapshot

  snapshotData: {
    nodes: Object,
    edges: Array
  },
  lastUpdated: Date,

  emotionHistory: [
    {
      emotion: String,
      intensity: Number,
      date: Date,
      journalEntryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JournalEntry"
      }
    }
  ],

  connections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JournalEntry"
    }
  ]

});

export default mongoose.model("MemoryNode", memoryNodeSchema);