import { motion, AnimatePresence } from 'framer-motion';

export type MascotExpression = 
  | 'neutral' 
  | 'curious' 
  | 'empathetic' 
  | 'supportive' 
  | 'thoughtful' 
  | 'encouraging' 
  | 'celebrating' 
  | 'listening';

interface LuminaMascotProps {
  expression?: MascotExpression;
  size?: number;
}

const expressionConfig: Record<MascotExpression, {
  eyeScale: number;
  mouthPath: string;
  glowColor: string;
  glowOpacity: number;
  bodyScale: number;
  blush: boolean;
  sparkles: boolean;
  eyebrowAngle: number;
}> = {
  neutral: {
    eyeScale: 1,
    mouthPath: 'M 35 58 Q 45 62 55 58',
    glowColor: '#ffffff',
    glowOpacity: 0.3,
    bodyScale: 1,
    blush: false,
    sparkles: false,
    eyebrowAngle: 0,
  },
  curious: {
    eyeScale: 1.3,
    mouthPath: 'M 38 57 Q 45 60 52 57',
    glowColor: '#e0e0ff',
    glowOpacity: 0.4,
    bodyScale: 1.05,
    blush: false,
    sparkles: false,
    eyebrowAngle: -8,
  },
  empathetic: {
    eyeScale: 1.1,
    mouthPath: 'M 36 57 Q 45 63 54 57',
    glowColor: '#ffe0e0',
    glowOpacity: 0.35,
    bodyScale: 1,
    blush: true,
    sparkles: false,
    eyebrowAngle: 5,
  },
  supportive: {
    eyeScale: 1.15,
    mouthPath: 'M 34 56 Q 45 66 56 56',
    glowColor: '#e0ffe0',
    glowOpacity: 0.35,
    bodyScale: 1.02,
    blush: true,
    sparkles: false,
    eyebrowAngle: 0,
  },
  thoughtful: {
    eyeScale: 0.9,
    mouthPath: 'M 38 59 Q 45 60 52 59',
    glowColor: '#e0e0ff',
    glowOpacity: 0.3,
    bodyScale: 0.98,
    blush: false,
    sparkles: false,
    eyebrowAngle: -5,
  },
  encouraging: {
    eyeScale: 1.2,
    mouthPath: 'M 33 55 Q 45 68 57 55',
    glowColor: '#fff5e0',
    glowOpacity: 0.45,
    bodyScale: 1.08,
    blush: true,
    sparkles: true,
    eyebrowAngle: -3,
  },
  celebrating: {
    eyeScale: 1.4,
    mouthPath: 'M 32 54 Q 45 70 58 54',
    glowColor: '#ffe0ff',
    glowOpacity: 0.5,
    bodyScale: 1.12,
    blush: true,
    sparkles: true,
    eyebrowAngle: -10,
  },
  listening: {
    eyeScale: 1.15,
    mouthPath: 'M 38 58 Q 45 61 52 58',
    glowColor: '#e0f0ff',
    glowOpacity: 0.3,
    bodyScale: 1.01,
    blush: false,
    sparkles: false,
    eyebrowAngle: 3,
  },
};

const LuminaMascot = ({ expression = 'neutral', size = 120 }: LuminaMascotProps) => {
  const config = expressionConfig[expression];
  const scale = size / 90;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ scale: config.bodyScale }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full blur-[30px]"
        style={{ width: size * 1.3, height: size * 1.3 }}
        animate={{
          backgroundColor: config.glowColor,
          opacity: config.glowOpacity,
          scale: [1, 1.1, 1],
        }}
        transition={{
          backgroundColor: { duration: 0.5 },
          opacity: { duration: 0.5 },
          scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      {/* Sparkles */}
      <AnimatePresence>
        {config.sparkles && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={`sparkle-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (Math.cos((i * 72 * Math.PI) / 180) * size * 0.6)],
                  y: [0, (Math.sin((i * 72 * Math.PI) / 180) * size * 0.6)],
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{ filter: 'blur(0.5px)' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* SVG Face */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 90 90"
        className="relative z-10"
      >
        {/* Body circle */}
        <motion.circle
          cx="45"
          cy="45"
          r="35"
          fill="url(#bodyGradient)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          animate={{ r: 35 * (config.bodyScale * 0.95) }}
          transition={{ duration: 0.4 }}
        />

        {/* Blush */}
        <AnimatePresence>
          {config.blush && (
            <>
              <motion.circle
                cx="28"
                cy="52"
                r="5"
                fill="rgba(255,200,200,0.15)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.circle
                cx="62"
                cy="52"
                r="5"
                fill="rgba(255,200,200,0.15)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Left eyebrow */}
        <motion.line
          x1="28"
          y1="36"
          x2="38"
          y2="36"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{
            y1: 36 + config.eyebrowAngle * 0.15,
            y2: 36 - config.eyebrowAngle * 0.15,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Right eyebrow */}
        <motion.line
          x1="52"
          y1="36"
          x2="62"
          y2="36"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{
            y1: 36 - config.eyebrowAngle * 0.15,
            y2: 36 + config.eyebrowAngle * 0.15,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Left eye */}
        <motion.ellipse
          cx="34"
          cy="44"
          fill="white"
          animate={{
            rx: 4 * config.eyeScale,
            ry: 4.5 * config.eyeScale,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        <motion.circle
          cx="35"
          cy="43.5"
          fill="#111"
          animate={{ r: 2.2 * config.eyeScale }}
          transition={{ duration: 0.3 }}
        />
        <circle cx="36" cy="42" r="1" fill="rgba(255,255,255,0.8)" />

        {/* Right eye */}
        <motion.ellipse
          cx="56"
          cy="44"
          fill="white"
          animate={{
            rx: 4 * config.eyeScale,
            ry: 4.5 * config.eyeScale,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        <motion.circle
          cx="57"
          cy="43.5"
          fill="#111"
          animate={{ r: 2.2 * config.eyeScale }}
          transition={{ duration: 0.3 }}
        />
        <circle cx="58" cy="42" r="1" fill="rgba(255,255,255,0.8)" />

        {/* Mouth */}
        <motion.path
          d={config.mouthPath}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ d: config.mouthPath }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="bodyGradient" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
          </radialGradient>
        </defs>
      </svg>

      {/* Floating idle animation */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};

export default LuminaMascot;
