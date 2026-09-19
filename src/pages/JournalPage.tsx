import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookHeart, Flame, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMood, moodEmoji, moodAccentColors, moodFonts, moodMessage } from '@/contexts/MoodContext';
import GlassCard from '@/components/GlassCard';
import EmotionChip from '@/components/EmotionChip';
import MoodBackground from '@/components/MoodBackground';

const triggerOptions = ['Work', 'Family', 'Friends', 'Health', 'Money', 'Relationship', 'Loneliness', 'Studies'];
const emotionOptions = ['Happy', 'Calm', 'Anxious', 'Sad', 'Stressed', 'Motivated', 'Frustrated', 'Grateful', 'Overwhelmed'];

interface JournalEntry {
  _id: string;
  text: string;
  detectedEmotion: string;
  moodScore: number;
  triggers: string[];
  createdAt: string;
}

const JournalPage = () => {
  const { mood } = useMood();
  const accent = moodAccentColors[mood];
  const font = moodFonts[mood];
  const userId = localStorage.getItem('lumina_userId') || '';

  const [text, setText] = useState('');
  const [score, setScore] = useState(7);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  // Load entries from MongoDB on mount
  const fetchEntries = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/journal/entries?userId=${userId}`);
      const data = await res.json();
      if (data.entries) setEntries(data.entries);
    } catch (err) {
      console.error('Failed to fetch journal entries', err);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);

    try {
      const res = await fetch('http://localhost:5000/api/journal/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          text,
          moodScore: score,
          emotions: selectedEmotions,
          triggers: selectedTriggers,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setText('');
        setScore(7);
        setSelectedEmotions([]);
        setSelectedTriggers([]);
        // Reload entries from DB
        await fetchEntries();
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save journal entry', err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Map emotion string to emoji
  const emotionToEmoji: Record<string, string> = {
    happy: '😊', calm: '😌', anxious: '😰', sad: '😢',
    stressed: '😓', motivated: '🔥', angry: '😤', lonely: '🌙',
    neutral: '😶', frustrated: '😤', grateful: '🙏', overwhelmed: '😫',
  };

  return (
    <>
      <MoodBackground />
      <div className="pt-20 pb-12 px-4 sm:px-6 max-w-4xl mx-auto relative z-10 mood-page" style={{ fontFamily: font }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link to="/dashboard" className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.92)', fontFamily: font }}>
                <BookHeart size={24} style={{ color: accent }} /> Daily Journal
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Record your feelings and track your emotional journey.</p>
            </div>
            <div className="ml-auto flex items-center gap-2 rounded-full px-4 py-2"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Flame size={16} style={{ color: accent }} />
              <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>{entries.length} entries</span>
            </div>
          </div>

          {/* Mood badge */}
          <div className="flex justify-center mb-6">
            <div className="px-4 py-1.5 rounded-full text-xs font-bold border"
              style={{ backgroundColor: `${accent}20`, borderColor: `${accent}40`, color: accent, fontFamily: font }}>
              {moodEmoji[mood]} {moodMessage[mood]}
            </div>
          </div>

          {/* Write entry card */}
          <GlassCard className="mb-6">
            <h2 className="font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: font }}>How are you feeling today?</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write about your day, your thoughts, your feelings..."
              rows={4}
              className="w-full rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 transition-all resize-none mb-4"
              style={{ background: `${accent}08`, border: `1px solid ${accent}20`, color: 'rgba(255,255,255,0.9)', fontFamily: font }}
            />

            {/* Mood Score */}
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Mood score</p>
              <div className="flex items-center gap-4">
                <motion.span className="text-2xl font-bold" animate={{ color: accent }} style={{ fontFamily: font }}>{score}</motion.span>
                <input type="range" min={1} max={10} value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="flex-1" style={{ accentColor: accent }} />
              </div>
            </div>

            {/* Emotions */}
            <div className="mb-4">
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Emotions</p>
              <div className="flex flex-wrap gap-2">
                {emotionOptions.map(e => (
                  <EmotionChip key={e} label={e} selected={selectedEmotions.includes(e)}
                    onClick={() => toggleItem(selectedEmotions, e, setSelectedEmotions)} />
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div className="mb-6">
              <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Triggers</p>
              <div className="flex flex-wrap gap-2">
                {triggerOptions.map(t => (
                  <EmotionChip key={t} label={t} selected={selectedTriggers.includes(t)}
                    onClick={() => toggleItem(selectedTriggers, t, setSelectedTriggers)} />
                ))}
              </div>
            </div>

            {/* Save button */}
            <motion.button
              onClick={handleSave}
              disabled={saving || !text.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              animate={{ backgroundColor: saved ? '#22c55e' : accent, color: '#000', boxShadow: `0 0 40px ${accent}40` }}
              style={{ fontFamily: font }}
              whileHover={{ scale: text.trim() ? 1.02 : 1 }}
              whileTap={{ scale: text.trim() ? 0.98 : 1 }}
            >
              {saved ? '✓ Saved to MongoDB' : saving ? 'Saving...' : <><Save size={16} /> Save Entry</>}
            </motion.button>
          </GlassCard>

          {/* Recent entries from DB */}
          <h2 className="font-semibold text-lg mb-4" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: font }}>
            Your Entries <span className="text-sm font-normal opacity-50">({entries.length} total)</span>
          </h2>

          {loadingEntries ? (
            <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: '0.15em' }}>
              LOADING FROM DATABASE...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              No journal entries yet. Write your first one above.
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {entries.map((entry, i) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard hover={false}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{emotionToEmoji[entry.detectedEmotion?.toLowerCase()] || '📝'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold capitalize" style={{ color: accent }}>
                              {entry.detectedEmotion || 'neutral'}
                            </span>
                            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              Score: {entry.moodScore}/10
                            </span>
                            <span className="text-xs ml-auto" style={{ color: 'rgba(255,255,255,0.25)' }}>
                              {formatDate(entry.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm mb-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                            {entry.text}
                          </p>
                          {entry.triggers && entry.triggers.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {entry.triggers.map(t => (
                                <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

        </motion.div>
      </div>
    </>
  );
};

export default JournalPage;
