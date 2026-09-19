import MemoryNode from "../models/MemoryNode.js";
import { upsertOnboardingVector } from "../services/vectorService.js";

// Save onboarding answers per-user using their real userId
export const saveOnboarding = async (req, res) => {
  const { userId, answers } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    await MemoryNode.findOneAndUpdate(
      { userId: String(userId), label: '__onboarding_answers__' },
      {
        userId: String(userId),
        label: '__onboarding_answers__',
        type: 'onboarding',
        snapshotData: { answers },
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    // Upsert to Pinecone
    await upsertOnboardingVector(userId, answers);

    console.log(`✅ Onboarding saved for userId: ${userId}, answers: ${answers?.length}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ saveOnboarding error:', err);
    res.status(500).json({ error: 'Failed to save onboarding answers' });
  }
};
