import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, Flame, TrendingUp, BookHeart, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart, BarChart, Bar } from 'recharts';
import { useMood, moodEmoji, moodColors, moodAccentColors, moodMessage, moodFonts } from '@/contexts/MoodContext';
import { demoEntries, weeklyInsight, streakCount } from '@/data/demoData';
import GlassCard from '@/components/GlassCard';
import MoodBackground from '@/components/MoodBackground';
import { Link } from 'react-router-dom';
import WeeklyWrapped from '@/components/weekly-wrapped';
const chartData = demoEntries.map(e => ({
  day: e.dayLabel.slice(0, 3),
  score: e.moodScore,
  mood: e.mood,
})).reverse();

const emotionFreq = demoEntries.reduce((acc, e) => {
  acc[e.mood] = (acc[e.mood] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const pieData = Object.entries(emotionFreq).map(([name, value]) => ({
  name,
  value,
  color: moodColors[name as keyof typeof moodColors] || '#FFFFFF',
}));

const barData = Object.entries(emotionFreq).map(([name, value]) => ({
  name: name.charAt(0).toUpperCase() + name.slice(1),
  count: value,
  fill: moodColors[name as keyof typeof moodColors] || '#FFFFFF',
}));

const Dashboard = () => {
  const { mood, moodScore, userName } = useMood();
  const accent = moodAccentColors[mood];
  const font = moodFonts[mood];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const [showWrapped, setShowWrapped] = useState(false);

  return (
    <>
      {showWrapped && <WeeklyWrapped onClose={() => setShowWrapped(false)} />}
      <MoodBackground />
      <div className="pt-20 pb-12 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 mood-page" style={{ fontFamily: font }}>
        {/* Mood badge */}
        <motion.div className="flex justify-center mb-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div
            className="px-5 py-2 rounded-full text-sm font-bold border"
            animate={{
              backgroundColor: `${accent}20`,
              borderColor: `${accent}40`,
              color: accent,
            }}
            style={{ fontFamily: font }}
          >
            {moodEmoji[mood]} {moodMessage[mood]}
          </motion.div>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--mood-text, #f5f5f5)', fontFamily: font }}>
            {greeting}, {userName || 'Explorer'} {moodEmoji[mood]}
          </h1>
          <p style={{ color: 'var(--mood-text-muted, #999)' }} className="mt-1">
            Today you're feeling <motion.span animate={{ color: accent }} className="font-bold">{mood}</motion.span> · Score: {moodScore}/10
          </p>
        </motion.div>

        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <GlassCard>
            <div className="flex items-center gap-3">
              <motion.div className="p-2 rounded-xl" animate={{ backgroundColor: `${accent}20` }}>
                <Activity size={18} style={{ color: accent }} />
              </motion.div>
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--mood-text-muted, #999)' }}>Current Mood</p>
                <p className="text-xl font-bold capitalize" style={{ color: 'var(--mood-text, #f5f5f5)' }}>{mood} {moodEmoji[mood]}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: 'var(--mood-accent-soft, rgba(255,255,255,0.05))' }}>
                <TrendingUp size={18} style={{ color: accent }} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--mood-text-muted, #999)' }}>Mood Score</p>
                <p className="text-xl font-bold" style={{ color: 'var(--mood-text, #f5f5f5)' }}>{moodScore}/10</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: 'var(--mood-accent-soft, rgba(255,255,255,0.05))' }}>
                <Flame size={18} style={{ color: accent }} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--mood-text-muted, #999)' }}>Streak</p>
                <p className="text-xl font-bold" style={{ color: 'var(--mood-text, #f5f5f5)' }}>{streakCount} days 🔥</p>
              </div>
            </div>
          </GlassCard>
          <Link to="/journal">
            <GlassCard className="h-full cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: 'var(--mood-accent-soft, rgba(255,255,255,0.05))' }}>
                  <BookHeart size={18} style={{ color: accent }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--mood-text-muted, #999)' }}>Journal</p>
                  <p className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--mood-text, #f5f5f5)' }}>Quick check-in <ArrowRight size={14} /></p>
                </div>
              </div>
            </GlassCard>
          </Link>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <GlassCard title="Mood Trend" icon={<TrendingUp size={16} />} className="lg:col-span-2">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accent} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke={`${accent}60`} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} stroke={`${accent}60`} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--mood-bg, #0A0A0A)', border: `1px solid ${accent}30`, borderRadius: '12px', fontSize: '12px', color: 'var(--mood-text, #fff)' }} />
                  <Area type="monotone" dataKey="score" stroke={accent} strokeWidth={2.5} fill="url(#moodGrad)" dot={{ fill: accent, strokeWidth: 0, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
          <GlassCard title="Emotion Frequency" icon={<Activity size={16} />}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--mood-bg, #0A0A0A)', border: `1px solid ${accent}30`, borderRadius: '12px', fontSize: '12px', color: 'var(--mood-text, #fff)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Weekly insight + bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <GlassCard title="Your Week in Emotions" icon={<Sparkles size={16} />}>
            <p className="text-xs mb-3" style={{ color: 'var(--mood-text-muted, #666)' }}>{weeklyInsight.dateRange}</p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--mood-text, #ccc)' }}>{weeklyInsight.summary}</p>
            <motion.div className="p-3 rounded-xl border" animate={{ backgroundColor: `${accent}10`, borderColor: `${accent}20` }}>
              <p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: accent }}>Reflection</p>
              <p className="text-sm italic" style={{ color: 'var(--mood-text-muted, #999)' }}>{weeklyInsight.reflection}</p>
            </motion.div>
            
            <motion.button 
              onClick={() => setShowWrapped(true)}
              className="mt-4 w-full p-4 rounded-xl border flex items-center justify-between font-bold"
              style={{
                background: `linear-gradient(45deg, ${accent}30, transparent)`,
                borderColor: `${accent}40`,
                color: 'var(--mood-text, #f5f5f5)'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: accent }} />
                Weekly Review
              </span>
              <ArrowRight size={18} />
            </motion.button>

          </GlassCard>
          <GlassCard title="Emotion Distribution" icon={<Activity size={16} />}>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke={`${accent}60`} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={`${accent}60`} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--mood-bg, #0A0A0A)', border: `1px solid ${accent}30`, borderRadius: '12px', fontSize: '12px', color: 'var(--mood-text, #fff)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Bottom cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard>
            <motion.div className="p-3 rounded-xl border mb-4" animate={{ backgroundColor: `${accent}08`, borderColor: `${accent}15` }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: accent }}>Lumina Remembered</p>
              <p className="text-sm italic" style={{ color: 'var(--mood-text, #ccc)' }}>
                "Last week work was weighing on you — how's that feeling now? You mentioned a 10-minute walk helped before."
              </p>
            </motion.div>
            <div className="p-3 rounded-xl border" style={{ background: 'var(--mood-card-bg, rgba(255,255,255,0.03))', borderColor: 'var(--mood-card-border, rgba(255,255,255,0.06))' }}>
              <p className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: 'var(--mood-text-muted, #999)' }}>Pattern Detected</p>
              <p className="text-sm" style={{ color: 'var(--mood-text, #ccc)' }}>
                You've felt anxious around work 3 days in a row. Talking to friends seems to improve your mood consistently.
              </p>
            </div>
          </GlassCard>
          <GlassCard title="Recent Timeline" icon={<Calendar size={16} />}>
            <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-2">
              {demoEntries.map((e) => (
                <div key={e.id} className="flex items-start gap-3 p-2 rounded-xl transition-colors" style={{ background: 'transparent' }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = `${accent}08`)}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                >
                  <span className="text-lg">{moodEmoji[e.mood]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: 'var(--mood-text-muted, #999)' }}>{e.dayLabel} · Score: {e.moodScore}/10</p>
                    <p className="text-sm truncate" style={{ color: 'var(--mood-text, #ccc)' }}>{e.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
