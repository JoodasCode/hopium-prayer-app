// Comprehensive Gamification System for Lopi

export interface LevelInfo {
  level: number;
  xp: number;
  xpToNext: number;
  xpForCurrentLevel: number;
  totalXpRequired: number;
  rank: string;
  rankColor: string;
  benefits: string[];
}

export interface XPSource {
  action: string;
  baseXP: number;
  multiplier?: number;
  description: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirements: {
    type: 'streak' | 'prayers' | 'consistency' | 'special';
    value: number;
    prayer?: string;
  };
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
  requirements: {
    type: 'prayers' | 'streak' | 'specific_prayer' | 'perfect_days';
    target: number;
    prayer?: string;
  };
  progress: number;
  completed: boolean;
  expiresAt: Date;
}

// XP Sources and Values
export const XP_SOURCES: Record<string, XPSource> = {
  PRAYER_COMPLETED: {
    action: 'prayer_completed',
    baseXP: 25,
    description: 'Complete a prayer on time'
  },
  PRAYER_EARLY: {
    action: 'prayer_early',
    baseXP: 35,
    multiplier: 1.4,
    description: 'Complete prayer in first half of time window'
  },
  FAJR_COMPLETED: {
    action: 'fajr_completed',
    baseXP: 40,
    multiplier: 1.6,
    description: 'Complete Fajr prayer (extra points for difficulty)'
  },
  STREAK_DAY: {
    action: 'streak_day',
    baseXP: 15,
    description: 'Maintain daily streak (80%+ prayers)'
  },
  PERFECT_DAY: {
    action: 'perfect_day',
    baseXP: 100,
    description: 'Complete all 5 prayers in one day'
  },
  REFLECTION_ADDED: {
    action: 'reflection_added',
    baseXP: 10,
    description: 'Add reflection or notes to prayer'
  },
  BADGE_EARNED: {
    action: 'badge_earned',
    baseXP: 50,
    description: 'Unlock a new badge'
  },
  CHALLENGE_COMPLETED: {
    action: 'challenge_completed',
    baseXP: 0, // Variable based on challenge
    description: 'Complete daily/weekly challenge'
  },
  MILESTONE_REACHED: {
    action: 'milestone_reached',
    baseXP: 200,
    description: 'Reach a major milestone'
  }
};

// Level Progression (exponential growth)
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  
  // Base XP requirement increases exponentially
  // Level 2: 100 XP, Level 3: 250 XP, Level 4: 450 XP, etc.
  const baseXP = 100;
  const exponentialFactor = 1.5;
  
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += Math.floor(baseXP * Math.pow(exponentialFactor, i - 2));
  }
  
  return totalXP;
}

export function calculateLevelFromXP(totalXP: number): LevelInfo {
  let level = 1;
  let xpForCurrentLevel = 0;
  
  // Find the current level
  while (calculateXPForLevel(level + 1) <= totalXP) {
    level++;
  }
  
  // Calculate XP for current level
  xpForCurrentLevel = totalXP - calculateXPForLevel(level);
  
  // Calculate XP needed for next level
  const xpToNext = calculateXPForLevel(level + 1) - calculateXPForLevel(level);
  
  // Get rank information
  const rankInfo = getRankInfo(level);
  
  return {
    level,
    xp: xpForCurrentLevel,
    xpToNext,
    xpForCurrentLevel,
    totalXpRequired: calculateXPForLevel(level + 1),
    rank: rankInfo.rank,
    rankColor: rankInfo.color,
    benefits: rankInfo.benefits
  };
}

// Rank System
export function getRankInfo(level: number): { rank: string; color: string; benefits: string[] } {
  if (level >= 50) return {
    rank: "Spiritual Master",
    color: "from-purple-500 to-pink-500",
    benefits: ["All features unlocked", "Master badge", "Special recognition"]
  };
  if (level >= 40) return {
    rank: "Prayer Guardian",
    color: "from-indigo-500 to-purple-500",
    benefits: ["Advanced analytics", "Custom challenges", "Mentor status"]
  };
  if (level >= 30) return {
    rank: "Devoted Scholar",
    color: "from-blue-500 to-indigo-500",
    benefits: ["Detailed insights", "Achievement tracking", "Community features"]
  };
  if (level >= 25) return {
    rank: "Faithful Servant",
    color: "from-green-500 to-blue-500",
    benefits: ["Progress analytics", "Custom reminders", "Badge collection"]
  };
  if (level >= 20) return {
    rank: "Consistent Believer",
    color: "from-yellow-500 to-green-500",
    benefits: ["Streak protection", "Advanced stats", "Challenge unlocks"]
  };
  if (level >= 15) return {
    rank: "Dedicated Worshipper",
    color: "from-orange-500 to-yellow-500",
    benefits: ["Weekly insights", "Milestone tracking", "Reflection features"]
  };
  if (level >= 10) return {
    rank: "Devoted Believer",
    color: "from-red-500 to-orange-500",
    benefits: ["Prayer analytics", "Streak tracking", "Basic challenges"]
  };
  if (level >= 5) return {
    rank: "Growing Muslim",
    color: "from-pink-500 to-red-500",
    benefits: ["Progress tracking", "Simple stats", "Encouragement"]
  };
  
  return {
    rank: "New Believer",
    color: "from-gray-400 to-gray-600",
    benefits: ["Basic tracking", "Getting started guide", "Foundation building"]
  };
}

// Badge System
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first_prayer',
    name: 'First Steps',
    description: 'Complete your first prayer',
    icon: '🌟',
    rarity: 'common',
    xpReward: 50,
    requirements: { type: 'prayers', value: 1 }
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⚔️',
    rarity: 'rare',
    xpReward: 150,
    requirements: { type: 'streak', value: 7 }
  },
  {
    id: 'dawn_devotee',
    name: 'Dawn Devotee',
    description: 'Complete Fajr prayer 10 times',
    icon: '🌅',
    rarity: 'epic',
    xpReward: 200,
    requirements: { type: 'prayers', value: 10, prayer: 'fajr' }
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    rarity: 'legendary',
    xpReward: 500,
    requirements: { type: 'streak', value: 30 }
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all prayers for 7 consecutive days',
    icon: '💎',
    rarity: 'epic',
    xpReward: 300,
    requirements: { type: 'consistency', value: 7 }
  },
  {
    id: 'prayer_master',
    name: 'Prayer Master',
    description: 'Complete 100 prayers total',
    icon: '🕌',
    rarity: 'rare',
    xpReward: 250,
    requirements: { type: 'prayers', value: 100 }
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete Fajr prayer before sunrise 20 times',
    icon: '🐦',
    rarity: 'epic',
    xpReward: 200,
    requirements: { type: 'special', value: 20 }
  },
  {
    id: 'night_warrior',
    name: 'Night Warrior',
    description: 'Complete Isha prayer 25 times',
    icon: '🌙',
    rarity: 'rare',
    xpReward: 150,
    requirements: { type: 'prayers', value: 25, prayer: 'isha' }
  }
];

// Challenge System
export function generateDailyChallenge(): Challenge {
  const challenges = [
    {
      id: 'perfect_day',
      name: 'Perfect Day',
      description: 'Complete all 5 prayers today',
      type: 'daily' as const,
      xpReward: 150,
      requirements: { type: 'prayers' as const, target: 5 },
      expiresAt: getEndOfDay()
    },
    {
      id: 'early_prayers',
      name: 'Early Bird',
      description: 'Complete 3 prayers in the first half of their time window',
      type: 'daily' as const,
      xpReward: 100,
      requirements: { type: 'specific_prayer' as const, target: 3 },
      expiresAt: getEndOfDay()
    },
    {
      id: 'fajr_focus',
      name: 'Dawn Focus',
      description: 'Complete Fajr prayer today',
      type: 'daily' as const,
      xpReward: 75,
      requirements: { type: 'specific_prayer' as const, target: 1, prayer: 'fajr' },
      expiresAt: getEndOfDay()
    }
  ];
  
  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
  return {
    ...randomChallenge,
    progress: 0,
    completed: false
  };
}

export function generateWeeklyChallenge(): Challenge {
  const challenges = [
    {
      id: 'fajr_week',
      name: 'Fajr Focus',
      description: 'Complete Fajr prayer 6 out of 7 days this week',
      type: 'weekly' as const,
      xpReward: 500,
      requirements: { type: 'specific_prayer' as const, target: 6, prayer: 'fajr' },
      expiresAt: getEndOfWeek()
    },
    {
      id: 'consistency_week',
      name: 'Consistency Challenge',
      description: 'Maintain 80%+ prayer completion for 7 days',
      type: 'weekly' as const,
      xpReward: 400,
      requirements: { type: 'streak' as const, target: 7 },
      expiresAt: getEndOfWeek()
    },
    {
      id: 'perfect_days',
      name: 'Perfect Days',
      description: 'Have 3 perfect days (all 5 prayers) this week',
      type: 'weekly' as const,
      xpReward: 600,
      requirements: { type: 'perfect_days' as const, target: 3 },
      expiresAt: getEndOfWeek()
    }
  ];
  
  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
  return {
    ...randomChallenge,
    progress: 0,
    completed: false
  };
}

// XP Calculation Functions
export function calculatePrayerXP(
  prayerType: string,
  isEarly: boolean = false,
  hasReflection: boolean = false
): number {
  let totalXP = 0;
  
  // Base prayer XP
  if (prayerType.toLowerCase() === 'fajr') {
    totalXP += XP_SOURCES.FAJR_COMPLETED.baseXP;
  } else {
    totalXP += XP_SOURCES.PRAYER_COMPLETED.baseXP;
  }
  
  // Early completion bonus
  if (isEarly) {
    totalXP += XP_SOURCES.PRAYER_EARLY.baseXP - XP_SOURCES.PRAYER_COMPLETED.baseXP;
  }
  
  // Reflection bonus
  if (hasReflection) {
    totalXP += XP_SOURCES.REFLECTION_ADDED.baseXP;
  }
  
  return totalXP;
}

export function calculateStreakXP(streakDays: number): number {
  let totalXP = 0;
  
  // Daily streak bonus
  totalXP += XP_SOURCES.STREAK_DAY.baseXP * streakDays;
  
  // Milestone bonuses
  const milestones = [7, 14, 30, 60, 100];
  for (const milestone of milestones) {
    if (streakDays >= milestone && streakDays % milestone === 0) {
      totalXP += XP_SOURCES.MILESTONE_REACHED.baseXP;
    }
  }
  
  return totalXP;
}

export function calculatePerfectDayXP(): number {
  return XP_SOURCES.PERFECT_DAY.baseXP;
}

// Utility Functions
function getEndOfDay(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

function getEndOfWeek(): Date {
  const date = new Date();
  const daysUntilSunday = 7 - date.getDay();
  date.setDate(date.getDate() + daysUntilSunday);
  date.setHours(23, 59, 59, 999);
  return date;
}

// Badge Check Functions
export function checkBadgeEligibility(
  badge: Badge,
  userStats: {
    totalPrayers: number;
    currentStreak: number;
    prayerCounts: Record<string, number>;
    perfectDays: number;
  }
): boolean {
  const { requirements } = badge;
  
  switch (requirements.type) {
    case 'prayers':
      if (requirements.prayer) {
        return (userStats.prayerCounts[requirements.prayer] || 0) >= requirements.value;
      }
      return userStats.totalPrayers >= requirements.value;
      
    case 'streak':
      return userStats.currentStreak >= requirements.value;
      
    case 'consistency':
      return userStats.perfectDays >= requirements.value;
      
    case 'special':
      // Handle special requirements (like early prayers)
      return false; // Implement based on specific requirements
      
    default:
      return false;
  }
}

// Progress Tracking
export function calculateProgress(current: number, target: number): number {
  return Math.min(Math.round((current / target) * 100), 100);
}

export function getNextMilestone(currentStreak: number): { days: number; reward: string; xp: number } {
  const milestones = [
    { days: 7, reward: "Week Warrior Badge", xp: 150 },
    { days: 14, reward: "Two Week Champion", xp: 200 },
    { days: 30, reward: "Monthly Master Badge", xp: 500 },
    { days: 60, reward: "Consistency Expert", xp: 750 },
    { days: 100, reward: "Century Achiever", xp: 1000 },
    { days: 365, reward: "Year-Long Devotee", xp: 5000 }
  ];
  
  for (const milestone of milestones) {
    if (currentStreak < milestone.days) {
      return milestone;
    }
  }
  
  // If user has achieved all milestones, return a special one
  return { days: currentStreak + 100, reward: "Spiritual Legend", xp: 10000 };
} 