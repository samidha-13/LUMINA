import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, sparse: true },
  name: String,
  email: String,

  personalityProfile: {
    communicationStyle: String,
    preferredLanguage: String
  },

  password: { // Added for basic auth placeholder
    type: String
  },

  onboardingAnswers: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },

  brainNetwork: {
    nodes: Array,
    edges: Array,
    profile: Object
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", userSchema);