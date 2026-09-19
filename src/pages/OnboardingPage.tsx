import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import LuminaMascot, { MascotExpression } from '@/components/LuminaMascot';
import EmotionChip from '@/components/EmotionChip';

const questions = [
  { id: 'name', type: 'text', text: "Hi, I'm Lumina. What's your name?", placeholder: 'Your name...', mascot: 'curious' as MascotExpression },
  { id: 'family', type: 'text', text: 'Who are the most important family members in your life? (names or roles, comma separated)', placeholder: 'Names or roles...', mascot: 'listening' as MascotExpression },
  { id: 'family_feel', type: 'text', text: 'How do you feel around your family? What emotion comes up most?', placeholder: 'Your emotions...', mascot: 'empathetic' as MascotExpression },
  { id: 'friends', type: 'text', text: 'Who are your closest friends? (1–3 names)', placeholder: 'Names...', mascot: 'curious' as MascotExpression },
  { id: 'friends_feel', type: 'text', text: "When you're with your friends, how do you feel?", placeholder: 'Your emotions...', mascot: 'supportive' as MascotExpression },
  { id: 'relationship', type: 'text', text: "Are you in a relationship? If yes, what's their name?", placeholder: 'Yes/No, name...', mascot: 'curious' as MascotExpression },
  { id: 'relationship_feel', type: 'text', text: "How does your relationship with [name] make you feel?\n(If single: How does being single feel for you right now?)", placeholder: 'Your feelings...', mascot: 'listening' as MascotExpression },
  { id: 'difficult_person', type: 'text', text: "Is there anyone who causes you stress or conflict — a person who makes life harder?", placeholder: 'Name or role...', mascot: 'thoughtful' as MascotExpression },
  { id: 'difficult_emo', type: 'text', text: "What emotion does [that person] bring out in you?", placeholder: 'Your emotions...', mascot: 'empathetic' as MascotExpression },
  { id: 'work', type: 'text', text: "What kind of work or study are you currently doing?", placeholder: 'Your work or field...', mascot: 'thoughtful' as MascotExpression },
  { id: 'work_feel', type: 'text', text: "How does your work/study make you feel?", placeholder: 'Your emotions...', mascot: 'empathetic' as MascotExpression },
  { id: 'health', type: 'text', text: "How is your physical and mental health lately?", placeholder: 'Your health...', mascot: 'supportive' as MascotExpression },
  { id: 'health_feel', type: 'text', text: "What emotion comes up when you think about your health?", placeholder: 'Your emotions...', mascot: 'listening' as MascotExpression },
  { id: 'finance', type: 'text', text: "How are things financially for you?", placeholder: 'Financial situation...', mascot: 'thoughtful' as MascotExpression },
  { id: 'finance_feel', type: 'text', text: "What emotion does thinking about money bring up?", placeholder: 'Your emotions...', mascot: 'listening' as MascotExpression },
  { id: 'hobbies', type: 'text', text: "What do you love doing in your free time?", placeholder: 'Your hobbies...', mascot: 'encouraging' as MascotExpression },
  { id: 'hobbies_feel', type: 'text', text: "What do your hobbies or free time make you feel?", placeholder: 'Your emotions...', mascot: 'encouraging' as MascotExpression },
  { id: 'past', type: 'text', text: "Is there something difficult from your past — school, family, a relationship — that still affects how you feel today?", placeholder: 'Share as much or as little as you like...', mascot: 'empathetic' as MascotExpression },
  { id: 'past_feel', type: 'text', text: "What emotion does [that past experience] still bring up for you today?", placeholder: 'Your emotions...', mascot: 'empathetic' as MascotExpression },
  { id: 'struggle', type: 'text', text: "What's the biggest struggle or challenge weighing on you right now?", placeholder: 'What\'s on your mind...', mascot: 'supportive' as MascotExpression },
  { id: 'struggle_feel', type: 'text', text: "How does [that struggle] make you feel?", placeholder: 'Your emotions...', mascot: 'empathetic' as MascotExpression },
  { id: 'triggers', type: 'text', text: "What kinds of situations trigger strong emotions in you — even if you're unsure why?", placeholder: 'Trigger situations...', mascot: 'thoughtful' as MascotExpression },
  { id: 'trigger_feel', type: 'text', text: "What emotion does that trigger most strongly?", placeholder: 'Your emotions...', mascot: 'empathetic' as MascotExpression },
  { id: 'scale', type: 'slider', text: "On a scale of 1–10 how are you feeling right now? (1 = very low, 10 = great)", min: 1, max: 10, mascot: 'curious' as MascotExpression },
  { id: 'hope', type: 'text', text: "What's one thing you're really hoping for or working towards?", placeholder: 'Your hope...', mascot: 'encouraging' as MascotExpression },
  { id: 'end', type: 'end', text: "Thank you. I'm starting to understand your emotional world. Let's begin.", mascot: 'celebrating' as MascotExpression }
];

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedChips, setSelectedChips] = useState<Record<string, string[]>>({});
  const [sliderValue, setSliderValue] = useState(7);
  const navigate = useNavigate();
  const { setOnboardingComplete, setUserName, setMoodScore } = useMood();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const q = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  useEffect(() => {
    // Hide UI of brain iframe
    if (iframeRef.current) {
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'HIDE_UI' }, '*');
      }, 1000);
    }

    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'GRAPH_DATA') {
        const userId = localStorage.getItem("lumina_userId") || "";
        if (userId) {
          fetch("http://localhost:5000/api/onboarding/legacy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              answers: { ...answers, ...selectedChips, scale: sliderValue },
              brainData: e.data.data
            })
          }).catch(console.error);

          fetch('http://localhost:5000/api/brain-map/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              nodes: e.data.data.nodes,
              edges: e.data.data.edges,
              profile: e.data.data.profile
            })
          }).catch(console.error);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [answers, selectedChips, sliderValue]);

  const mapQuestionIdToBrain = (id: string) => {
    const map: Record<string, string> = {
      name: 'q_name', family: 'q_family', family_feel: 'q_family_emo',
      friends: 'q_friends', friends_feel: 'q_friends_emo',
      relationship: 'q_partner', relationship_feel: 'q_partner_emo',
      difficult_person: 'q_difficult_person', difficult_emo: 'q_difficult_emo',
      work: 'q_work', work_feel: 'q_work_emo',
      health: 'q_health', health_feel: 'q_health_emo',
      finance: 'q_finance', finance_feel: 'q_finance_emo',
      hobbies: 'q_hobbies', hobbies_feel: 'q_hobbies_emo',
      past: 'q_past', past_feel: 'q_past_emo',
      struggle: 'q_current_struggle', struggle_feel: 'q_current_emo',
      triggers: 'q_trigger', trigger_feel: 'q_trigger_emo',
      scale: 'q_mood', hope: 'q_dream'
    };
    return map[id] || id;
  };

  const handleNext = () => {
    if (q.id === 'name' && answers.name) {
      setUserName(answers.name);
    }

    let val = '';
    if (q.type === 'text') val = answers[q.id] || '';
    else if (q.type === 'chips') val = (selectedChips[q.id] || []).join(', ');
    else if (q.type === 'slider') val = sliderValue.toString();

    if (val && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({
        type: 'PROCESS_ANSWER',
        qId: mapQuestionIdToBrain(q.id),
        value: val
      }, '*');
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Get the final graph
      iframeRef.current?.contentWindow?.postMessage({ type: 'GET_GRAPH' }, '*');

      // Build structured answers array for MongoDB
      const allAnswers = questions
        .filter(qItem => qItem.type !== 'end')
        .map(qItem => ({
          question: qItem.text,
          answer: qItem.type === 'slider'
            ? sliderValue.toString()
            : answers[qItem.id] || ''
        }));

      // Save onboarding answers to MongoDB
      const userId = localStorage.getItem("lumina_userId") || "";
      if (userId) {
        fetch('http://localhost:5000/api/onboarding/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, answers: allAnswers })
        }).catch(console.error);
      }

      setTimeout(() => {
        setOnboardingComplete(true);
        setMoodScore(sliderValue);
        navigate('/daily');
      }, 500);
    }
  };

  const toggleChip = (qId: string, chip: string) => {
    const current = selectedChips[qId] || [];
    setSelectedChips({
      ...selectedChips,
      [qId]: current.includes(chip) ? current.filter(c => c !== chip) : [...current, chip],
    });
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Hidden iframe to process and save brain map state in background */}
      <iframe ref={iframeRef} src="/brain/index.html" style={{ display: 'none' }} title="Lumina Brain Processor" />

      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-white/3 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-white/2 rounded-full blur-[120px]" />

      <div className="w-full max-w-lg relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-white to-neutral-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-right">{step + 1} / {questions.length}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-3xl p-8"
          >
            {/* Mascot - shown on every screen */}
            <div className="flex justify-center mb-6">
              <LuminaMascot expression={q.mascot} size={100} />
            </div>

            {(q.type === 'intro' || q.type === 'end') && (
              <div className="text-center">
                <p className="text-lg font-display leading-relaxed text-foreground/90">{q.text}</p>
                {q.type === 'end' && <Check size={32} className="mx-auto mt-6 text-white" />}
              </div>
            )}

            {q.type === 'text' && (
              <div>
                <p className="text-lg font-display mb-6 leading-relaxed">
                  {q.text.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < q.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
                <input
                  type="text"
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  autoFocus
                />
              </div>
            )}



            {q.type === 'slider' && (
              <div>
                <p className="text-lg font-display mb-6 leading-relaxed">{q.text}</p>
                <div className="text-center">
                  <span className="text-5xl font-display font-bold text-gradient-primary">{sliderValue}</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={sliderValue}
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    className="w-full mt-4 accent-white"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Very low</span>
                    <span>Great</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => step > 0 && setStep(step - 1)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-white text-black text-sm font-semibold glow-indigo hover:bg-neutral-200 transition-all"
              >
                {step === questions.length - 1 ? "Let's Begin" : 'Continue'} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;
