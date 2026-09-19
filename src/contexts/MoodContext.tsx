import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Mood = 'happy' | 'sad' | 'anxious' | 'angry' | 'calm' | 'motivated' | 'lonely' | 'stressed';

interface MoodContextType {
  mood: Mood;
  setMood: (mood: Mood) => void;
  moodScore: number;
  setMoodScore: (score: number) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (val: boolean) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const moodEmoji: Record<Mood, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  angry: '😤',
  calm: '😌',
  motivated: '🔥',
  lonely: '🌙',
  stressed: '😓',
};

// Chart colors (greyscale for visual hierarchy)
export const moodColors: Record<Mood, string> = {
  happy: '#E5E5E5',
  sad: '#666666',
  anxious: '#999999',
  angry: '#B3B3B3',
  calm: '#CCCCCC',
  motivated: '#F5F5F5',
  lonely: '#808080',
  stressed: '#A6A6A6',
};

// Accent color per mood (for interactive elements)
export const moodAccentColors: Record<Mood, string> = {
  happy: '#F59E0B',
  calm: '#ffffff',
  motivated: '#FBBF24',
  sad: '#FB923C',
  anxious: '#2DD4BF',
  angry: '#A78BFA',
  stressed: '#34D399',
  lonely: '#F97316',
};

// Mood message / tagline
export const moodMessage: Record<Mood, string> = {
  happy: '☀️ Sunshine & Joy',
  calm: '🌊 Finding your peace',
  motivated: '⚡ Channeling your energy',
  sad: '🌅 Here comes the sunrise',
  anxious: '🍃 Let\u2019s find calm together',
  angry: '💜 Finding your peaceful center',
  stressed: '🌿 Time to breathe & relax',
  lonely: '🤝 You\u2019re not alone',
};

// Font family per mood
export const moodFonts: Record<Mood, string> = {
  happy: "'Quicksand', sans-serif",
  sad: "'Lora', serif",
  angry: "'Playfair Display', serif",
  stressed: "'Nunito', sans-serif",
  calm: "'Outfit', sans-serif",
  motivated: "'Outfit', sans-serif",
  anxious: "'Outfit', sans-serif",
  lonely: "'Outfit', sans-serif",
};

// CSS class applied to <html>
const moodThemeClass: Record<Mood, string> = {
  happy: 'mood-happy',
  sad: 'mood-sad',
  angry: 'mood-angry',
  stressed: 'mood-stressed',
  calm: '',
  motivated: '',
  anxious: '',
  lonely: '',
};

export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const [mood, setMood] = useState<Mood>('calm');
  const [moodScore, setMoodScore] = useState(7);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Explorer');
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Auto-login logic for demo mode
  useEffect(() => {
    const existingUserId = localStorage.getItem("lumina_userId");
    if (!existingUserId) {
      // Fetch or create demo user
      fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "demo@lumina.ai", name: "Demo User" })
      })
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user._id) {
          localStorage.setItem("lumina_userId", data.user._id);
          setUserName(data.user.name || "Explorer");
        }
      })
      .catch(err => console.error("Auto-login failed:", err));
    }
  }, []);

  // Apply mood theme class to <html> element so CSS overrides work
  useEffect(() => {
    const html = document.documentElement;

    // Remove all mood classes
    Object.values(moodThemeClass).forEach(cls => {
      if (cls) html.classList.remove(cls);
    });
    // Add current mood class
    const cls = moodThemeClass[mood];
    if (cls) html.classList.add(cls);
    // Transition bg color
    html.style.transition = 'background-color 1s ease';
    return () => {
      Object.values(moodThemeClass).forEach(c => {
        if (c) html.classList.remove(c);
      });
    };
  }, [mood]);

  return (
    <MoodContext.Provider value={{ mood, setMood, moodScore, setMoodScore, isLoggedIn, setIsLoggedIn, userName, setUserName, onboardingComplete, setOnboardingComplete }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error('useMood must be used within MoodProvider');
  return ctx;
};
