import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard = ({ title, icon, children, className = '', hover = true, onClick }: GlassCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
    onClick={onClick}
    className={`glass-card rounded-3xl p-5 overflow-hidden relative group transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {title && (
      <div className="flex items-center gap-3 mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
        {icon && <div className="p-2 bg-muted rounded-lg">{icon}</div>}
        <h3 className="text-sm font-medium tracking-wide uppercase font-display">{title}</h3>
      </div>
    )}
    {children}
  </motion.div>
);

export default GlassCard;
