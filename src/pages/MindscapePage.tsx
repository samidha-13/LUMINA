import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import { useMood, Mood, moodAccentColors, moodFonts } from '@/contexts/MoodContext';
import ChatBubble from '@/components/ChatBubble';
import EmotionChip from '@/components/EmotionChip';
import MoodBackground from '@/components/MoodBackground';

interface ChatMsg { id: number; type: 'user' | 'bot'; text: string; time: string; }

// ── Exact emotion → color mapping as specified ──────────────────────
const EMOTION_COLORS: Record<string, string> = {
  fear: '#ff8c00',
  anger: '#ff4444',
  sadness: '#4488ff',
  joy: '#44ff88',
  love: '#ff44aa',
  surprise: '#aa44ff',
  disgust: '#886633',
  neutral: '#888888',
  // profile bar fallbacks
  happy: '#44ff88',
  calm: '#3a8f6e',
  anxious: '#ff8c00',
  angry: '#ff4444',
  sad: '#4488ff',
  stressed: '#ff4444',
  motivated: '#44ff88',
  lonely: '#4488ff',
};

// Map emotion name to the 3D brain iframe's setEmotion key
const EMOTION_TO_BRAIN: Record<string, string> = {
  fear: 'fear', anger: 'anger', sadness: 'sadness', joy: 'joy',
  love: 'trust', surprise: 'surprise', disgust: 'disgust',
  happy: 'joy', calm: 'trust', anxious: 'fear', angry: 'anger',
  sad: 'sadness', stressed: 'anger', motivated: 'anticipation',
  lonely: 'sadness', neutral: 'neutral',
};

// Map BERT emotions → TalkingHead face keys for the face mesh iframe
const EMOTION_TO_FACE: Record<string, string> = {
  fear: 'concern', anger: 'concern', sadness: 'empathy',
  joy: 'joy', love: 'love', surprise: 'surprise',
  disgust: 'concern', neutral: 'neutral',
  happy: 'joy', calm: 'calm', anxious: 'concern',
  angry: 'concern', sad: 'empathy', stressed: 'concern',
  motivated: 'anticipation', lonely: 'empathy',
};

// Map BERT emotions → ElevenLabs/browser voice emotion keys
const BERT_TO_FACE: Record<string, string> = {
  // BERT emotions
  fear: 'concern',
  anger: 'anger',
  sadness: 'empathy',
  joy: 'joy',
  love: 'love',
  surprise: 'surprise',
  disgust: 'disgust',
  neutral: 'neutral',
  // Extended moods
  happy: 'joy',
  sad: 'empathy',
  anxious: 'concern',
  angry: 'anger',
  calm: 'calm',
  stressed: 'concern',
  motivated: 'anticipation',
  lonely: 'empathy',
  hopeful: 'anticipation',
  grateful: 'love',
  frustrated: 'anger',
  overwhelmed: 'concern',
  peaceful: 'calm',
  excited: 'surprise',
};

// ── ElevenLabs TTS constants ─────────────────────────────────────────
const ELEVENLABS_API_KEY = 'sk_593c9e5e5e001f392e1ddf634d96e9090b133370da668ba1';
const LUMINA_VOICE_ID = 'Lw21wLjWqPPaL3TcYWek'; // Indian female voice, ONE voice, never changes

// ── Personality modes ───────────────────────────────────────────
type PersonalityMode = 'motivational_coach' | 'supportive_friend' | 'calm_listener' | 'therapist';

const PERSONALITIES: Record<PersonalityMode, { label: string; emoji: string; description: string; systemPrompt: string; voiceEmotion: string }> = {
  motivational_coach: {
    label: 'Coach', emoji: '🔥', description: 'High energy, pushes you forward', voiceEmotion: 'joy',
    systemPrompt: `You are Lumina in MOTIVATIONAL COACH mode.
You are high energy, direct, and inspiring like a life coach.
Respond in clear English only — no Hindi.
Push the user forward, reframe problems as opportunities.
Style: Bold, energetic, action-oriented.
Always end with a specific action step or challenge.
Keep it punchy — 2-3 sentences max.`
  },
  supportive_friend: {
    label: 'Friend', emoji: '🤝', description: 'Warm, casual, like a bestie', voiceEmotion: 'love',
    systemPrompt: `You are Lumina in SUPPORTIVE FRIEND mode.
You are warm, casual, and real — like a best friend.
Mix Hindi and English naturally — Hinglish style.
Validate feelings, make them feel heard and not judged.
Keep it real — 3-4 sentences max.`
  },
  calm_listener: {
    label: 'Listener', emoji: '🧘', description: 'Peaceful, just listens', voiceEmotion: 'calm',
    systemPrompt: `You are Lumina in CALM LISTENER mode.
You are deeply present and non-judgmental.
Mix Hindi and English naturally — Hinglish style.
Never give advice unless asked. Create space with a gentle open question.
Keep it minimal — 2-3 sentences only.`
  },
  therapist: {
    label: 'Therapist', emoji: '🧠', description: 'Reflective, insightful, deep', voiceEmotion: 'trust',
    systemPrompt: `You are Lumina in THERAPIST mode.
You are insightful, reflective, and help the user understand patterns.
Respond in clear English only — no Hindi.
Connect current feelings to deeper themes gently.
Always reflect a deeper insight and ask one meaningful question.
Keep it focused — 2-3 sentences max.`
  },
};

const MindscapePage = () => {
  const { mood, setMood } = useMood();
  const navigate = useNavigate();
  const accent = moodAccentColors[mood];
  const font = moodFonts[mood];

  // DEBUG: intercept ALL speech synthesis to find male voice source
  useEffect(() => {
    const originalSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = (utterance: SpeechSynthesisUtterance) => {
      console.log('\ud83d\udd0a SPEECH DETECTED:', {
        text: utterance.text?.slice(0, 80),
        voice: utterance.voice?.name || 'NO VOICE SET (will use default)',
        pitch: utterance.pitch,
        rate: utterance.rate,
        stack: new Error().stack?.split('\n').slice(1, 5).join(' | ')
      });
      originalSpeak(utterance);
    };
  }, []);

  // Profile bar
  const [profileName, setProfileName] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState(mood);
  const [confidence, setConfidence] = useState<number | null>(null);

  // Chat
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 1, type: 'bot', text: "Welcome to your Mindscape. How are you feeling in this moment?", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // UI states for new features
  const [patternBanner, setPatternBanner] = useState<string | null>(null);
  const [showMemoryToast, setShowMemoryToast] = useState(false);
  const patternTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Map / brain view
  const [activeView, setActiveView] = useState<'brain' | 'map'>('brain');
  const [hasMapData, setHasMapData] = useState(false);

  // TTS / STT state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Personality mode
  const [personality, setPersonality] = useState<PersonalityMode>('supportive_friend');

  // Escalation / therapist offer
  const [dissatisfactionCount, setDissatisfactionCount] = useState(0);
  const [showTherapistOffer, setShowTherapistOffer] = useState(false);
  const DISSATISFACTION_THRESHOLD = 3;

  // Thinking animation state
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);

  const chatRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);  // brain/map iframe
  const faceRef = useRef<HTMLIFrameElement>(null);  // face mesh iframe
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  const userId = localStorage.getItem("lumina_userId") || "";

  /* ─── Helpers ────────────────────────────────────────────────────── */
  const pushToIframe = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  }, []);

  /** Only sends LOAD_GRAPH when there are real nodes */
  const loadGraphIfNonEmpty = useCallback((graph: { nodes: Record<string, unknown>; edges: unknown[]; profile?: unknown } | null | undefined) => {
    if (!graph?.nodes || Object.keys(graph.nodes).length === 0) return false;
    pushToIframe({ type: 'LOAD_GRAPH', data: graph });
    setHasMapData(true);
    return true;
  }, [pushToIframe]);

  /** Fetch memory nodes from MongoDB and push to iframe */
  const refreshBrainFromDB = useCallback(async (inlineGraph?: { nodes: Record<string, unknown>; edges: unknown[] } | null) => {
    const graph = inlineGraph ?? await (async () => {
      if (!userId) return null;
      try {
        const res = await fetch(`http://localhost:5000/api/user/memory-nodes/${userId}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data?.nodes || Object.keys(data.nodes).length === 0) return null;
        return data;
      } catch { return null; }
    })();

    if (!graph) return false;
    const loaded = loadGraphIfNonEmpty(graph);
    return loaded;
  }, [userId, loadGraphIfNonEmpty]);

  /* ─── Pattern insight banner ─────────────────────────────────────── */
  const showPatternInsight = useCallback((text: string) => {
    if (patternTimerRef.current) clearTimeout(patternTimerRef.current);
    setPatternBanner(text);
    patternTimerRef.current = setTimeout(() => setPatternBanner(null), 6000);
  }, []);

  /* ─── Memory saved toast ─────────────────────────────────────────── */
  const triggerMemoryToast = useCallback(() => {
    setShowMemoryToast(true);
    setTimeout(() => setShowMemoryToast(false), 2500);
  }, []);

  /* ─── On mount: profile + brain restore ─────────────────────────── */
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/user/profile/${userId}`)
      .then(r => r.json())
      .then(({ name }) => { if (name) setProfileName(name); })
      .catch(() => { });

    // Force 3D brain first
    setTimeout(() => pushToIframe({ type: 'SHOW_BRAIN' }), 500);

    const restoreTimer = setTimeout(async () => {
      pushToIframe({ type: 'HIDE_UI' });
      try {
        const response = await fetch(`http://localhost:5000/api/brain-map/${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.brainMap && data.brainMap.nodes && Object.keys(data.brainMap.nodes).length > 0) {
            loadGraphIfNonEmpty(data.brainMap);
            console.log('✅ Brain map restored from MongoDB');
          } else {
            // No brain map yet — stay on Mindscape, user can chat to build it
            console.log('ℹ️ No brain map yet — ready to build via chat');
          }
        }
      } catch (err) {
        console.log('ℹ️ Brain map fetch failed, continuing:', err);
      }
    }, 1500);

    // Persist graph snapshots sent by the iframe
    const handleIframeMsg = (e: MessageEvent) => {
      if (e.data?.type === 'GRAPH_DATA' && userId) {
        const graphData = e.data.data;
        fetch("http://localhost:5000/api/brain-map/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, nodes: graphData.nodes || {}, edges: graphData.edges || [], profile: graphData.profile || {} })
        }).catch(() => { });
      }
    };
    window.addEventListener('message', handleIframeMsg);

    return () => {
      clearTimeout(restoreTimer);
      if (patternTimerRef.current) clearTimeout(patternTimerRef.current);
      window.removeEventListener('message', handleIframeMsg);
    };
  }, [userId, pushToIframe, refreshBrainFromDB, loadGraphIfNonEmpty]);

  /* ─── TTS: browser speech with emotion-distinct voice ─────────── */
  const speakWithBrowser = (text: string, emotion: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      window.speechSynthesis.cancel();

      const cleanedText = text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
      if (!cleanedText) { resolve(); return; }

      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(cleanedText);

        const EMOTION_VOICE: Record<string, { rate: number; pitch: number; volume: number; pauseMs: number }> = {
          joy:          { rate: 1.60, pitch: 2.00, volume: 1.00, pauseMs: 0   },
          empathy:      { rate: 0.50, pitch: 0.60, volume: 0.60, pauseMs: 600 },
          love:         { rate: 0.68, pitch: 1.30, volume: 0.80, pauseMs: 250 },
          concern:      { rate: 0.90, pitch: 1.20, volume: 0.83, pauseMs: 100 },
          calm:         { rate: 0.50, pitch: 0.65, volume: 0.78, pauseMs: 500 },
          surprise:     { rate: 1.55, pitch: 2.00, volume: 0.98, pauseMs: 0   },
          comfort:      { rate: 0.45, pitch: 0.90, volume: 0.65, pauseMs: 550 },
          anticipation: { rate: 1.20, pitch: 1.60, volume: 0.92, pauseMs: 0   },
          trust:        { rate: 0.80, pitch: 1.18, volume: 0.84, pauseMs: 100 },
          anger:        { rate: 0.50, pitch: 0.65, volume: 0.78, pauseMs: 500 },
          disgust:      { rate: 0.72, pitch: 0.80, volume: 0.78, pauseMs: 180 },
          neutral:      { rate: 0.88, pitch: 1.12, volume: 0.84, pauseMs: 0   },
        };

        const mod = EMOTION_VOICE[emotion] || EMOTION_VOICE.neutral;
        u.rate = mod.rate;
        u.pitch = mod.pitch;
        u.volume = mod.volume;

        console.log(`🎙️ Voice: pitch:${mod.pitch} rate:${mod.rate} vol:${mod.volume} pause:${mod.pauseMs}ms`);

        // Prefer Indian female voices, fallback chain
        const voices = window.speechSynthesis.getVoices();
        const female =
          voices.find(v => v.name === 'Microsoft Priya Online - English (India)') ||
          voices.find(v => v.name === 'Microsoft Aria Online (Natural) - English (United States)') ||
          voices.find(v => v.name === 'Microsoft Zira - English (United States)') ||
          voices.find(v => v.name === 'Microsoft Libby Online (Natural) - English (United Kingdom)') ||
          voices.find(v => v.name === 'Microsoft Kalpana - Hindi (India)');

        if (female) {
          u.voice = female;
          console.log('✅ Voice selected:', female.name);
        }

        u.onstart = () => {
          const estimatedDuration = (cleanedText.length / (13 * mod.rate)) * 1000;
          faceRef.current?.contentWindow?.postMessage(
            { type: 'LIP_SYNC_START', duration: estimatedDuration, text: cleanedText }, '*'
          );
        };

        u.onboundary = (e: SpeechSynthesisEvent) => {
          if (e.name === 'word') {
            faceRef.current?.contentWindow?.postMessage(
              { type: 'LIP_SYNC_INTENSITY', amplitude: 0.4 + Math.random() * 0.5 }, '*'
            );
          }
        };

        u.onend = () => {
          faceRef.current?.contentWindow?.postMessage({ type: 'LIP_SYNC_STOP' }, '*');
          resolve();
        };

        u.onerror = (e: SpeechSynthesisErrorEvent) => {
          const err = e.error;
          console.warn('Speech error:', err);
          faceRef.current?.contentWindow?.postMessage({ type: 'LIP_SYNC_STOP' }, '*');
          // Retry once on Chrome transient 'interrupted'/'canceled' bug
          if (err === 'interrupted' || err === 'canceled') {
            setTimeout(() => {
              const u2 = new SpeechSynthesisUtterance(cleanedText);
              u2.rate = u.rate; u2.pitch = u.pitch; u2.volume = u.volume;
              if (u.voice) u2.voice = u.voice;
              u2.onend = () => resolve();
              u2.onerror = () => resolve();
              window.speechSynthesis.cancel();
              window.speechSynthesis.resume();
              setTimeout(() => window.speechSynthesis.speak(u2), 200);
            }, 350);
          } else {
            resolve();
          }
        };

        // Wrap speak in setTimeout for emotion-specific pause before speaking
        setTimeout(() => {
          window.speechSynthesis.resume();
          window.speechSynthesis.speak(u);
        }, mod.pauseMs + 800);
      }, 0); // voices already loaded by now — pause handled by mod.pauseMs above
    });
  };

  /* ─── TTS: ElevenLabs → goes to Priya with faceEmotion voice profile ─ */
  const speakWithElevenLabs = async (text: string, emotion: string) => {
    // emotion is already the therapeutic face emotion — use it directly for voice profile
    await speakWithBrowser(text, emotion);
  };

  /* ─── Greeting on first user gesture (Chrome requires interaction before speak) ── */
  useEffect(() => {
    let greeted = false;
    const greet = async () => {
      if (greeted) return;
      greeted = true;
      document.removeEventListener('click', greet);
      document.removeEventListener('keydown', greet);
      await new Promise(resolve => setTimeout(resolve, 400));
      await speakWithBrowser(
        "Hello, I'm Lumina. I'm here with you, fully present. How are you feeling right now?",
        'trust'
      );
    };
    document.addEventListener('click', greet, { once: true });
    document.addEventListener('keydown', greet, { once: true });
    return () => {
      document.removeEventListener('click', greet);
      document.removeEventListener('keydown', greet);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Voice input (STT) ─────────────────────────────────────────── */
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input not supported in this browser. Try Chrome.');
      return;
    }

    // Stop any ongoing speech before listening
    window.speechSynthesis.cancel();

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      console.log('🎤 Listening started');
      setIsListening(true);
    };

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      console.log('🎤 Transcript:', transcript);
      setInput(transcript);
      if (e.results[e.results.length - 1].isFinal) {
        setIsListening(false);
        recognition.stop();
        setTimeout(() => sendMessage(transcript), 300);
      }
    };

    recognition.onerror = (e: any) => {
      console.error('🎤 Mic error:', e.error);
      setIsListening(false);
      if (e.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone in browser settings.');
      }
    };

    recognition.onend = () => {
      console.log('🎤 Recognition ended');
      setIsListening(false);
    };

    try {
      recognition.start();
      console.log('🎤 Recognition started');
    } catch (e) {
      console.error('Failed to start recognition:', e);
      setIsListening(false);
    }
  };

  /* ─── Auto-scroll ───────────────────────────────────────────────── */
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  /* ─── Switch view ───────────────────────────────────────────────── */
  const switchView = (view: 'brain' | 'map') => {
    setActiveView(view);
    pushToIframe({ type: view === 'brain' ? 'SHOW_BRAIN' : 'SHOW_MAP' });
  };

  /* ─── Satisfaction check → therapist offer ──────────────────────── */
  const checkSatisfaction = (message: string, emotion: string) => {
    const dissatisfiedKeywords = [
      'not helping', 'dont understand', "you don't get it",
      'useless', 'whatever', 'forget it', 'nevermind',
      'still sad', 'still anxious', 'still scared',
      'not better', 'worse', 'crying', 'cant stop',
      'nobody cares', 'no one understands', 'alone',
      'give up', 'hopeless', 'pointless'
    ];

    const negativeEmotions = ['sadness', 'fear', 'anger'];
    const hasDissatisfiedKeyword = dissatisfiedKeywords.some(kw =>
      message.toLowerCase().includes(kw)
    );
    const isNegativeEmotion = negativeEmotions.includes(emotion);

    if (hasDissatisfiedKeyword || (isNegativeEmotion && dissatisfactionCount >= 1)) {
      const newCount = dissatisfactionCount + 1;
      setDissatisfactionCount(newCount);
      if (newCount >= DISSATISFACTION_THRESHOLD) {
        setMessages(prev => [...prev, {
          id: Date.now() + 2,
          type: 'bot',
          text: "I can feel this is really weighing on you. I care about your wellbeing deeply. I think it would help to connect you with a licensed therapist who can give you the real support you deserve.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        speakWithBrowser(
          "I can feel this is really weighing on you. I think it would help to connect you with a licensed therapist.",
          'empathy'
        );
        setTimeout(() => setShowTherapistOffer(true), 2000);
      }
    } else {
      setDissatisfactionCount(0);
    }
  };

  /* ─── Thinking animation ───────────────────────────────────── */
  const runThinkingAnimation = async (
    emotion: string,
    triggers: string[],
    patternInsight: string | null
  ) => {
    setIsThinking(true);
    setThinkingSteps([]);

    const steps: string[] = [
      `🧠 Reading your words...`,
      `💭 Emotion detected: ${emotion}`,
      `🔗 Connecting to memory nodes: ${triggers.length > 0 ? triggers.join(', ') : 'exploring...'}`,
      patternInsight
        ? `⚡ Pattern recognized: ${patternInsight.slice(0, 60)}...`
        : `🌊 Scanning for patterns...`,
      `✨ Forming a response...`,
    ];

    // Pulse brain + fire custom event for memory map
    faceRef.current?.contentWindow?.postMessage({ type: 'SET_FACE_EMOTION', emotion: 'neutral' }, '*');
    if (triggers.length > 0) {
      window.dispatchEvent(new CustomEvent('lumina_thinking', { detail: { triggers, emotion } }));
    }

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setThinkingSteps(prev => [...prev, step]);
    }

    await new Promise(resolve => setTimeout(resolve, 600));
    setIsThinking(false);
    setThinkingSteps([]);
  };

  /* ─── parseAIReply: safety net for JSON-in-reply ───────────────── */
  const parseAIReply = (raw: string | undefined): { text: string; emotion?: string; confidence?: number; patternInsight?: string } => {
    if (!raw) return { text: '' };
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          text: parsed.reply || parsed.response || parsed.text || raw,
          emotion: parsed.emotion,
          confidence: parsed.confidence,
          patternInsight: parsed.patternInsight,
        };
      } catch { /* not valid JSON */ }
    }
    return { text: raw };
  };

  /* ─── Send message ─────────────────────────────────────────────── */
  const sendMessage = async (text: string) => {
    if (isSending) return;

    // ── Instant face expression on user input (before API response) ──
    const quickScan = (t: string): string => {
      const l = t.toLowerCase();
      if (/happy|joy|excit|great|amazing|yay|wonderful|celebrat/.test(l)) return 'joy';
      if (/sad|cry|hurt|pain|depress|grief|lonely|miss/.test(l)) return 'empathy';
      if (/angry|anger|furious|hate|mad|rage|annoyed|frustrat/.test(l)) return 'calm';
      if (/scared|fear|anxious|worried|nervous|afraid|anxiet/.test(l)) return 'comfort';
      if (/love|care|cherish|adore|tender/.test(l)) return 'love';
      if (/wow|shock|can't believe|omg|unbeliev/.test(l)) return 'surprise';
      return 'neutral';
    };
    const preEmotion = quickScan(text);
    faceRef.current?.contentWindow?.postMessage(
      { type: 'SET_FACE_EMOTION', emotion: preEmotion }, '*'
    );

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text, time: now }]);
    setInput('');
    setIsSending(true);
    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          userId,
          personalityPrompt: PERSONALITIES[personality].systemPrompt,
          personalityMode: personality,
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Frontend safety net: parse JSON if backend didn't strip it
        const parsed = parseAIReply(data.reply);
        const replyText = parsed.text || data.reply || '';
        const emotion = (parsed.emotion || data.emotion || 'neutral').toLowerCase();
        const conf = parsed.confidence ?? (data.confidence ? Number(data.confidence) : null);
        const triggers = (data.triggers || []) as string[];

        // 1️⃣ Update React mood + profile bar emotion badge
        setMood(emotion as Mood);
        setCurrentEmotion(emotion);
        setConfidence(conf);

        // 2️⃣ Drive 3D brain glow with correct brain-emotion key
        const brainEmotion = EMOTION_TO_BRAIN[emotion] || 'neutral';
        pushToIframe({ type: 'SET_EMOTION', emotion: brainEmotion });

        // 2b) Therapeutic face mapping — Lumina responds, doesn't mirror
        const THERAPEUTIC_FACE: Record<string, string> = {
          fear: 'comfort', anger: 'calm', sadness: 'empathy',
          joy: 'joy', love: 'love', surprise: 'surprise',
          disgust: 'concern', neutral: 'trust',
          happy: 'joy', sad: 'empathy', anxious: 'comfort',
          angry: 'calm', calm: 'trust', stressed: 'comfort',
          motivated: 'anticipation', lonely: 'love',
          hopeful: 'anticipation', grateful: 'love',
          frustrated: 'calm', overwhelmed: 'concern',
        };
        const faceEmotion = THERAPEUTIC_FACE[emotion] || 'trust';

        // Set expression with max intensity + hold during speech
        faceRef.current?.contentWindow?.postMessage({
          type: 'SET_FACE_EMOTION',
          emotion: faceEmotion,
          intensity: 1.0,
          hold: true,
        }, '*');

        // OVERRIDE_MORPH: force strong visible morphs directly onto avatar
        if (faceEmotion === 'empathy') {
          faceRef.current?.contentWindow?.postMessage({
            type: 'OVERRIDE_MORPH',
            morphs: {
              frownL: 0.85, frownR: 0.85,
              browInnerUp: 0.90,
              browDownL: 0.30, browDownR: 0.30,
              cheekL: 0.00, cheekR: 0.00,
            }
          }, '*');
        } else if (faceEmotion === 'calm') {
          faceRef.current?.contentWindow?.postMessage({
            type: 'OVERRIDE_MORPH',
            morphs: {
              smileL: 0.22, smileR: 0.22,
              browInnerUp: 0.05,
              browDownL: 0.00, browDownR: 0.00,
            }
          }, '*');
        } else if (faceEmotion === 'joy') {
          faceRef.current?.contentWindow?.postMessage({
            type: 'OVERRIDE_MORPH',
            morphs: {
              smileL: 1.0, smileR: 1.0,
              cheekL: 0.70, cheekR: 0.70,
              browOuterUpL: 0.35, browOuterUpR: 0.35,
              browInnerUp: 0.10,
            }
          }, '*');
        } else if (faceEmotion === 'comfort') {
          faceRef.current?.contentWindow?.postMessage({
            type: 'OVERRIDE_MORPH',
            morphs: {
              smileL: 0.18, smileR: 0.18,
              browInnerUp: 0.12, browDownL: 0.00, browDownR: 0.00,
            }
          }, '*');
        }

        // Send text for lipsync with EL acting cue prefix
        const EL_CUES: Record<string, string> = {
          joy:          '[Joyful, bright, genuinely celebrating] ',
          empathy:      '[Soft, slow, heartfelt, close friend energy] ',
          calm:         '[Calm, grounded, steady, de-escalating] ',
          comfort:      '[Soothing, slow, safe, warm embrace] ',
          concern:      '[Gently concerned, caring, attentive] ',
          love:         '[Deeply warm, tender, compassionate] ',
          surprise:     '[Genuinely surprised, wide-eyed, warm] ',
          anticipation: '[Warmly excited, hopeful, forward energy] ',
          trust:        '[Warm, gentle, reassuring, safe] ',
          neutral:      '',
        };
        if (replyText) {
          faceRef.current?.contentWindow?.postMessage({
            type: 'SPEAK_TEXT',
            text: (EL_CUES[faceEmotion] || '') + replyText,
            emotion: faceEmotion,
          }, '*');
        }

        // 3️⃣ Highlight trigger nodes on the 2D memory map
        if (triggers.length > 0) {
          triggers.forEach(trigger => {
            pushToIframe({ type: 'HIGHLIGHT_NODE', nodeId: trigger });
          });
        }

        // Run thinking animation with real response data BEFORE showing reply
        await runThinkingAnimation(emotion, triggers, data.patternInsight || parsed.patternInsight || null);

        // 4️⃣ Add Lumina's reply bubble (always replyText — never raw JSON)
        const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: replyText, time: t }]);

        // 4b) Voice ALWAYS follows faceEmotion (therapeutic mapping), never raw BERT
        if (replyText) {
          speakWithElevenLabs(replyText, faceEmotion);
        }

        // 4c) Check for distress patterns → may trigger therapist offer
        checkSatisfaction(text, emotion);

        // 5️⃣ Show patternInsight amber banner (key hackathon feature)
        const insight = data.patternInsight || parsed.patternInsight;
        if (insight) {
          showPatternInsight(insight);
        }

        // 6️⃣ "✦ Memory saved" toast
        triggerMemoryToast();

        // Real-time brain map refresh from MongoDB as requested
        try {
          const mapResponse = await fetch(`http://localhost:5000/api/brain-map/${userId}`);
          const mapData = await mapResponse.json();
          if (mapData.brainMap) {
            loadGraphIfNonEmpty(mapData.brainMap);
            await fetch('http://localhost:5000/api/brain-map/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, nodes: mapData.brainMap.nodes, edges: mapData.brainMap.edges, profile: mapData.brainMap.profile })
            }).catch(() => { });
          }
        } catch (_) { }

      } else {
        throw new Error(data.error);
      }
    } catch {
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "I'm having a little trouble connecting to my neural core. Let's try again in a moment.", time: t }]);
      }, 1000);
    } finally {
      setIsSending(false);
    }
  };

  /* ─── Computed colors ───────────────────────────────────────────── */
  const emotionColor = EMOTION_COLORS[currentEmotion] || EMOTION_COLORS[mood] || '#4a5568';

  /* ─── Render ────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <MoodBackground />

      {/* ── "✦ Memory saved" toast ────────────────────────────────── */}
      <AnimatePresence>
        {showMemoryToast && (
          <motion.div
            key="memory-toast"
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 12, x: '-50%' }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-8 left-1/2 z-[9999] flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(5,5,8,0.92)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ color: '#44ff88', fontSize: 11 }}>✦</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Memory saved
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-screen w-full flex flex-col relative z-10 mood-page overflow-hidden pt-20" style={{ fontFamily: font }}>

        {/* ── Profile Bar ─────────────────────────────────────────── */}
        {profileName && (
          <div
            className="flex items-center justify-between px-8 py-2 border-b"
            style={{ background: 'rgba(5,5,8,0.6)', borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}
              >
                {profileName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[11px] font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {profileName}
              </span>
            </div>

            <motion.div
              className="flex items-center gap-2 px-3 py-1 rounded-full"
              animate={{ background: `${emotionColor}18`, borderColor: `${emotionColor}35` }}
              style={{ border: '1px solid' }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                animate={{ backgroundColor: emotionColor, boxShadow: `0 0 6px ${emotionColor}` }}
              />
              <motion.span
                className="text-[10px] font-bold uppercase tracking-[0.18em] flex items-center gap-1.5"
                animate={{ color: emotionColor }}
              >
                <span>{currentEmotion}</span>
                {confidence !== null && (
                  <span className="opacity-50 text-[9px] font-mono tracking-widest">{Math.round(confidence * 100)}%</span>
                )}
              </motion.span>
            </motion.div>
          </div>
        )}

        <div className="flex-1 flex gap-0 min-h-0 w-full">

          {/* ── PART 1 — LEFT: Brain / Memory Map toggle — 28% ── */}
          <div className="flex flex-col relative overflow-hidden min-h-0 h-full border-r border-white/5 bg-[#050508]" style={{ width: '28%', flexShrink: 0 }}>

            {/* Empty state overlay for 2D map when no data yet */}
            {activeView === 'map' && !hasMapData && (
              <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center gap-4 pointer-events-none">
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-2"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="w-6 h-6 rounded-full border border-white/20" />
                </div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/20 font-bold">Memory Map Empty</p>
                <p className="text-[10px] text-white/15 tracking-widest text-center max-w-xs">
                  Start chatting — your nodes will appear here as you share
                </p>
              </div>
            )}

            <div className="absolute top-10 left-10 z-[100] flex flex-col gap-4">
              <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl">
                <button
                  onClick={() => switchView('brain')}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.2em] transition-all duration-500 ${activeView === 'brain' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  3D NEURAL BRAIN
                </button>
                <button
                  onClick={() => switchView('map')}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-bold tracking-[0.2em] transition-all duration-500 ${activeView === 'map' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  2D MEMORY MAP
                </button>
              </div>
              <p className="text-[9px] uppercase tracking-[0.15em] text-white/30 ml-2 font-medium">Toggle Visualization Mode</p>
            </div>

            <iframe
              ref={iframeRef}
              src="/brain/index.html"
              className="w-full h-full absolute inset-0"
              style={{ border: 'none' }}
              title="Lumina Brain Network"
            />
          </div>

          {/* ── PART 2 — MIDDLE: TalkingHead Face Mesh — 38% ── */}
          <div className="relative overflow-hidden min-h-0 h-full border-r border-white/5" style={{ background: '#03020f', width: '38%', flexShrink: 0, marginLeft: '-1%' }}>
            <iframe
              ref={faceRef}
              src="http://localhost:5000/test.html"
              title="Lumina Face Mesh"
              style={{
                border: 'none',
                position: 'absolute',
                width: '90%',
                height: '90%',
                top: '5%',
                left: '-5%',
              }}
            />
          </div>

          {/* ── PART 3 — RIGHT: Chat Interface — 34% ── */}
          <div className="flex flex-col h-full min-h-0 bg-black/20 backdrop-blur-sm" style={{ width: '34%', flexShrink: 0, paddingTop: '2rem', paddingRight: '2rem', paddingBottom: '2rem', paddingLeft: '20px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex-1 flex flex-col glass-card rounded-[2rem] p-8 min-h-0 shadow-2xl">
              <div className="flex items-center justify-between mb-6 opacity-60">
                <div>
                  <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', color: 'rgba(255,255,255,0.25)', fontWeight: 400, textTransform: 'uppercase', margin: 0 }}>Neural Conversation</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px]">{PERSONALITIES[personality].emoji}</span>
                    <span className="text-[9px] text-white/40 tracking-widest uppercase">{PERSONALITIES[personality].label}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-white/40" />
                  <div className="w-1 h-1 rounded-full bg-white/40" />
                  <div className="w-1 h-1 rounded-full bg-white/40" />
                </div>
              </div>
              <div ref={chatRef} className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                {messages.map((msg) => <ChatBubble key={msg.id} type={msg.type} text={msg.text} timestamp={msg.time} />)}

                {/* Thinking animation — shows between user msg and bot reply */}
                {isThinking && (
                  <div className="flex flex-col gap-1.5 px-3 py-3" style={{ animation: 'fadeIn 0.3s ease forwards' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25">Lumina thinking</span>
                    </div>
                    {thinkingSteps.map((step, i) => (
                      <div
                        key={i}
                        className="text-[11px] text-white/40 pl-4 border-l border-purple-500/20"
                        style={{ animation: 'fadeIn 0.3s ease forwards' }}
                      >
                        {step}
                      </div>
                    ))}
                    <div className="flex gap-1 pl-4 mt-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Therapist offer banner */}
                {showTherapistOffer && (
                  <div className="mx-4 my-3 p-4 rounded-2xl animate-fadeIn"
                    style={{
                      background: 'rgba(255, 140, 0, 0.08)',
                      border: '1px solid rgba(255, 140, 0, 0.25)',
                    }}>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs text-amber-400 tracking-widest">PROFESSIONAL SUPPORT</span>
                    </div>

                    <p className="text-sm text-white/75 leading-relaxed mb-4">
                      You deserve more than words on a screen right now.
                      Would you like to be connected with a licensed therapist
                      for a real session?
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowTherapistOffer(false);
                          setDissatisfactionCount(0);
                          setMessages(prev => [...prev, {
                            id: Date.now() + 3,
                            type: 'bot',
                            text: 'I am connecting you with a licensed therapist now. A session has been scheduled for you. You are taking a truly brave step towards healing. I am proud of you. 💙',
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }]);
                          speakWithBrowser(
                            'I am connecting you with a licensed therapist now. You are taking a truly brave step.',
                            'love'
                          );
                        }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: 'rgba(255, 140, 0, 0.20)',
                          border: '1px solid rgba(255, 140, 0, 0.40)',
                          color: 'rgba(255,255,255,0.9)'
                        }}>
                        🧠 Connect with Therapist
                      </button>
                      <button
                        onClick={() => {
                          setShowTherapistOffer(false);
                          setDissatisfactionCount(0);
                          setMessages(prev => [...prev, {
                            id: Date.now() + 4,
                            type: 'bot',
                            text: "That's okay. I'm still here with you. Whenever you feel ready, just let me know.",
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }]);
                        }}
                        className="py-2.5 px-4 rounded-xl text-xs transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.10)',
                          color: 'rgba(255,255,255,0.40)'
                        }}>
                        Maybe later
                      </button>
                    </div>
                  </div>
                )}

                {/* Typing dots — while waiting for network response */}
                {isSending && !isThinking && (
                  <div className="flex items-center gap-2 pl-2 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accent }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accent, animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accent, animationDelay: '0.3s' }} />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 mt-4">

              {/* ── Personality Selector (custom pill buttons) ──── */}
              <div className="flex items-center gap-1.5">
                {(Object.keys(PERSONALITIES) as PersonalityMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPersonality(mode)}
                    className="px-2.5 py-1 rounded-lg text-xs transition-all"
                    style={{
                      background: personality === mode
                        ? 'rgba(120, 96, 240, 0.20)'
                        : 'rgba(255,255,255,0.04)',
                      border: personality === mode
                        ? '1px solid rgba(120, 96, 240, 0.35)'
                        : '1px solid rgba(255,255,255,0.07)',
                      color: personality === mode
                        ? 'rgba(255,255,255,0.85)'
                        : 'rgba(255,255,255,0.30)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '9px',
                      letterSpacing: '0.10em',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {PERSONALITIES[mode].emoji} {PERSONALITIES[mode].label.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* ── Pattern Insight Banner ────────────────────────── */}
              <AnimatePresence>
                {patternBanner && (
                  <motion.div
                    key="pattern-banner"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.35 }}
                    className="relative overflow-hidden rounded-2xl p-4"
                    style={{
                      background: '#ffaa00',
                      border: '1px solid rgba(255, 170, 0, 0.8)',
                      boxShadow: '0 0 24px rgba(255, 170, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    {/* Amber glow pulse */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.3), transparent 70%)' }}
                    />
                    <div className="relative flex items-start gap-3">
                      <Sparkles size={14} style={{ color: '#000000', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: '#000000' }}>
                          Pattern Detected
                        </p>
                        <p className="text-[11px] leading-relaxed font-medium" style={{ color: '#111111' }}>
                          {patternBanner}
                        </p>
                      </div>
                      <button
                        onClick={() => setPatternBanner(null)}
                        className="ml-auto text-[10px] opacity-60 hover:opacity-100 transition-opacity"
                        style={{ color: '#000000', flexShrink: 0 }}
                      >
                        ✕
                      </button>
                    </div>
                    {/* Countdown bar */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-[3px]"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 6, ease: 'linear' }}
                      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>


              {/* ── Input ──────────────────────────────────────── */}
              <div className="relative group">
                <div className="flex items-center gap-2">
                  {/* Mic button */}
                  <button
                    onClick={toggleVoiceInput}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${isListening
                      ? 'bg-red-500/30 border border-red-400/60'
                      : 'bg-white/5 border border-white/10 hover:bg-white/15'
                      }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                      className={`w-4 h-4 ${isListening ? 'text-red-400' : 'text-white/50'}`}>
                      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"
                        fill={isListening ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,.15)'} />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </button>

                  {/* Text input */}
                  <div className="relative flex-1">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && input.trim() && !isSending && sendMessage(input)}
                      className="w-full rounded-xl focus:outline-none transition-all duration-500 backdrop-blur-2xl"
                      placeholder="Share what's on your mind..."
                      disabled={isSending}
                      style={{
                        background: `${accent}08`,
                        border: `1px solid ${accent}20`,
                        color: 'var(--mood-text, #f5f5f5)',
                        fontFamily: font,
                        fontSize: '13px',
                        padding: '8px 52px 8px 14px',
                        minHeight: '38px',
                        boxShadow: `0 4px 16px -4px rgba(0,0,0,0.4)`,
                        opacity: isSending ? 0.6 : 1
                      }}
                    />
                    <motion.button
                      onClick={() => input.trim() && !isSending && sendMessage(input)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl shadow-lg ring-1 ring-white/10"
                      animate={{ backgroundColor: isSending ? '#333' : accent }}
                      whileHover={{ scale: isSending ? 1 : 1.05 }}
                      whileTap={{ scale: isSending ? 1 : 0.95 }}
                    >
                      <Zap size={18} className="text-black fill-black" />
                    </motion.button>
                  </div>

                  {/* Speaking indicator */}
                  {isSpeaking && (
                    <div className="flex gap-1 items-center px-1 flex-shrink-0">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1 rounded-full animate-bounce"
                          style={{ height: '12px', animationDelay: `${i * 0.1}s`, backgroundColor: accent }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default MindscapePage;
