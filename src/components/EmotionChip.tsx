import { motion } from 'framer-motion';

interface EmotionChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  color?: string;
}

const EmotionChip = ({ label, selected = false, onClick, color }: EmotionChipProps) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
      selected
        ? 'bg-primary/20 border-primary/40 text-primary-foreground'
        : 'bg-muted/50 border-border hover:bg-muted hover:border-muted-foreground/20 text-muted-foreground'
    }`}
    style={selected && color ? { borderColor: `${color}60`, backgroundColor: `${color}20` } : undefined}
  >
    {label}
  </motion.button>
);

export default EmotionChip;
