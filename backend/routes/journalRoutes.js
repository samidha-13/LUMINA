import express from 'express';
import JournalEntry from '../models/JournalEntry.js';

const router = express.Router();

// POST /api/journal/save  — save a manual journal entry
router.post('/save', async (req, res) => {
  try {
    const { text, moodScore, emotions, triggers, userId: rawUserId } = req.body;
    const userId = rawUserId ? String(rawUserId) : null;

    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (!text || !text.trim()) return res.status(400).json({ error: 'Journal text is required' });

    const entry = new JournalEntry({
      userId,
      text: text.trim(),
      detectedEmotion: (emotions && emotions.length > 0) ? emotions[0].toLowerCase() : 'neutral',
      moodScore: moodScore || 7,
      triggers: triggers || [],
    });

    await entry.save();
    console.log(`📓 Journal entry saved for ${userId}:`, entry._id);
    res.json({ success: true, entry });
  } catch (err) {
    console.error('❌ Journal save error:', err);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

// GET /api/journal/entries?userId=xxx — fetch recent entries for a user
router.get('/entries', async (req, res) => {
  try {
    const userId = req.query.userId ? String(req.query.userId) : null;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const entries = await JournalEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ entries });
  } catch (err) {
    console.error('❌ Journal fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

export default router;
