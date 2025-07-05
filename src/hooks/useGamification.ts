import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface GamificationProfile {
  level: number;
  currentXp: number;
  xpToNext: number;
  totalXp: number;
  rank: string;
  rankColor: string;
  benefits: string[];
}

interface XPTransaction {
  id: string;
  amount: number;
  source: string;
  source_id?: string;
  description: string;
  created_at: string;
}

interface LevelUpResult {
  newLevel: number;
  newRank: string;
  xpEarned: number;
  unlockedFeatures: string[];
}

interface UseGamificationReturn {
  profile: GamificationProfile | null;
  xpHistory: XPTransaction[];
  isLoading: boolean;
  error: string | null;
  awardXP: (amount: number, source: string, sourceId?: string, description?: string) => Promise<LevelUpResult | null>;
  calculatePrayerXP: (prayerType: string, isEarly: boolean, hasReflection: boolean) => number;
  checkLevelUp: () => Promise<LevelUpResult | null>;
  refreshProfile: () => Promise<void>;
  getXPHistory: (limit?: number) => Promise<void>;
}

// XP Values from gamification system
const XP_VALUES = {
  PRAYER_BASE: 25,
  PRAYER_EARLY: 35,
  FAJR_BASE: 40,
  STREAK_DAY: 15,
  PERFECT_DAY: 100,
  REFLECTION: 10,
  BADGE_EARNED: 50,
  MILESTONE: 200
};

// Rank system configuration
const RANKS = [
  { minLevel: 1, maxLevel: 4, name: 'New Believer', color: 'gray', benefits: ['Basic tracking', 'Getting started guide'] },
  { minLevel: 5, maxLevel: 9, name: 'Growing Muslim', color: 'pink-to-red', benefits: ['Progress tracking', 'Simple stats'] },
  { minLevel: 10, maxLevel: 14, name: 'Devoted Believer', color: 'red-to-orange', benefits: ['Prayer analytics', 'Streak tracking'] },
  { minLevel: 15, maxLevel: 19, name: 'Dedicated Worshipper', color: 'orange-to-yellow', benefits: ['Weekly insights', 'Milestone tracking'] },
  { minLevel: 20, maxLevel: 24, name: 'Consistent Believer', color: 'yellow-to-green', benefits: ['Streak protection', 'Advanced stats'] },
  { minLevel: 25, maxLevel: 29, name: 'Faithful Servant', color: 'green-to-blue', benefits: ['Progress analytics', 'Custom reminders'] },
  { minLevel: 30, maxLevel: 39, name: 'Devoted Scholar', color: 'blue-to-indigo', benefits: ['Detailed insights', 'Achievement tracking'] },
  { minLevel: 40, maxLevel: 49, name: 'Prayer Guardian', color: 'indigo-to-purple', benefits: ['Advanced analytics', 'Custom challenges'] },
  { minLevel: 50, maxLevel: 999, name: 'Spiritual Master', color: 'purple-to-pink', benefits: ['All features unlocked', 'Master recognition'] }
];

function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  
  const baseXP = 100;
  const exponentialFactor = 1.5;
  
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += Math.floor(baseXP * Math.pow(exponentialFactor, i - 2));
  }
  
  return totalXP;
}

function getRankForLevel(level: number) {
  return RANKS.find(rank => level >= rank.minLevel && level <= rank.maxLevel) || RANKS[0];
}

export function useGamification(userId?: string): UseGamificationReturn {
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [xpHistory, setXpHistory] = useState<XPTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Check if user has gamification profile
      let { data: gamificationData, error: fetchError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Create profile if it doesn't exist
      if (fetchError?.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('user_gamification')
          .insert({
            user_id: userId,
            total_xp: 0,
            level: 1,
            current_xp: 0,
            xp_to_next: 100,
            rank: 'New Believer'
          })
          .select()
          .single();

        if (createError) throw createError;
        gamificationData = newProfile;
      } else if (fetchError) {
        throw fetchError;
      }

      if (gamificationData) {
        const rank = getRankForLevel(gamificationData.level);
        
        setProfile({
          level: gamificationData.level,
          currentXp: gamificationData.current_xp,
          xpToNext: gamificationData.xp_to_next,
          totalXp: gamificationData.total_xp,
          rank: rank.name,
          rankColor: rank.color,
          benefits: rank.benefits
        });
      }
    } catch (err) {
      console.error('Error fetching gamification profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrayerXP = (prayerType: string, isEarly: boolean, hasReflection: boolean): number => {
    let baseXP = XP_VALUES.PRAYER_BASE;
    
    // Fajr gets special bonus
    if (prayerType.toLowerCase() === 'fajr') {
      baseXP = XP_VALUES.FAJR_BASE;
    } else if (isEarly) {
      baseXP = XP_VALUES.PRAYER_EARLY;
    }
    
    // Add reflection bonus
    if (hasReflection) {
      baseXP += XP_VALUES.REFLECTION;
    }
    
    return baseXP;
  };

  const awardXP = async (
    amount: number, 
    source: string, 
    sourceId?: string, 
    description?: string
  ): Promise<LevelUpResult | null> => {
    if (!userId) return null;

    try {
      setError(null);

      // Record XP transaction
      const { error: transactionError } = await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          amount,
          source,
          source_id: sourceId,
          description: description || `Earned ${amount} XP from ${source}`
        });

      if (transactionError) throw transactionError;

      // Update user gamification profile
      const { data: currentProfile, error: profileError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      const newTotalXP = currentProfile.total_xp + amount;
      const newCurrentXP = currentProfile.current_xp + amount;
      
      // Check for level up
      let newLevel = currentProfile.level;
      let finalCurrentXP = newCurrentXP;
      let finalXPToNext = currentProfile.xp_to_next;
      
      while (finalCurrentXP >= finalXPToNext) {
        finalCurrentXP -= finalXPToNext;
        newLevel++;
        finalXPToNext = Math.floor(100 * Math.pow(1.5, newLevel - 2));
      }

      // Update database
      const { error: updateError } = await supabase
        .from('user_gamification')
        .update({
          total_xp: newTotalXP,
          level: newLevel,
          current_xp: finalCurrentXP,
          xp_to_next: finalXPToNext,
          rank: getRankForLevel(newLevel).name,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Update local state
      const rank = getRankForLevel(newLevel);
      setProfile({
        level: newLevel,
        currentXp: finalCurrentXP,
        xpToNext: finalXPToNext,
        totalXp: newTotalXP,
        rank: rank.name,
        rankColor: rank.color,
        benefits: rank.benefits
      });

      // Return level up info if applicable
      if (newLevel > currentProfile.level) {
        return {
          newLevel,
          newRank: rank.name,
          xpEarned: amount,
          unlockedFeatures: rank.benefits
        };
      }

      return null;
    } catch (err) {
      console.error('Error awarding XP:', err);
      setError(err instanceof Error ? err.message : 'Failed to award XP');
      return null;
    }
  };

  const checkLevelUp = async (): Promise<LevelUpResult | null> => {
    if (!userId || !profile) return null;

    try {
      const currentLevelXP = calculateXPForLevel(profile.level);
      const nextLevelXP = calculateXPForLevel(profile.level + 1);
      
      if (profile.totalXp >= nextLevelXP) {
        return await awardXP(0, 'level_check', undefined, 'Level up check');
      }
      
      return null;
    } catch (err) {
      console.error('Error checking level up:', err);
      return null;
    }
  };

  const getXPHistory = async (limit: number = 50) => {
    if (!userId) return;

    try {
      setError(null);
      
      const { data, error: historyError } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (historyError) throw historyError;

      setXpHistory(data || []);
    } catch (err) {
      console.error('Error fetching XP history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch XP history');
    }
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    await Promise.all([fetchProfile(), getXPHistory()]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfile(), getXPHistory()]);
      setIsLoading(false);
    };
    
    fetchData();
  }, [userId]);

  return {
    profile,
    xpHistory,
    isLoading,
    error,
    awardXP,
    calculatePrayerXP,
    checkLevelUp,
    refreshProfile,
    getXPHistory
  };
} 