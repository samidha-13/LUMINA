import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, MessageCircle, Activity, Heart, Zap, Shield, Eye, Sparkles, ArrowRight, ChevronRight, Star, Quote, Check, X } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { useRef } from 'react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

const stagger = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
};

const features = [
  { icon: MessageCircle, title: 'AI Emotional Chatbot', desc: 'A companion that truly listens and understands your emotional context.' },
  { icon: Brain, title: 'Brain & Memory Map', desc: 'Visualize your emotional connections, triggers, and important relationships.' },
  { icon: Activity, title: 'Emotional Trend Tracking', desc: 'See how your emotions evolve over days, weeks, and months.' },
  { icon: Zap, title: 'Trigger Detection', desc: 'Automatically identify recurring emotional triggers and patterns.' },
  { icon: Eye, title: 'Weekly Insight Summaries', desc: 'Get personalized reflections and actionable insights every week.' },
  { icon: Heart, title: 'Context-Aware Support', desc: 'Lumina remembers your story and adapts its support to your needs.' },
  { icon: Sparkles, title: 'Emotion Vocabulary Expansion', desc: 'Go beyond "fine" — discover the true language of your feelings.' },
  { icon: Shield, title: 'Culturally Sensitive Guidance', desc: 'Personalized tone and approach that respects your background.' },
];

const steps = [
  { num: '01', title: 'Tell Lumina how you feel', desc: 'Share your thoughts, emotions, or just check in with a daily mood entry.' },
  { num: '02', title: 'Lumina detects emotions & triggers', desc: 'Advanced emotional intelligence identifies what you\'re really feeling.' },
  { num: '03', title: 'Your patterns & memory map update', desc: 'Every interaction enriches your personal emotional landscape.' },
  { num: '04', title: 'Get personalized insights', desc: 'Receive thoughtful guidance based on your unique emotional journey.' },
];

const testimonials = [
  { name: 'Sarah M.', role: 'Designer', text: 'Lumina helped me realize my work anxiety was connected to a childhood pattern. That insight changed everything.', rating: 5 },
  { name: 'James K.', role: 'Engineer', text: 'I\'ve never been good at expressing feelings. Lumina\'s vocabulary expansion showed me words I didn\'t know I needed.', rating: 5 },
  { name: 'Priya R.', role: 'Therapist', text: 'As a therapist, I\'m impressed. Lumina bridges the gap between sessions beautifully. I recommend it to my clients.', rating: 5 },
];

const comparisons = [
  { feature: 'Remembers emotional context', lumina: true, others: false },
  { feature: 'Understands recurring triggers', lumina: true, others: false },
  { feature: 'Expands emotional vocabulary', lumina: true, others: false },
  { feature: 'Adapts tone to your mood', lumina: true, others: false },
  { feature: 'Tracks long-term patterns', lumina: true, others: false },
  { feature: 'Brain & memory visualization', lumina: true, others: false },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Conversations' },
  { value: '98%', label: 'Feel Understood' },
  { value: '4.9', label: 'User Rating' },
];

const LandingPage = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="pt-16">
      {/* ============= HERO ============= */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero background image */}
        <motion.div style={{ y: heroImageY, opacity: heroOpacity }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black z-10" />
          <img
            src="/images/hero-emotions.png"
            alt="Emotional Intelligence"
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>

        {/* Subtle ambient glows */}
        <div className="absolute inset-0 overflow-hidden z-[5]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/3 rounded-full blur-[150px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/2 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-sm text-neutral-300 font-medium">AI-Powered Emotional Intelligence</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-extrabold tracking-tight leading-[0.95] mb-8">
              <span className="block text-white">Understand your</span>
              <span className="block text-gradient-shimmer">emotions.</span>
              <span className="block text-neutral-400 text-4xl sm:text-5xl lg:text-6xl mt-2 font-semibold">Heal with Lumina.</span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              An emotionally intelligent AI companion that listens, remembers, and helps you track your feelings, triggers, and emotional growth.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="group px-8 py-4 rounded-2xl bg-white text-black font-display font-bold text-lg hover:bg-neutral-200 transition-all flex items-center gap-3 glow-indigo"
              >
                Start Your Journey
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-2xl border border-white/10 text-white font-display font-medium text-lg hover:bg-white/5 transition-all backdrop-blur-sm"
              >
                See How It Works
              </a>
            </div>

          </motion.div>

          {/* Floating tags */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 flex flex-wrap justify-center gap-3"
          >
            {['Mood Tracking', 'Brain Map', 'AI Chat', 'Insights', 'Journaling', 'Pattern Detection'].map((label, i) => (
              <div key={label} className="px-5 py-2.5 rounded-full border border-white/8 bg-white/3 backdrop-blur-sm text-sm font-medium text-neutral-300 animate-float" style={{ animationDelay: `${i * 0.7}s` }}>
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 rounded-full bg-white"
            />
          </div>
        </motion.div>
      </section>

      {/* ============= STATS BAR ============= */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= EMOTIONAL CONNECTION VISUAL ============= */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp}>
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-4">Emotional Intelligence</p>
              <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6 leading-tight">
                An AI that truly <span className="text-gradient-primary">understands</span> you
              </h2>
              <p className="text-lg text-neutral-400 leading-relaxed mb-8">
                Unlike generic chatbots, Lumina builds a deep understanding of your emotional world. It remembers your stories, recognizes patterns, and provides support that actually resonates.
              </p>
              <div className="space-y-4">
                {['Remembers your emotional history', 'Adapts its tone to how you feel', 'Identifies recurring patterns'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-white" />
                    </div>
                    <span className="text-neutral-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-white/5 to-transparent rounded-3xl blur-xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10">
                <img
                  src="/images/emotional-connection.png"
                  alt="Emotional Connection - AI Understanding"
                  className="w-full h-auto parallax-img"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============= FEATURES ============= */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20">
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Everything you need to{' '}
              <span className="text-gradient-accent">understand yourself</span>
            </h2>
            <p className="text-lg text-neutral-500 max-w-xl mx-auto">
              Lumina combines emotional AI with beautiful visualization to help you grow.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} {...stagger} transition={{ delay: i * 0.06, duration: 0.5 }}>
                <GlassCard className="h-full group">
                  <div className="p-2.5 bg-white/5 rounded-xl w-fit mb-4 group-hover:bg-white/10 transition-colors">
                    <f.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-display font-semibold mb-2 text-white">{f.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= EMOTIONAL GROWTH IMAGE SECTION ============= */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeUp}
              className="relative order-2 lg:order-1"
            >
              <div className="absolute -inset-4 bg-gradient-to-bl from-white/5 to-transparent rounded-3xl blur-xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10">
                <img
                  src="/images/emotional-growth.png"
                  alt="Emotional Growth Journey"
                  className="w-full h-auto parallax-img"
                />
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="order-1 lg:order-2">
              <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-4">Your Journey</p>
              <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6 leading-tight">
                Watch yourself <span className="text-gradient-primary">grow</span>
              </h2>
              <p className="text-lg text-neutral-400 leading-relaxed mb-8">
                Every conversation with Lumina contributes to your emotional growth map. See your progress unfold over weeks and months — patterns dissolve, self-awareness deepens, and resilience builds.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-white font-display font-semibold hover:gap-3 transition-all"
              >
                Start growing today <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============= HOW IT WORKS ============= */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20">
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-4">Process</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              How <span className="text-gradient-primary">Lumina</span> works
            </h2>
          </motion.div>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div key={step.num} {...stagger} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <GlassCard className="flex items-start gap-6 group">
                  <div className="text-4xl font-display font-extrabold text-white/10 group-hover:text-white/20 transition-colors">{step.num}</div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-lg mb-1 text-white">{step.title}</h3>
                    <p className="text-neutral-500 text-sm">{step.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight size={20} className="text-white/10 ml-auto flex-shrink-0 hidden sm:block" />
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= BRAIN VISUALIZATION ============= */}
      <section className="relative py-0 overflow-hidden">
        <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
            <img
              src="/images/brain-emotions.png"
              alt="Brain Emotional Pathways"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <motion.div {...fadeUp} className="relative z-20 text-center px-6 max-w-3xl">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 text-white">
              Your mind, visualized.
            </h2>
            <p className="text-lg text-neutral-300 mb-8">
              Lumina's Brain Map creates a living visualization of your emotional landscape — showing connections, triggers, and growth areas you never knew existed.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-display font-bold text-lg hover:bg-neutral-200 transition-all"
            >
              Explore Your Mind <Brain size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============= WHY DIFFERENT ============= */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-4">Comparison</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Why Lumina is <span className="text-gradient-accent">different</span>
            </h2>
          </motion.div>

          <motion.div {...fadeUp}>
            <GlassCard>
              <div className="grid grid-cols-3 gap-4 text-sm font-semibold mb-4 px-4">
                <div className="text-neutral-500">Feature</div>
                <div className="text-center text-white">Lumina</div>
                <div className="text-center text-neutral-600">Others</div>
              </div>
              {comparisons.map((c, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 text-sm px-4 py-3 border-t border-white/5">
                  <div className="text-neutral-300">{c.feature}</div>
                  <div className="text-center">
                    <Check size={16} className="inline text-white" />
                  </div>
                  <div className="text-center">
                    <X size={16} className="inline text-neutral-700" />
                  </div>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ============= TESTIMONIALS ============= */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mb-4">Testimonials</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              What people are <span className="text-gradient-primary">saying</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} {...stagger} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <GlassCard className="h-full">
                  <Quote size={20} className="text-white/10 mb-4" />
                  <p className="text-sm text-neutral-300 leading-relaxed mb-6">{t.text}</p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={12} className="fill-white text-white" />
                    ))}
                  </div>
                  <p className="font-display font-semibold text-sm text-white">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= FINAL CTA ============= */}
      <section className="relative py-0 overflow-hidden">
        <div className="relative min-h-[80vh] flex items-center justify-center">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black z-10" />
            <img
              src="/images/inner-peace.png"
              alt="Inner Peace and Emotional Wellbeing"
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <motion.div {...fadeUp} className="relative z-20 text-center px-6 max-w-3xl">
            <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 text-white leading-tight">
              Start your emotional journey today.
            </h2>
            <p className="text-lg text-neutral-400 mb-12 max-w-xl mx-auto">
              Your feelings matter. Let Lumina help you understand them — one conversation at a time.
            </p>
            <Link
              to="/auth"
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-black font-display font-bold text-lg hover:bg-neutral-200 transition-all glow-indigo"
            >
              Begin Your Journey
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-xs text-neutral-600 mt-6">No credit card required · Free to start · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ============= FOOTER ============= */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-white to-neutral-400" />
              <span className="font-display font-bold text-white">Lumina</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-neutral-600">
              <a href="#" className="hover:text-neutral-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-neutral-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-neutral-300 transition-colors">Support</a>
            </div>
            <span className="text-sm text-neutral-700">© 2026 Lumina. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
