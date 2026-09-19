import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import LuminaOrb from '@/components/LuminaOrb';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn, setUserName } = useMood();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, isLogin })
      });
      const data = await response.json();

      if (response.ok && data.user) {
        const userId = data.user._id;

        // Store ONLY userId — everything else is fetched from MongoDB
        localStorage.setItem("lumina_userId", userId);
        setIsLoggedIn(true);
        setUserName(data.user.name || 'Explorer');

        if (isLogin && (data.user.hasCompletedOnboarding || (data.user.onboardingAnswers && Object.keys(data.user.onboardingAnswers).length > 0))) {
          // Returning user — mood check-in then Mindscape
          navigate('/daily');
        } else {
          // New user — go to onboarding
          navigate('/onboarding');
        }
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (error) {
       console.error("Auth error", error);
       alert("Network error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Faded AI background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/login-bg.png"
          alt=""
          className="w-full h-full object-cover opacity-[0.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-white/[0.02] rounded-full blur-[150px] z-[1]" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-white/[0.015] rounded-full blur-[150px] z-[1]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-3xl p-8 backdrop-blur-2xl">
          <div className="flex justify-center mb-6">
            <LuminaOrb size="sm" />
          </div>
          <h1 className="text-2xl font-display font-bold text-center mb-2 text-white">
            {isLogin ? 'Welcome back' : 'Begin your journey'}
          </h1>
          <p className="text-sm text-neutral-500 text-center mb-8">
            {isLogin ? 'Lumina is here for you.' : 'Create your Lumina companion account.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-10 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-black font-display font-bold glow-indigo hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
            >
              {isLogin ? 'Welcome Back' : 'Get Started'} <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-white hover:underline font-medium">
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
