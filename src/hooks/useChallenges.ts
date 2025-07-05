import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Challenge {
  id: string;
  user_id: string;
  challenge_id: string;
  challenge_type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  target: number;
  completed: boolean;
  xp_reward: number;
  expires_at: string;
  created_at: string;
  name?: string;
  description?: string;
  icon?: string;
}

interface ChallengeTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  xpReward: number;
  requirements: any;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ChallengeStats {
  totalChallenges: number;
  completedChallenges: number;
  completionRate: number;
  totalXpEarned: number;
  currentStreak: number;
  bestStreak: number;
  byType: Record<string, { total: number; completed: number; rate: number }>;
}

interface UseChallengesReturn {
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  challengeStats: ChallengeStats | null;
  isLoading: boolean;
  error: string | null;
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<boolean>;
  completeChallenge: (challengeId: string) => Promise<boolean>;
  generateDailyChallenges: () => Promise<Challenge[]>;
  generateWeeklyChallenges: () => Promise<Challenge[]>;
  getChallengeHistory: (limit?: number) => Promise<Challenge[]>;
  refreshChallenges: () => Promise<void>;
}

// Challenge templates based on gamification system
const DAILY_CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete all 5 prayers',
    icon: '🌟',
    type: 'daily',
    target: 5,
    xpReward: 150,
    requirements: { type: 'prayers_completed', count: 5 },
    difficulty: 'medium'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 3 prayers early',
    icon: '🐦',
    type: 'daily',
    target: 3,
    xpReward: 100,
    requirements: { type: 'early_prayers', count: 3 },
    difficulty: 'medium'
  },
  {
    id: 'dawn_focus',
    name: 'Dawn Focus',
    description: 'Complete Fajr prayer',
    icon: '🌅',
    type: 'daily',
    target: 1,
    xpReward: 75,
    requirements: { type: 'specific_prayer', prayer: 'fajr' },
    difficulty: 'easy'
  },
  {
    id: 'reflection_day',
    name: 'Reflection Day',
    description: 'Add reflections to 3 prayers',
    icon: '📝',
    type: 'daily',
    target: 3,
    xpReward: 80,
    requirements: { type: 'prayer_reflections', count: 3 },
    difficulty: 'easy'
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description: 'Maintain current streak',
    icon: '🔥',
    type: 'daily',
    target: 1,
    xpReward: 50,
    requirements: { type: 'maintain_streak' },
    difficulty: 'easy'
  }
];

const WEEKLY_CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'fajr_focus',
    name: 'Fajr Focus',
    description: 'Complete Fajr 6/7 days',
    icon: '🌄',
    type: 'weekly',
    target: 6,
    xpReward: 500,
    requirements: { type: 'specific_prayer_week', prayer: 'fajr', count: 6 },
    difficulty: 'hard'
  },
  {
    id: 'consistency_challenge',
    name: 'Consistency Challenge',
    description: 'Maintain 80%+ completion',
    icon: '⚡',
    type: 'weekly',
    target: 80,
    xpReward: 400,
    requirements: { type: 'completion_rate', percentage: 80 },
    difficulty: 'medium'
  },
  {
    id: 'perfect_days',
    name: 'Perfect Days',
    description: 'Have 3 perfect days',
    icon: '💎',
    type: 'weekly',
    target: 3,
    xpReward: 600,
    requirements: { type: 'perfect_days', count: 3 },
    difficulty: 'hard'
  },
  {
    id: 'early_week',
    name: 'Early Week',
    description: 'Complete 10 early prayers',
    icon: '⏰',
    type: 'weekly',
    target: 10,
    xpReward: 450,
    requirements: { type: 'early_prayers_week', count: 10 },
    difficulty: 'medium'
  },
  {
    id: 'reflection_week',
    name: 'Reflection Week',
    description: 'Add reflections to 15 prayers',
    icon: '📖',
    type: 'weekly',
    target: 15,
    xpReward: 350,
    requirements: { type: 'prayer_reflections_week', count: 15 },
    difficulty: 'easy'
  }
];

export function useChallenges(userId?: string): UseChallengesReturn {
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [challengeStats, setChallengeStats] = useState<ChallengeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Fetch active challenges (not expired and not completed)
      const { data: activeData, error: activeError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      // Fetch completed challenges (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: completedData, error: completedError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (completedError) throw completedError;

      // Enrich challenges with template data
      const enrichedActive = enrichChallengesWithTemplates(activeData || []);
      const enrichedCompleted = enrichChallengesWithTemplates(completedData || []);

      setActiveChallenges(enrichedActive);
      setCompletedChallenges(enrichedCompleted);

      // Calculate stats
      calculateChallengeStats([...enrichedActive, ...enrichedCompleted]);

    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch challenges');
    } finally {
      setIsLoading(false);
    }
  };

  const enrichChallengesWithTemplates = (challenges: any[]): Challenge[] => {
    const allTemplates = [...DAILY_CHALLENGE_TEMPLATES, ...WEEKLY_CHALLENGE_TEMPLATES];
    
    return challenges.map(challenge => {
      const template = allTemplates.find(t => t.id === challenge.challenge_id);
      return {
        ...challenge,
        name: template?.name || challenge.challenge_id,
        description: template?.description || 'Challenge description',
        icon: template?.icon || '🎯'
      };
    });
  };

  const calculateChallengeStats = (allChallenges: Challenge[]) => {
    const totalChallenges = allChallenges.length;
    const completed = allChallenges.filter(c => c.completed);
    const completedChallenges = completed.length;
    const completionRate = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;
    const totalXpEarned = completed.reduce((sum, c) => sum + c.xp_reward, 0);

    // Calculate streaks (consecutive days with completed challenges)
    const completedByDate = completed.reduce((acc, challenge) => {
      const date = challenge.created_at.split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(completedByDate).sort();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from today backwards)
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (completedByDate[dateStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate best streak
    for (const date of sortedDates) {
      if (completedByDate[date]) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Group by type
    const byType: Record<string, { total: number; completed: number; rate: number }> = {};
    
    allChallenges.forEach(challenge => {
      const type = challenge.challenge_type;
      if (!byType[type]) {
        byType[type] = { total: 0, completed: 0, rate: 0 };
      }
      
      byType[type].total++;
      if (challenge.completed) {
        byType[type].completed++;
      }
    });

    // Calculate rates
    Object.keys(byType).forEach(type => {
      const stats = byType[type];
      stats.rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
    });

    setChallengeStats({
      totalChallenges,
      completedChallenges,
      completionRate,
      totalXpEarned,
      currentStreak,
      bestStreak,
      byType
    });
  };

  const updateChallengeProgress = async (challengeId: string, progress: number): Promise<boolean> => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          progress: progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      // Update local state
      setActiveChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, progress }
          : challenge
      ));

      return true;
    } catch (err) {
      console.error('Error updating challenge progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update challenge progress');
      return false;
    }
  };

  const completeChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      setError(null);

      const challenge = activeChallenges.find(c => c.id === challengeId);
      if (!challenge) return false;

      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          completed: true,
          progress: challenge.target,
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      // Award XP
      await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          amount: challenge.xp_reward,
          source: 'challenge',
          source_id: challengeId,
          description: `Completed ${challenge.name} challenge`
        });

      // Move from active to completed
      const completedChallenge = { ...challenge, completed: true, progress: challenge.target };
      setActiveChallenges(prev => prev.filter(c => c.id !== challengeId));
      setCompletedChallenges(prev => [completedChallenge, ...prev]);

      return true;
    } catch (err) {
      console.error('Error completing challenge:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete challenge');
      return false;
    }
  };

  const generateDailyChallenges = async (): Promise<Challenge[]> => {
    if (!userId) return [];

    try {
      // Check if user already has daily challenges for today
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: existingChallenges } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_type', 'daily')
        .gte('created_at', today.toISOString().split('T')[0])
        .lt('created_at', tomorrow.toISOString().split('T')[0]);

      if (existingChallenges && existingChallenges.length > 0) {
        return existingChallenges;
      }

      // Generate 2-3 random daily challenges
      const selectedTemplates = DAILY_CHALLENGE_TEMPLATES
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const newChallenges = [];
      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999); // End of day

      for (const template of selectedTemplates) {
        const { data, error } = await supabase
          .from('user_challenges')
          .insert({
            user_id: userId,
            challenge_id: template.id,
            challenge_type: 'daily',
            progress: 0,
            target: template.target,
            completed: false,
            xp_reward: template.xpReward,
            expires_at: expiresAt.toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        if (data) newChallenges.push(data);
      }

      await fetchChallenges(); // Refresh the list
      return newChallenges;
    } catch (err) {
      console.error('Error generating daily challenges:', err);
      return [];
    }
  };

  const generateWeeklyChallenges = async (): Promise<Challenge[]> => {
    if (!userId) return [];

    try {
      // Check if user already has weekly challenges for this week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const { data: existingChallenges } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_type', 'weekly')
        .gte('created_at', startOfWeek.toISOString())
        .lt('created_at', endOfWeek.toISOString());

      if (existingChallenges && existingChallenges.length > 0) {
        return existingChallenges;
      }

      // Generate 2 weekly challenges
      const selectedTemplates = WEEKLY_CHALLENGE_TEMPLATES
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      const newChallenges = [];
      const expiresAt = new Date(endOfWeek);
      expiresAt.setHours(23, 59, 59, 999);

      for (const template of selectedTemplates) {
        const { data, error } = await supabase
          .from('user_challenges')
          .insert({
            user_id: userId,
            challenge_id: template.id,
            challenge_type: 'weekly',
            progress: 0,
            target: template.target,
            completed: false,
            xp_reward: template.xpReward,
            expires_at: expiresAt.toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        if (data) newChallenges.push(data);
      }

      await fetchChallenges(); // Refresh the list
      return newChallenges;
    } catch (err) {
      console.error('Error generating weekly challenges:', err);
      return [];
    }
  };

  const getChallengeHistory = async (limit: number = 50): Promise<Challenge[]> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return enrichChallengesWithTemplates(data || []);
    } catch (err) {
      console.error('Error fetching challenge history:', err);
      return [];
    }
  };

  const refreshChallenges = async () => {
    setIsLoading(true);
    await fetchChallenges();
  };

  useEffect(() => {
    fetchChallenges();
  }, [userId]);

  return {
    activeChallenges,
    completedChallenges,
    challengeStats,
    isLoading,
    error,
    updateChallengeProgress,
    completeChallenge,
    generateDailyChallenges,
    generateWeeklyChallenges,
    getChallengeHistory,
    refreshChallenges
  };
} 