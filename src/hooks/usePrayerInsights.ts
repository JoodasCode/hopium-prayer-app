import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PrayerInsight {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionText: string;
  priority: 'high' | 'medium' | 'low';
  type: 'streak' | 'reminder' | 'progress' | 'challenge' | 'achievement';
  data?: any;
}

interface UsePrayerInsightsReturn {
  insights: PrayerInsight[];
  isLoading: boolean;
  error: string | null;
  refreshInsights: () => Promise<void>;
  dismissInsight: (insightId: string) => Promise<void>;
}

export function usePrayerInsights(userId?: string): UsePrayerInsightsReturn {
  const [insights, setInsights] = useState<PrayerInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async (): Promise<PrayerInsight[]> => {
    if (!userId) return [];

    try {
      const generatedInsights: PrayerInsight[] = [];

      // Get user stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get recent prayer records (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: recentRecords } = await supabase
        .from('prayer_records')
        .select('*')
        .eq('user_id', userId)
        .gte('completed_at', sevenDaysAgo.toISOString());

      // Get today's prayer records
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: todayRecords } = await supabase
        .from('prayer_records')
        .select('*')
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())
        .lt('completed_at', tomorrow.toISOString());

      // Insight 1: Streak Analysis
      if (userStats?.current_streak >= 5) {
        const streakDays = userStats.current_streak;
        generatedInsights.push({
          id: 'streak-consistency',
          title: `${streakDays}-Day Streak!`,
          description: `You've been consistent with your prayers for ${streakDays} days. Keep it up!`,
          icon: 'LineChart',
          actionText: 'View Details',
          priority: 'high',
          type: 'streak',
          data: { streakDays }
        });
      } else if (userStats?.current_streak > 0) {
        generatedInsights.push({
          id: 'streak-building',
          title: 'Building Your Streak',
          description: `You're on day ${userStats.current_streak} of your prayer streak. Stay consistent!`,
          icon: 'LineChart',
          actionText: 'View Progress',
          priority: 'medium',
          type: 'streak',
          data: { streakDays: userStats.current_streak }
        });
      }

      // Insight 2: Prayer Challenge Detection
      const prayerTypes = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      for (const prayerType of prayerTypes) {
        const prayerRecords = recentRecords?.filter(r => r.prayer_type === prayerType) || [];
        const completionRate = prayerRecords.length / 7; // 7 days

        if (completionRate < 0.6) { // Less than 60% completion
          generatedInsights.push({
            id: `challenge-${prayerType}`,
            title: `${prayerType.charAt(0).toUpperCase() + prayerType.slice(1)} Challenge`,
            description: `Your ${prayerType} prayer consistency needs attention. You completed ${Math.round(completionRate * 100)}% this week.`,
            icon: 'AlertTriangle',
            actionText: 'Get Tips',
            priority: 'high',
            type: 'challenge',
            data: { prayerType, completionRate }
          });
          break; // Only show one challenge at a time
        }
      }

      // Insight 3: Today's Progress
      const todayCount = todayRecords?.length || 0;
      if (todayCount < 5) {
        const remaining = 5 - todayCount;
        generatedInsights.push({
          id: 'today-progress',
          title: 'Today\'s Progress',
          description: `You've completed ${todayCount}/5 prayers today. ${remaining} prayer${remaining > 1 ? 's' : ''} remaining.`,
          icon: 'Bell',
          actionText: 'Set Reminder',
          priority: todayCount === 0 ? 'high' : 'medium',
          type: 'reminder',
          data: { completed: todayCount, remaining }
        });
      } else {
        generatedInsights.push({
          id: 'today-complete',
          title: 'Perfect Day!',
          description: 'You\'ve completed all 5 prayers today. Excellent work!',
          icon: 'LineChart',
          actionText: 'View Stats',
          priority: 'medium',
          type: 'achievement',
          data: { completed: 5 }
        });
      }

      // Insight 4: Weekly Progress
      const weeklyCompletion = (recentRecords?.length || 0) / 35; // 7 days * 5 prayers
      if (weeklyCompletion > 0.9) {
        generatedInsights.push({
          id: 'weekly-excellent',
          title: 'Excellent Week!',
          description: `You completed ${Math.round(weeklyCompletion * 100)}% of your prayers this week. Outstanding!`,
          icon: 'LineChart',
          actionText: 'View Progress',
          priority: 'medium',
          type: 'progress',
          data: { weeklyCompletion }
        });
      } else if (weeklyCompletion > 0.7) {
        generatedInsights.push({
          id: 'weekly-good',
          title: 'Good Progress',
          description: `You completed ${Math.round(weeklyCompletion * 100)}% of your prayers this week. Keep improving!`,
          icon: 'LineChart',
          actionText: 'View Progress',
          priority: 'medium',
          type: 'progress',
          data: { weeklyCompletion }
        });
      }

      // Insight 5: Next Prayer Reminder (if applicable)
      // This would require prayer times calculation
      const now = new Date();
      const currentHour = now.getHours();
      
      // Simple time-based reminder logic
      if (currentHour >= 16 && currentHour < 19) { // Between 4-7 PM
        const maghribRecord = todayRecords?.find(r => r.prayer_type === 'maghrib');
        if (!maghribRecord) {
          generatedInsights.push({
            id: 'maghrib-reminder',
            title: 'Maghrib Time Approaching',
            description: 'Maghrib prayer time is approaching. Prepare for prayer!',
            icon: 'Bell',
            actionText: 'Set Reminder',
            priority: 'high',
            type: 'reminder',
            data: { prayerType: 'maghrib' }
          });
        }
      }

      // Sort insights by priority
      return generatedInsights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (err) {
      console.error('Error generating insights:', err);
      return [];
    }
  };

  const fetchInsights = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const generatedInsights = await generateInsights();
      setInsights(generatedInsights);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshInsights = async () => {
    setIsLoading(true);
    await fetchInsights();
  };

  const dismissInsight = async (insightId: string) => {
    try {
      // Remove from local state
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
      
      // In a real app, you might want to save dismissed insights to prevent them from reappearing
      // For now, we'll just remove them locally
    } catch (err) {
      console.error('Error dismissing insight:', err);
      setError(err instanceof Error ? err.message : 'Failed to dismiss insight');
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  return {
    insights,
    isLoading,
    error,
    refreshInsights,
    dismissInsight
  };
} 