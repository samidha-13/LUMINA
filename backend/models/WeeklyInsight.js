import mongoose from "mongoose";

const weeklyInsightSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  weekStart: Date,

  topEmotion: String,

  mainTrigger: String,

  summary: String,

  reflectionPrompt: String

});

export default mongoose.model("WeeklyInsight", weeklyInsightSchema);