import { motion } from 'framer-motion';
import { useMood, moodColors } from '@/contexts/MoodContext';

const LuminaOrb = ({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const { mood } = useMood();
  const color = moodColors[mood];
  
  const dimensions = { sm: 'w-24 h-24', md: 'w-40 h-40', lg: 'w-64 h-64' };
  const innerSizes = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-32 h-32' };
  const coreSizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };

  return (
    <div className={`relative ${dimensions[size]}`}>
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 blur-[60px] opacity-30 rounded-full animate-orb-morph"
        style={{ background: `linear-gradient(135deg, ${color}, #ffffff)` }}
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className={`${innerSizes[size]} rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 inner-glow flex items-center justify-center`}>
          <div className={`${coreSizes[size]} rounded-full breathing-glow`} style={{ background: `${color}30` }} />
        </div>
      </motion.div>
    </div>
  );
};

export default LuminaOrb;
