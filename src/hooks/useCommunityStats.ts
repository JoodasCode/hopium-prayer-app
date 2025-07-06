import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CommunityStats {
  total_active_users: number;
  users_praying_now: number;
  user_percentile?: number;
  total_prayers_today: number;
  community_streak_average: number;
}

interface UseCommunityStatsReturn {
  communityStats: CommunityStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export function useCommunityStats(userId?: string): UseCommunityStatsReturn {
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunityStats = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Get total active users (users who prayed in last 7 days)
      const { count: activeUsers } = await supabase
        .from('prayer_records')
        .select('user_id', { count: 'exact', head: true })
        .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('user_id', 'is', null);

      // Get users who prayed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: usersToday } = await supabase
        .from('prayer_records')
        .select('user_id', { count: 'exact', head: true })
        .gte('completed_at', today.toISOString())
        .not('user_id', 'is', null);

      // Get total prayers completed today
      const { count: prayersToday } = await supabase
        .from('prayer_records')
        .select('*', { count: 'exact', head: true })
        .gte('completed_at', today.toISOString());

      // Get user's current stats for percentile calculation
      const { data: userStatsArray } = await supabase
        .from('user_stats')
        .select('current_streak, completion_rate')
        .eq('user_id', userId)
        .limit(1);

      const userStats = userStatsArray && userStatsArray.length > 0 ? userStatsArray[0] : null;

      // Calculate user percentile based on completion rate
      let userPercentile = null;
      if (userStats?.completion_rate) {
        const { count: betterUsers } = await supabase
          .from('user_stats')
          .select('*', { count: 'exact', head: true })
          .gt('completion_rate', userStats.completion_rate);

        const { count: totalUsers } = await supabase
          .from('user_stats')
          .select('*', { count: 'exact', head: true });

        if (totalUsers && totalUsers > 0) {
          userPercentile = Math.round((1 - (betterUsers || 0) / totalUsers) * 100);
        }
      }

      // Get community average streak
      const { data: avgStreak } = await supabase
        .from('user_stats')
        .select('current_streak')
        .not('current_streak', 'is', null);

      const communityStreakAverage = avgStreak && avgStreak.length > 0
        ? Math.round(avgStreak.reduce((sum, stat) => sum + stat.current_streak, 0) / avgStreak.length)
        : 0;

      setCommunityStats({
        total_active_users: activeUsers || 0,
        users_praying_now: usersToday || 0,
        user_percentile: userPercentile ?? undefined,
        total_prayers_today: prayersToday || 0,
        community_streak_average: communityStreakAverage
      });

    } catch (err) {
      console.error('Error fetching community stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch community stats');
      
      // Fallback to reasonable default values
      setCommunityStats({
        total_active_users: 1000,
        users_praying_now: 150,
        user_percentile: 50,
        total_prayers_today: 500,
        community_streak_average: 5
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    setIsLoading(true);
    await fetchCommunityStats();
  };

  useEffect(() => {
    fetchCommunityStats();
  }, [userId]);

  return {
    communityStats,
    isLoading,
    error,
    refreshStats
  };
} 