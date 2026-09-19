import { motion } from 'framer-motion';
import { useMood, moodAccentColors, moodGradients, moodMessage } from '@/contexts/MoodContext';

const MoodThemeOverlay = () => {
  const { mood } = useMood();
  const accent = moodAccentColors[mood];
  const gradient = moodGradients[mood];
  const message = moodMessage[mood];

  return (
    <>
      {/* Background gradient wash */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: `radial-gradient(ellipse at 30% 20%, ${gradient.from} 0%, ${gradient.via} 50%, ${gradient.to} 100%)`,
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Secondary gradient */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: `radial-gradient(ellipse at 70% 80%, ${gradient.from} 0%, transparent 60%)`,
          opacity: 0.5,
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Floating ambient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px]"
          animate={{
            backgroundColor: accent,
            opacity: 0.06,
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            backgroundColor: { duration: 1 },
            x: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 10, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ top: '10%', left: '15%' }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full blur-[100px]"
          animate={{
            backgroundColor: accent,
            opacity: 0.04,
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            backgroundColor: { duration: 1 },
            x: { duration: 12, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ bottom: '15%', right: '10%' }}
        />
      </div>

      {/* Mood indicator bar at the top */}
      <motion.div
        className="fixed top-16 left-0 right-0 z-40 flex justify-center pointer-events-none"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border"
          animate={{
            backgroundColor: `${accent}15`,
            borderColor: `${accent}30`,
            color: accent,
          }}
          transition={{ duration: 0.8 }}
        >
          {message}
        </motion.div>
      </motion.div>
    </>
  );
};

export default MoodThemeOverlay;
