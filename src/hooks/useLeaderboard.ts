import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  level: number;
  total_xp: number;
  rank: string;
  current_streak: number;
  total_prayers_completed: number;
  completion_rate: number;
  position: number;
}

interface LeaderboardStats {
  totalUsers: number;
  averageLevel: number;
  averageXP: number;
  topStreak: number;
  mostActiveUser: LeaderboardUser | null;
}

interface UserRanking {
  currentPosition: number;
  totalParticipants: number;
  percentile: number;
  nearbyUsers: LeaderboardUser[];
}

interface UseLeaderboardReturn {
  globalLeaderboard: LeaderboardUser[];
  weeklyLeaderboard: LeaderboardUser[];
  friendsLeaderboard: LeaderboardUser[];
  userRanking: UserRanking | null;
  leaderboardStats: LeaderboardStats | null;
  isLoading: boolean;
  error: string | null;
  getGlobalLeaderboard: (limit?: number) => Promise<LeaderboardUser[]>;
  getWeeklyLeaderboard: (limit?: number) => Promise<LeaderboardUser[]>;
  getFriendsLeaderboard: () => Promise<LeaderboardUser[]>;
  getUserRanking: (userId: string) => Promise<UserRanking | null>;
  refreshLeaderboards: () => Promise<void>;
}

export function useLeaderboard(userId?: string): UseLeaderboardReturn {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardUser[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardUser[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRanking, setUserRanking] = useState<UserRanking | null>(null);
  const [leaderboardStats, setLeaderboardStats] = useState<LeaderboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildLeaderboardUser = (userData: any, gamificationData: any, statsData: any, position: number): LeaderboardUser => {
    return {
      id: userData.id,
      display_name: userData.display_name || 'Anonymous User',
      avatar_url: userData.avatar_url,
      level: gamificationData?.level || 1,
      total_xp: gamificationData?.total_xp || 0,
      rank: gamificationData?.rank || 'New Believer',
      current_streak: statsData?.current_streak || 0,
      total_prayers_completed: statsData?.total_prayers_completed || 0,
      completion_rate: statsData?.completion_rate || 0,
      position
    };
  };

  const getGlobalLeaderboard = async (limit: number = 50): Promise<LeaderboardUser[]> => {
    try {
      setError(null);

      // Get users with their gamification data and stats
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('user_gamification')
        .select(`
          user_id,
          total_xp,
          level,
          rank,
          users!user_gamification_user_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          user_stats!user_stats_user_id_fkey (
            current_streak,
            total_prayers_completed,
            completion_rate
          )
        `)
        .order('total_xp', { ascending: false })
        .limit(limit);

      if (leaderboardError) throw leaderboardError;

      const leaderboard = (leaderboardData || []).map((entry, index) => 
        buildLeaderboardUser(
          entry.users,
          entry,
          entry.user_stats,
          index + 1
        )
      );

      setGlobalLeaderboard(leaderboard);
      calculateLeaderboardStats(leaderboard);
      
      return leaderboard;
    } catch (err) {
      console.error('Error fetching global leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch global leaderboard');
      return [];
    }
  };

  const getWeeklyLeaderboard = async (limit: number = 50): Promise<LeaderboardUser[]> => {
    try {
      setError(null);

      // Calculate weekly XP by summing XP transactions from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: weeklyXPData, error: weeklyError } = await supabase
        .from('xp_transactions')
        .select(`
          user_id,
          amount,
          users!xp_transactions_user_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          user_gamification!user_gamification_user_id_fkey (
            level,
            rank
          ),
          user_stats!user_stats_user_id_fkey (
            current_streak,
            total_prayers_completed,
            completion_rate
          )
        `)
        .gte('created_at', oneWeekAgo.toISOString());

      if (weeklyError) throw weeklyError;

      // Group by user and sum weekly XP
      const userWeeklyXP = (weeklyXPData || []).reduce((acc, transaction) => {
        const userId = transaction.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            weeklyXP: 0,
            userData: transaction.users,
            gamificationData: transaction.user_gamification,
            statsData: transaction.user_stats
          };
        }
        acc[userId].weeklyXP += transaction.amount;
        return acc;
      }, {} as Record<string, any>);

      // Sort by weekly XP and create leaderboard
      const sortedUsers = Object.entries(userWeeklyXP)
        .sort(([, a], [, b]) => b.weeklyXP - a.weeklyXP)
        .slice(0, limit);

      const leaderboard = sortedUsers.map(([userId, data], index) => ({
        ...buildLeaderboardUser(data.userData, data.gamificationData, data.statsData, index + 1),
        total_xp: data.weeklyXP // Override with weekly XP for this leaderboard
      }));

      setWeeklyLeaderboard(leaderboard);
      
      return leaderboard;
    } catch (err) {
      console.error('Error fetching weekly leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weekly leaderboard');
      return [];
    }
  };

  const getFriendsLeaderboard = async (): Promise<LeaderboardUser[]> => {
    if (!userId) return [];

    try {
      setError(null);

      // Get user's friends (this would need a friends table in a real implementation)
      // For now, we'll return an empty array as friends functionality isn't implemented yet
      const friendsLeaderboard: LeaderboardUser[] = [];
      
      setFriendsLeaderboard(friendsLeaderboard);
      
      return friendsLeaderboard;
    } catch (err) {
      console.error('Error fetching friends leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch friends leaderboard');
      return [];
    }
  };

  const getUserRanking = async (userId: string): Promise<UserRanking | null> => {
    try {
      setError(null);

      // Get user's current XP
      const { data: userGamification, error: userError } = await supabase
        .from('user_gamification')
        .select('total_xp')
        .eq('user_id', userId)
        .single();

      if (userError) throw userError;

      const userXP = userGamification?.total_xp || 0;

      // Count users with higher XP (to determine position)
      const { count: higherXPCount, error: countError } = await supabase
        .from('user_gamification')
        .select('*', { count: 'exact', head: true })
        .gt('total_xp', userXP);

      if (countError) throw countError;

      // Get total number of users
      const { count: totalUsers, error: totalError } = await supabase
        .from('user_gamification')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      const currentPosition = (higherXPCount || 0) + 1;
      const totalParticipants = totalUsers || 1;
      const percentile = ((totalParticipants - currentPosition) / totalParticipants) * 100;

      // Get nearby users (5 above and 5 below)
      const { data: nearbyData, error: nearbyError } = await supabase
        .from('user_gamification')
        .select(`
          user_id,
          total_xp,
          level,
          rank,
          users!user_gamification_user_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          user_stats!user_stats_user_id_fkey (
            current_streak,
            total_prayers_completed,
            completion_rate
          )
        `)
        .order('total_xp', { ascending: false })
        .range(Math.max(0, currentPosition - 6), currentPosition + 4);

      if (nearbyError) throw nearbyError;

      const nearbyUsers = (nearbyData || []).map((entry, index) => 
        buildLeaderboardUser(
          entry.users,
          entry,
          entry.user_stats,
          Math.max(1, currentPosition - 5) + index
        )
      );

      const ranking = {
        currentPosition,
        totalParticipants,
        percentile,
        nearbyUsers
      };

      setUserRanking(ranking);
      
      return ranking;
    } catch (err) {
      console.error('Error fetching user ranking:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user ranking');
      return null;
    }
  };

  const calculateLeaderboardStats = (leaderboard: LeaderboardUser[]) => {
    if (leaderboard.length === 0) return;

    const totalUsers = leaderboard.length;
    const averageLevel = leaderboard.reduce((sum, user) => sum + user.level, 0) / totalUsers;
    const averageXP = leaderboard.reduce((sum, user) => sum + user.total_xp, 0) / totalUsers;
    const topStreak = Math.max(...leaderboard.map(user => user.current_streak));
    const mostActiveUser = leaderboard.reduce((most, user) => 
      user.total_prayers_completed > (most?.total_prayers_completed || 0) ? user : most
    , null as LeaderboardUser | null);

    setLeaderboardStats({
      totalUsers,
      averageLevel,
      averageXP,
      topStreak,
      mostActiveUser
    });
  };

  const refreshLeaderboards = async () => {
    setIsLoading(true);
    await Promise.all([
      getGlobalLeaderboard(),
      getWeeklyLeaderboard(),
      getFriendsLeaderboard(),
      userId ? getUserRanking(userId) : Promise.resolve()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        getGlobalLeaderboard(),
        getWeeklyLeaderboard(),
        getFriendsLeaderboard(),
        userId ? getUserRanking(userId) : Promise.resolve()
      ]);
      setIsLoading(false);
    };
    
    fetchData();
  }, [userId]);

  return {
    globalLeaderboard,
    weeklyLeaderboard,
    friendsLeaderboard,
    userRanking,
    leaderboardStats,
    isLoading,
    error,
    getGlobalLeaderboard,
    getWeeklyLeaderboard,
    getFriendsLeaderboard,
    getUserRanking,
    refreshLeaderboards
  };
} 