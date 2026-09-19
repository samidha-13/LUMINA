import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMood, Mood, moodEmoji, moodAccentColors, moodMessage, moodFonts } from '@/contexts/MoodContext';
import LuminaOrb from '@/components/LuminaOrb';
import MoodBackground from '@/components/MoodBackground';

const moods: { mood: Mood; label: string }[] = [
  { mood: 'happy',     label: 'Happy'     },
  { mood: 'calm',      label: 'Calm'      },
  { mood: 'motivated', label: 'Motivated' },
  { mood: 'anxious',   label: 'Anxious'   },
  { mood: 'sad',       label: 'Sad'       },
  { mood: 'angry',     label: 'Angry'     },
  { mood: 'stressed',  label: 'Stressed'  },
  { mood: 'lonely',    label: 'Lonely'    },
];

const DailyCheckIn = () => {
  const { mood, setMood, moodScore, setMoodScore, userName } = useMood();
  const [selectedMood, setSelectedMood] = useState<Mood>(mood);
  const [score, setScore] = useState(moodScore);
  const navigate = useNavigate();

  const handleMoodSelect = (m: Mood) => {
    setSelectedMood(m);
    setMood(m); // Instantly triggers background + theme change
  };

  const handleContinue = () => {
    setMood(selectedMood);
    setMoodScore(score);
    navigate('/mindscape');
  };

  const accent = moodAccentColors[selectedMood];
  const font = moodFonts[selectedMood];

  return (
    <>
      <MoodBackground />
      <div
        className="min-h-screen flex items-center justify-center px-6 relative z-10"
        style={{ fontFamily: font }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          {/* Card */}
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: 'rgba(5,5,8,0.72)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(32px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Orb */}
            <div className="flex justify-center mb-5">
              <LuminaOrb size="sm" />
            </div>

            {/* Live mood badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMood}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.25 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-5 border"
                style={{
                  backgroundColor: `${accent}22`,
                  borderColor: `${accent}50`,
                  color: accent,
                  fontFamily: font,
                }}
              >
                <span className="text-xl">{moodEmoji[selectedMood]}</span>
                {moodMessage[selectedMood]}
              </motion.div>
            </AnimatePresence>

            {/* Heading */}
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: 'rgba(255,255,255,0.92)', fontFamily: font }}
            >
              How are you feeling{userName ? `, ${userName}` : ''}?
            </h1>
            <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Select your mood and watch the world transform around you.
            </p>

            {/* Mood chips — 4 per row */}
            <div className="grid grid-cols-4 gap-2 mb-8">
              {moods.map((m) => {
                const chipAccent = moodAccentColors[m.mood];
                const isSelected = selectedMood === m.mood;
                return (
                  <motion.button
                    key={m.mood}
                    onClick={() => handleMoodSelect(m.mood)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1 py-3 px-2 rounded-2xl text-xs font-semibold transition-all duration-300"
                    style={{
                      background: isSelected ? `${chipAccent}22` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSelected ? chipAccent + '60' : 'rgba(255,255,255,0.08)'}`,
                      color: isSelected ? chipAccent : 'rgba(255,255,255,0.5)',
                      boxShadow: isSelected ? `0 0 16px ${chipAccent}30` : 'none',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <span className="text-xl">{moodEmoji[m.mood]}</span>
                    {m.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Score slider */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.18em] mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Mood score
              </p>
              <motion.span
                className="text-5xl font-bold inline-block mb-3"
                animate={{ color: accent }}
                style={{ fontFamily: font }}
              >
                {score}
              </motion.span>
              <input
                type="range"
                min={1}
                max={10}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: accent }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <span>Very low</span>
                <span>Great</span>
              </div>
            </div>

            {/* CTA button */}
            <motion.button
              onClick={handleContinue}
              className="w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all"
              animate={{
                backgroundColor: accent,
                boxShadow: `0 0 32px ${accent}50`,
              }}
              style={{ color: '#000000', fontFamily: font, letterSpacing: '0.06em' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Enter Your Mindscape →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default DailyCheckIn;
