// Prayer data
export type Prayer = {
  id: string;
  name: string;
  time: string;
  status: 'completed' | 'next' | 'upcoming';
  angle: number;
  emotion: string;
};

export type NextPrayer = {
  id: string;
  name: string;
  time: string;
} | null;

export const prayers: Prayer[] = [
  { id: 'fajr', name: 'Fajr', time: '5:30 AM', status: 'completed', angle: 0, emotion: 'peaceful' },
  { id: 'dhuhr', name: 'Dhuhr', time: '12:30 PM', status: 'completed', angle: 72, emotion: 'grateful' },
  { id: 'asr', name: 'Asr', time: '3:45 PM', status: 'upcoming', angle: 144, emotion: 'reflective' },
  { id: 'maghrib', name: 'Maghrib', time: '6:15 PM', status: 'upcoming', angle: 216, emotion: 'hopeful' },
  { id: 'isha', name: 'Isha', time: '8:00 PM', status: 'upcoming', angle: 288, emotion: 'peaceful' },
];

// Emotions
export const emotions = ['peaceful', 'grateful', 'reflective', 'hopeful', 'connected'];

// Get next prayer
export const getNextPrayer = (prayerList: Prayer[]): NextPrayer => {
  const upcomingPrayers = prayerList.filter(prayer => prayer.status === 'upcoming');
  if (upcomingPrayers.length > 0) {
    const { id, name, time } = upcomingPrayers[0];
    return { id, name, time };
  }
  return null;
};

// Simulate active users
export const getActiveUsers = (): number => {
  return Math.floor(Math.random() * 200) + 100; // Random between 100-300
};
