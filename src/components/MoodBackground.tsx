import { motion, AnimatePresence } from 'framer-motion';
import { useMood, Mood } from '@/contexts/MoodContext';

/* ===============================
   MOOD BACKGROUND — Full immersive
   nature photography backgrounds
   =============================== */

// All 8 moods with distinct Unsplash images and color overlays
const backgroundImages: Record<Mood, { url: string; overlay: string; opacity: number; tint: string }> = {
  // ☀️ Happy — golden sunny meadow
  happy: {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
    overlay: 'linear-gradient(to bottom, rgba(245,158,11,0.08), rgba(0,0,0,0.45))',
    tint: 'rgba(245,158,11,0.12)',
    opacity: 0.92
  },
  // 😌 Calm — misty ocean horizon
  calm: {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000&auto=format&fit=crop',
    overlay: 'linear-gradient(to bottom, rgba(14,165,233,0.06), rgba(0,0,0,0.5))',
    tint: 'rgba(14,165,233,0.10)',
    opacity: 0.88
  },
  // 🔥 Motivated — dramatic mountain summit
  motivated: {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000&auto=format&fit=crop',
    overlay: 'linear-gradient(to bottom, rgba(251,191,36,0.08), rgba(0,0,0,0.45))',
    tint: 'rgba(251,191,36,0.12)',
    opacity: 0.90
  },
  // 😰 Anxious — ethereal misty forest
  anxious: {
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2000&auto=format&fit=crop',
    overlay: 'linear-gradient(to bottom, rgba(45,212,191,0.07), rgba(0,0,0,0.55))',
    tint: 'rgba(45,212,191,0.10)',
    opacity: 0.85
  },
  // 😢 Sad — hopeful sunrise over water
  sad: {
    url: 'https://images.unsplash.com/photo-1495344517868-8ebaf0a2044a?q=80&w=2000&auto=format&fit=crop',
    overlay: 'linear-gradient(to bottom, rgba(251,146,60,0.08), rgba(0,0,0,0.5))',
    tint: 'rgba(251,146,60,0.10)',
    opacity: 0.88
  },
  // 😤 Angry — serene lavender twilight to soothe
  angry: {
    url: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=2000&auto=format&fit=crop',
    overlay: 'linear-gradient(to bottom, rgba(167,139,250,0.08), rgba(0,0,0,0.5))',
    tint: 'rgba(167,139,250,0.12)',
    opacity: 0.88
  },
  // 😓 Stressed — calming deep green forest
  stressed: {
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop',
    overlay: 'linear-gradient(to bottom, rgba(52,211,153,0.08), rgba(0,0,0,0.55))',
    tint: 'rgba(52,211,153,0.10)',
    opacity: 0.88
  },
  // 🌙 Lonely — starry night sky, you are not alone
  lonely: {
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2000&auto=format&fit=crop',
    overlay: 'linear-gradient(to bottom, rgba(249,115,22,0.07), rgba(0,0,0,0.6))',
    tint: 'rgba(249,115,22,0.10)',
    opacity: 0.82
  },
};

interface PhotoBackgroundProps {
  image: { url: string; overlay: string; opacity: number; tint: string };
}

const PhotoBackground = ({ image }: PhotoBackgroundProps) => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
    {/* Animated pan/scale for dynamism */}
    <motion.div
      className="absolute inset-[-5%] w-[110%] h-[110%]"
      style={{
        backgroundImage: `url('${image.url}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: image.opacity,
      }}
      animate={{
        scale: [1, 1.04, 1],
        x: ['0%', '-1.5%', '0%'],
        y: ['0%', '0.8%', '0%'],
      }}
      transition={{
        duration: 40,
        ease: 'linear',
        repeat: Infinity,
      }}
    />

    {/* Color-tinted overlay matching mood accent */}
    <div
      className="absolute inset-0"
      style={{ background: image.overlay }}
    />

    {/* Subtle vignette to keep UI readable */}
    <div className="absolute inset-0" style={{
      background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)'
    }} />
  </div>
);

const MoodBackground = () => {
  const { mood } = useMood();
  // Guard against undefined or unrecognised mood keys
  const imageConfig = mood && backgroundImages[mood] ? backgroundImages[mood] : backgroundImages.calm;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mood || 'calm'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        <PhotoBackground image={imageConfig} />
      </motion.div>
    </AnimatePresence>
  );
};

export default MoodBackground;
