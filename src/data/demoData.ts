import { Mood } from '@/contexts/MoodContext';

export interface JournalEntry {
  id: string;
  date: string;
  dayLabel: string;
  text: string;
  mood: Mood;
  moodScore: number;
  emotions: string[];
  triggers: string[];
}

export interface MemoryNode {
  id: string;
  label: string;
  category: 'family' | 'friends' | 'work' | 'health' | 'money' | 'relationship' | 'past' | 'hobbies';
  intensity: 'low' | 'medium' | 'high';
  status: 'safe' | 'trigger' | 'neutral';
  emotion: string;
  count: number;
}

const today = new Date();
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDateStr(daysAgo: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getDayLabel(daysAgo: number) {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return dayNames[d.getDay()];
}

export const demoEntries: JournalEntry[] = [
  { id: '1', date: getDateStr(0), dayLabel: getDayLabel(0), text: "Feeling good today. Had a great morning walk and a productive start.", mood: 'happy', moodScore: 8, emotions: ['happy', 'motivated'], triggers: ['exercise'] },
  { id: '2', date: getDateStr(1), dayLabel: getDayLabel(1), text: "Work deadline is approaching. Feeling the pressure but managing.", mood: 'anxious', moodScore: 5, emotions: ['anxious', 'stressed'], triggers: ['work', 'deadlines'] },
  { id: '3', date: getDateStr(2), dayLabel: getDayLabel(2), text: "Had a long call with mom. Felt warm and grounded after.", mood: 'calm', moodScore: 7, emotions: ['calm', 'grateful'], triggers: ['family'] },
  { id: '4', date: getDateStr(3), dayLabel: getDayLabel(3), text: "Couldn't sleep well. Overthinking about the project launch.", mood: 'anxious', moodScore: 4, emotions: ['anxious', 'overwhelmed'], triggers: ['work', 'sleep'] },
  { id: '5', date: getDateStr(4), dayLabel: getDayLabel(4), text: "Went out with friends. Laughed a lot. Needed that.", mood: 'happy', moodScore: 9, emotions: ['happy', 'connected'], triggers: ['friends'] },
  { id: '6', date: getDateStr(5), dayLabel: getDayLabel(5), text: "Feeling low today. Missing my partner. Distance is hard.", mood: 'sad', moodScore: 3, emotions: ['sad', 'lonely'], triggers: ['relationship', 'loneliness'] },
  { id: '7', date: getDateStr(6), dayLabel: getDayLabel(6), text: "Work stress again. Manager gave harsh feedback.", mood: 'stressed', moodScore: 4, emotions: ['stressed', 'frustrated'], triggers: ['work', 'conflict'] },
];

export const demoMemoryNodes: MemoryNode[] = [
  { id: '1', label: 'Work', category: 'work', intensity: 'high', status: 'trigger', emotion: 'anxious', count: 4 },
  { id: '2', label: 'Family', category: 'family', intensity: 'medium', status: 'safe', emotion: 'calm', count: 2 },
  { id: '3', label: 'Friends', category: 'friends', intensity: 'low', status: 'safe', emotion: 'happy', count: 1 },
  { id: '4', label: 'Health', category: 'health', intensity: 'low', status: 'neutral', emotion: 'neutral', count: 1 },
  { id: '5', label: 'Relationship', category: 'relationship', intensity: 'medium', status: 'trigger', emotion: 'sad', count: 2 },
  { id: '6', label: 'Money', category: 'money', intensity: 'low', status: 'neutral', emotion: 'neutral', count: 0 },
];

export const weeklyInsight = {
  dateRange: `${new Date(today.getTime() - 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
  topEmotion: 'anxious',
  recurringTrigger: 'work',
  summary: "This week, anxiety appeared most often, especially around work and deadlines. Moments with friends and family helped improve your mood consistently.",
  reflection: "What part of work is asking for more care, boundaries, or support?",
};

export const streakCount = 7;
