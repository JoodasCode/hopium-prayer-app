import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category?: string;
  difficulty?: string;
  requirements: any;
  created_at: string;
}

interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  xp_earned: number;
  achievement?: Achievement;
}

interface BadgeProgress {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  target: number;
  completed: boolean;
  xpReward: number;
}

interface UseAchievementsReturn {
  userBadges: UserBadge[];
  availableBadges: Achievement[];
  badgeProgress: BadgeProgress[];
  isLoading: boolean;
  error: string | null;
  checkBadgeEligibility: (userId: string) => Promise<UserBadge[]>;
  awardBadge: (userId: string, badgeId: string) => Promise<UserBadge | null>;
  getBadgeProgress: (userId: string) => Promise<BadgeProgress[]>;
  refreshBadges: () => Promise<void>;
}

// Badge definitions based on gamification system
const BADGE_DEFINITIONS = [
  // Foundation Badges (Common)
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first prayer',
    icon: '🌟',
    rarity: 'common' as const,
    xpReward: 50,
    requirements: { type: 'prayers_total', value: 1 }
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 5 prayers total',
    icon: '📚',
    rarity: 'common' as const,
    xpReward: 75,
    requirements: { type: 'prayers_total', value: 5 }
  },
  {
    id: 'building_habit',
    name: 'Building Habit',
    description: 'Complete 3 days in a row',
    icon: '🔄',
    rarity: 'common' as const,
    xpReward: 100,
    requirements: { type: 'streak', value: 3 }
  },

  // Consistency Badges (Rare)
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain 7-day streak',
    icon: '⚔️',
    rarity: 'rare' as const,
    xpReward: 150,
    requirements: { type: 'streak', value: 7 }
  },
  {
    id: 'prayer_master',
    name: 'Prayer Master',
    description: 'Complete 100 prayers total',
    icon: '🕌',
    rarity: 'rare' as const,
    xpReward: 200,
    requirements: { type: 'prayers_total', value: 100 }
  },
  {
    id: 'night_warrior',
    name: 'Night Warrior',
    description: 'Complete Isha prayer 25 times',
    icon: '🌙',
    rarity: 'rare' as const,
    xpReward: 175,
    requirements: { type: 'prayer_specific', prayer: 'isha', value: 25 }
  },
  {
    id: 'midday_devotee',
    name: 'Midday Devotee',
    description: 'Complete Dhuhr prayer 30 times',
    icon: '☀️',
    rarity: 'rare' as const,
    xpReward: 175,
    requirements: { type: 'prayer_specific', prayer: 'dhuhr', value: 30 }
  },

  // Excellence Badges (Epic)
  {
    id: 'dawn_devotee',
    name: 'Dawn Devotee',
    description: 'Complete Fajr prayer 10 times',
    icon: '🌅',
    rarity: 'epic' as const,
    xpReward: 300,
    requirements: { type: 'prayer_specific', prayer: 'fajr', value: 10 }
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all prayers for 7 consecutive days',
    icon: '💎',
    rarity: 'epic' as const,
    xpReward: 400,
    requirements: { type: 'perfect_days', value: 7 }
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete Fajr before sunrise 20 times',
    icon: '🐦',
    rarity: 'epic' as const,
    xpReward: 350,
    requirements: { type: 'early_prayers', prayer: 'fajr', value: 20 }
  },
  {
    id: 'reflection_master',
    name: 'Reflection Master',
    description: 'Add reflections to 50 prayers',
    icon: '📝',
    rarity: 'epic' as const,
    xpReward: 300,
    requirements: { type: 'reflections', value: 50 }
  },

  // Mastery Badges (Legendary)
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain 30-day streak',
    icon: '👑',
    rarity: 'legendary' as const,
    xpReward: 500,
    requirements: { type: 'streak', value: 30 }
  },
  {
    id: 'spiritual_warrior',
    name: 'Spiritual Warrior',
    description: 'Maintain 60-day streak',
    icon: '⚡',
    rarity: 'legendary' as const,
    xpReward: 750,
    requirements: { type: 'streak', value: 60 }
  },
  {
    id: 'prayer_legend',
    name: 'Prayer Legend',
    description: 'Complete 500 prayers total',
    icon: '🏆',
    rarity: 'legendary' as const,
    xpReward: 1000,
    requirements: { type: 'prayers_total', value: 500 }
  },
  {
    id: 'master_of_time',
    name: 'Master of Time',
    description: 'Complete 100 early prayers',
    icon: '⏰',
    rarity: 'legendary' as const,
    xpReward: 800,
    requirements: { type: 'early_prayers_total', value: 100 }
  }
];

export function useAchievements(userId?: string): UseAchievementsReturn {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<Achievement[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserBadges = async () => {
    if (!userId) return;

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('user_badges')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUserBadges(data || []);
    } catch (err) {
      console.error('Error fetching user badges:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch badges');
    }
  };

  const fetchAvailableBadges = async () => {
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setAvailableBadges(data || []);
    } catch (err) {
      console.error('Error fetching available badges:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch available badges');
    }
  };

  const getUserStats = async (userId: string) => {
    const { data: userStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: prayerRecords } = await supabase
      .from('prayer_records')
      .select('*')
      .eq('user_id', userId);

    return { 
      userStats, 
      prayerRecords: (prayerRecords || []) as Array<{
        prayer_type: string;
        completed: boolean;
        scheduled_time: string;
        completed_time?: string;
        notes?: string;
        emotional_state_after?: string;
      }>
    };
  };

  const calculateBadgeProgress = async (userId: string): Promise<BadgeProgress[]> => {
    const { userStats, prayerRecords } = await getUserStats(userId);
    const earnedBadgeIds = userBadges.map(b => b.badge_id);

    return BADGE_DEFINITIONS.map(badge => {
      const isEarned = earnedBadgeIds.includes(badge.id);
      let progress = 0;

      if (!isEarned) {
        switch (badge.requirements.type) {
          case 'prayers_total':
            progress = userStats?.total_prayers_completed || 0;
            break;
          case 'streak':
            progress = userStats?.current_streak || 0;
            break;
          case 'prayer_specific':
            const prayerCount = prayerRecords.filter(p => 
              p.prayer_type.toLowerCase() === badge.requirements.prayer && p.completed
            ).length;
            progress = prayerCount;
            break;
          case 'perfect_days':
            // Calculate perfect days from prayer records
            const dayGroups = prayerRecords.reduce((acc, prayer) => {
              const date = prayer.scheduled_time.split('T')[0];
              if (!acc[date]) acc[date] = [];
              acc[date].push(prayer);
              return acc;
            }, {} as Record<string, any[]>);
            
            let consecutivePerfectDays = 0;
            let maxConsecutive = 0;
            const sortedDates = Object.keys(dayGroups).sort();
            
            for (const date of sortedDates) {
              const dayPrayers = dayGroups[date];
              const completedCount = dayPrayers.filter(p => p.completed).length;
              
              if (completedCount >= 5) {
                consecutivePerfectDays++;
                maxConsecutive = Math.max(maxConsecutive, consecutivePerfectDays);
              } else {
                consecutivePerfectDays = 0;
              }
            }
            progress = maxConsecutive;
            break;
          case 'early_prayers':
            const earlyPrayerCount = prayerRecords.filter(p => 
              p.prayer_type.toLowerCase() === badge.requirements.prayer && 
              p.completed && 
              p.completed_time && p.completed_time < p.scheduled_time
            ).length;
            progress = earlyPrayerCount;
            break;
          case 'early_prayers_total':
            const totalEarlyPrayers = prayerRecords.filter(p => 
              p.completed && p.completed_time && p.completed_time < p.scheduled_time
            ).length;
            progress = totalEarlyPrayers;
            break;
          case 'reflections':
            const reflectionCount = prayerRecords.filter(p => 
              p.completed && (p.notes || p.emotional_state_after)
            ).length;
            progress = reflectionCount;
            break;
        }
      }

      return {
        badgeId: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        progress: Math.min(progress, badge.requirements.value),
        target: badge.requirements.value,
        completed: isEarned,
        xpReward: badge.xpReward
      };
    });
  };

  const getBadgeProgress = async (userId: string): Promise<BadgeProgress[]> => {
    try {
      const progress = await calculateBadgeProgress(userId);
      setBadgeProgress(progress);
      return progress;
    } catch (err) {
      console.error('Error calculating badge progress:', err);
      return [];
    }
  };

  const checkBadgeEligibility = async (userId: string): Promise<UserBadge[]> => {
    try {
      const progress = await calculateBadgeProgress(userId);
      const newBadges: UserBadge[] = [];

      for (const badge of progress) {
        if (!badge.completed && badge.progress >= badge.target) {
          const newBadge = await awardBadge(userId, badge.badgeId);
          if (newBadge) {
            newBadges.push(newBadge);
          }
        }
      }

      return newBadges;
    } catch (err) {
      console.error('Error checking badge eligibility:', err);
      return [];
    }
  };

  const awardBadge = async (userId: string, badgeId: string): Promise<UserBadge | null> => {
    try {
      const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
      if (!badge) return null;

      // Check if user already has this badge
      const existingBadge = userBadges.find(b => b.badge_id === badgeId);
      if (existingBadge) return null;

      const { data, error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          xp_earned: badge.xpReward,
          earned_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Award XP for the badge (this would typically integrate with useGamification)
      // For now, we'll record it in XP transactions
      await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          amount: badge.xpReward,
          source: 'badge',
          source_id: badgeId,
          description: `Earned ${badge.name} badge`
        });

      const newBadge = data as UserBadge;
      setUserBadges(prev => [newBadge, ...prev]);

      return newBadge;
    } catch (err) {
      console.error('Error awarding badge:', err);
      setError(err instanceof Error ? err.message : 'Failed to award badge');
      return null;
    }
  };

  const refreshBadges = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchUserBadges(),
      fetchAvailableBadges(),
      userId ? getBadgeProgress(userId) : Promise.resolve()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchUserBadges(),
        fetchAvailableBadges(),
        userId ? getBadgeProgress(userId) : Promise.resolve()
      ]);
      setIsLoading(false);
    };
    
    fetchData();
  }, [userId]);

  return {
    userBadges,
    availableBadges,
    badgeProgress,
    isLoading,
    error,
    checkBadgeEligibility,
    awardBadge,
    getBadgeProgress,
    refreshBadges
  };
} 