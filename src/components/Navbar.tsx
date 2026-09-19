import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, LayoutDashboard, BookHeart, Compass, LogOut } from 'lucide-react';
import { useMood, moodAccentColors, moodFonts } from '@/contexts/MoodContext';

const Navbar = () => {
  const { isLoggedIn, setIsLoggedIn, mood } = useMood();
  const location = useLocation();
  const accent = moodAccentColors[mood];
  const font = moodFonts[mood];

  const navItems = isLoggedIn
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/mindscape', label: 'Mindscape', icon: Brain },
        { to: '/journal', label: 'Journal', icon: BookHeart },
      ]
    : [];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
      style={{
        background: 'var(--mood-card-bg, rgba(255,255,255,0.03))',
        borderColor: 'var(--mood-card-border, rgba(255,255,255,0.06))',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-3">
          <div className="w-8 h-8 relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                background: `linear-gradient(135deg, ${accent}, ${accent}80)`,
                opacity: 0.8,
              }}
              transition={{ duration: 0.8 }}
            />
            <div className="absolute inset-1 rounded-full bg-black flex items-center justify-center">
              <Compass size={14} style={{ color: accent }} />
            </div>
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--mood-text, #fff)', fontFamily: font }}>Lumina</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? `${accent}15` : 'transparent',
                  color: active ? accent : 'var(--mood-text-muted, #999)',
                }}
              >
                <item.icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          {isLoggedIn ? (
            <button
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ml-2"
              style={{ color: 'var(--mood-text-muted, #999)' }}
            >
              <LogOut size={16} />
            </button>
          ) : (
            <Link
              to="/auth"
              className="ml-4 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: accent, color: '#000' }}
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
