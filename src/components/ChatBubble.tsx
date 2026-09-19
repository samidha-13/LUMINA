import { motion } from 'framer-motion';

interface ChatBubbleProps {
  type: 'user' | 'bot';
  text: string;
  timestamp?: string;
}

const cleanAndFormat = (text: string): string =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/^\s*[-•]\s/gm, '')
    .trim();

const ChatBubble = ({ type, text, timestamp }: ChatBubbleProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    {type === 'user' ? (
      <div
        className="max-w-[80%] px-4 py-2.5"
        style={{
          background: 'rgba(120, 96, 240, 0.12)',
          border: '1px solid rgba(120, 96, 240, 0.20)',
          borderRadius: '16px 16px 4px 16px',
        }}
      >
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.75)',
          margin: 0,
          lineHeight: 1.6,
        }}>
          {text}
        </p>
        {timestamp && (
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.22)',
            marginTop: 4,
          }}>{timestamp}</p>
        )}
      </div>
    ) : (
      <div
        className="max-w-[85%] px-[18px] py-[14px]"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px 16px 16px 4px',
        }}
      >
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 300,
          lineHeight: 1.75,
          letterSpacing: '0.01em',
          color: 'rgba(255,255,255,0.88)',
          margin: 0,
        }}>
          {cleanAndFormat(text)}
        </p>
        {timestamp && (
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.22)',
            marginTop: 4,
          }}>{timestamp}</p>
        )}
      </div>
    )}
  </motion.div>
);

export default ChatBubble;
