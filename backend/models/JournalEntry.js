import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema({

  userId: { type: String, default: "test123" },

  text: String,

  detectedEmotion: String,

  moodScore: Number,

  triggers: [String],

  memoryNodes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemoryNode"
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.model("JournalEntry", journalEntrySchema);