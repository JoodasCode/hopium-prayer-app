// Prayer data
export type Prayer = {
  id: string;
  name: string;
  time: string;
  status: 'completed' | 'next' | 'upcoming';
  angle: number;
  emotion: string;
};

// We'll keep the NextPrayer type for backward compatibility
export type NextPrayer = {
  id: string;
  name: string;
  time: string;
} | null;

export const prayers: Prayer[] = [
  { id: 'fajr', name: 'Fajr', time: '5:30 AM', status: 'completed', angle: 0, emotion: 'peaceful' },
  { id: 'dhuhr', name: 'Dhuhr', time: '12:30 PM', status: 'completed', angle: 72, emotion: 'grateful' },
  { id: 'asr', name: 'Asr', time: '3:45 PM', status: 'next', angle: 144, emotion: 'reflective' },
  { id: 'maghrib', name: 'Maghrib', time: '6:15 PM', status: 'upcoming', angle: 216, emotion: 'hopeful' },
  { id: 'isha', name: 'Isha', time: '8:00 PM', status: 'upcoming', angle: 288, emotion: 'peaceful' },
];

// Emotions
export const emotions = ['peaceful', 'grateful', 'reflective', 'hopeful', 'connected'];

// Smart tips data
export type Tip = {
  id: string;
  title: string;
  content: string;
  icon: string;
};

export const tips: Tip[] = [
  {
    id: 'consistency',
    title: "Prayer Consistency",
    content: "Set specific times for prayer to build a stronger habit.",
    icon: "⏰"
  },
  {
    id: 'mindfulness',
    title: "Mindful Prayer",
    content: "Focus on being present during prayer for a deeper connection.",
    icon: "🧘"
  },
  {
    id: 'community',
    title: "Prayer Community",
    content: "Praying with others can strengthen your commitment and faith.",
    icon: "👥"
  }
];

// Get next prayer
export const getNextPrayer = (prayerList: Prayer[]): Prayer | null => {
  const nextPrayer = prayerList.find(prayer => prayer.status === 'next');
  if (nextPrayer) return nextPrayer;
  
  const upcomingPrayers = prayerList.filter(prayer => prayer.status === 'upcoming');
  if (upcomingPrayers.length > 0) {
    return upcomingPrayers[0];
  }
  return null;
};

// Simulate active users
export const getActiveUsers = (): number => {
  return Math.floor(Math.random() * 200) + 100; // Random between 100-300
};
