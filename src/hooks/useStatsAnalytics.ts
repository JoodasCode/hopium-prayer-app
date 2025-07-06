import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PrayerStat {
  name: string;
  completion: number;
  status: 'challenge' | 'consistent' | 'improving';
  weeklyTrend: number;
}

interface WeeklyData {
  day: string;
  completedCount: number;
  totalCount: number;
  date: string;
}

interface MonthlyData {
  day: number;
  status: 'completed' | 'partial' | 'missed' | 'future';
  completionRate: number;
}

interface Milestone {
  name: string;
  daysLeft: number;
  progress: number;
  reward: string;
  target: number;
  current: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

interface StatsAnalytics {
  streak: {
    current: number;
    best: number;
    weekChange: number;
  };
  todayProgress: number;
  prayerStats: PrayerStat[];
  weeklyData: WeeklyData[];
  monthlyData: MonthlyData[];
  nextMilestone: Milestone;
  achievements: Achievement[];
  monthlyPerfectDays: number;
}

interface UseStatsAnalyticsReturn {
  analytics: StatsAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export function useStatsAnalytics(userId?: string): UseStatsAnalyticsReturn {
  const [analytics, setAnalytics] = useState<StatsAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculatePrayerStats = async (): Promise<PrayerStat[]> => {
    if (!userId) return [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: records } = await supabase
      .from('prayer_records')
      .select('prayer_type, completed_time, scheduled_time, completed')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_time', thirtyDaysAgo.toISOString());

    const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const stats: PrayerStat[] = [];

    for (const prayer of prayers) {
      const prayerRecords = records?.filter(r => r.prayer_type === prayer) || [];
      const totalExpected = 30; // 30 days
      const completed = prayerRecords.length;
      const completion = Math.round((completed / totalExpected) * 100);

      // Calculate weekly trend (last 7 days vs previous 7 days)
      const lastWeek = prayerRecords.filter(r => {
        const recordDate = new Date(r.completed_time);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return recordDate >= sevenDaysAgo;
      }).length;

      const previousWeek = prayerRecords.filter(r => {
        const recordDate = new Date(r.completed_time);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return recordDate >= fourteenDaysAgo && recordDate < sevenDaysAgo;
      }).length;

      const weeklyTrend = previousWeek > 0 ? ((lastWeek - previousWeek) / previousWeek) * 100 : 0;

      let status: 'challenge' | 'consistent' | 'improving' = 'consistent';
      if (completion < 70) status = 'challenge';
      else if (weeklyTrend > 10) status = 'improving';

      stats.push({
        name: prayer.charAt(0).toUpperCase() + prayer.slice(1),
        completion,
        status,
        weeklyTrend
      });
    }

    return stats;
  };

  const calculateWeeklyData = async (): Promise<WeeklyData[]> => {
    if (!userId) return [];

    const weekData: WeeklyData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const { count } = await supabase
        .from('prayer_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('completed_time', dayStart.toISOString())
        .lte('completed_time', dayEnd.toISOString());

      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completedCount: count || 0,
        totalCount: 5,
        date: date.toISOString()
      });
    }

    return weekData;
  };

  const calculateMonthlyData = async (): Promise<MonthlyData[]> => {
    if (!userId) return [];

    const monthData: MonthlyData[] = [];
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const isFuture = date > today;
      
      if (isFuture) {
        monthData.push({
          day,
          status: 'future',
          completionRate: 0
        });
        continue;
      }

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const { count } = await supabase
        .from('prayer_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('completed_time', dayStart.toISOString())
        .lte('completed_time', dayEnd.toISOString());

      const completionRate = (count || 0) / 5;
      let status: 'completed' | 'partial' | 'missed' = 'missed';
      
      if (completionRate === 1) status = 'completed';
      else if (completionRate > 0) status = 'partial';

      monthData.push({
        day,
        status,
        completionRate
      });
    }

    return monthData;
  };

  const calculateMilestone = async (currentStreak: number): Promise<Milestone> => {
    const milestones = [
      { target: 7, name: '7-Day Streak', reward: 'Bronze Badge' },
      { target: 14, name: '14-Day Streak', reward: 'Silver Badge' },
      { target: 30, name: '30-Day Perfect Streak', reward: 'Gold Badge' },
      { target: 60, name: '60-Day Warrior', reward: 'Diamond Badge' },
      { target: 100, name: '100-Day Champion', reward: 'Platinum Badge' },
      { target: 365, name: '1-Year Master', reward: 'Legendary Badge' }
    ];

    const nextMilestone = milestones.find(m => m.target > currentStreak) || milestones[milestones.length - 1];
    
    return {
      name: nextMilestone.name,
      daysLeft: nextMilestone.target - currentStreak,
      progress: (currentStreak / nextMilestone.target) * 100,
      reward: nextMilestone.reward,
      target: nextMilestone.target,
      current: currentStreak
    };
  };

  const calculateAchievements = async (): Promise<Achievement[]> => {
    if (!userId) return [];

    // Get user achievements from database using the correct table
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', userId);

    const allAchievements: Achievement[] = [
      {
        id: 'first_week',
        name: 'First Week Streak',
        description: 'Completed all prayers for 7 consecutive days',
        unlocked: false,
        icon: 'flame'
      },
      {
        id: 'fajr_warrior',
        name: 'Fajr Warrior',
        description: 'Completed Fajr prayer on time for 10 days',
        unlocked: false,
        icon: 'sun'
      },
      {
        id: 'perfect_day',
        name: 'Perfect Day',
        description: 'Completed all five prayers on time in a single day',
        unlocked: false,
        icon: 'award'
      },
      {
        id: 'month_master',
        name: '30-Day Master',
        description: 'Maintain your streak for 30 consecutive days',
        unlocked: false,
        icon: 'trophy'
      }
    ];

    // Mark achievements as unlocked based on user data
    userAchievements?.forEach(userAch => {
      const achievement = allAchievements.find(a => a.id === userAch.achievement_id);
      if (achievement) {
        achievement.unlocked = true;
        achievement.unlockedAt = userAch.earned_at;
      }
    });

    return allAchievements;
  };

  const fetchAnalytics = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);

      // Get user stats for streak data
      const { data: userStatsArray } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      const userStats = userStatsArray && userStatsArray.length > 0 ? userStatsArray[0] : null;

      // Calculate today's progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from('prayer_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('completed_time', today.toISOString());

      // Calculate previous week streak for comparison
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: lastWeekStatsArray } = await supabase
        .from('user_stats')
        .select('current_streak')
        .eq('user_id', userId)
        .gte('last_calculated_at', sevenDaysAgo.toISOString())
        .order('last_calculated_at', { ascending: false })
        .limit(1);

      const lastWeekStats = lastWeekStatsArray && lastWeekStatsArray.length > 0 ? lastWeekStatsArray[0] : null;

      const weekChange = lastWeekStats?.current_streak 
        ? ((userStats?.current_streak || 0) - lastWeekStats.current_streak) / lastWeekStats.current_streak * 100
        : 0;

      // Calculate monthly perfect days
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const { data: monthlyRecords } = await supabase
        .from('prayer_records')
        .select('completed_time')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('completed_time', monthStart.toISOString());

      // Group by day and count perfect days (5 prayers per day)
      const dailyCounts = monthlyRecords?.reduce((acc, record) => {
        const day = new Date(record.completed_time).toDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const monthlyPerfectDays = Object.values(dailyCounts).filter(count => count === 5).length;

      // Fetch all calculated data
      const [prayerStats, weeklyData, monthlyData, achievements] = await Promise.all([
        calculatePrayerStats(),
        calculateWeeklyData(),
        calculateMonthlyData(),
        calculateAchievements()
      ]);

      const nextMilestone = await calculateMilestone(userStats?.current_streak || 0);

      setAnalytics({
        streak: {
          current: userStats?.current_streak || 0,
          best: userStats?.best_streak || 0,
          weekChange: Math.round(weekChange)
        },
        todayProgress: todayCount || 0,
        prayerStats,
        weeklyData,
        monthlyData,
        nextMilestone,
        achievements,
        monthlyPerfectDays
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      
      // Fallback data
      setAnalytics({
        streak: { current: 0, best: 0, weekChange: 0 },
        todayProgress: 0,
        prayerStats: [],
        weeklyData: [],
        monthlyData: [],
        nextMilestone: {
          name: '7-Day Streak',
          daysLeft: 7,
          progress: 0,
          reward: 'Bronze Badge',
          target: 7,
          current: 0
        },
        achievements: [],
        monthlyPerfectDays: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setIsLoading(true);
    await fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics
  };
} 