import { useState, useEffect } from 'react';
import { useSupabaseClient } from './useSupabaseClient';

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
  const supabase = useSupabaseClient();

  const generateInsights = async (): Promise<PrayerInsight[]> => {
    if (!userId) return [];

    try {
      const generatedInsights: PrayerInsight[] = [];
      const today = new Date();

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
        .gte('created_at', sevenDaysAgo.toISOString());

      // Get today's prayer records
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const { data: todayRecords } = await supabase
        .from('prayer_records')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString())
        .lt('created_at', todayEnd.toISOString());

      // Get last 30 days for deeper analysis
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: monthlyRecords } = await supabase
        .from('prayer_records')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // INSIGHT GENERATION LOGIC - Aim for 3-5 quality insights

      // 1. STREAK & CONSISTENCY INSIGHTS (Priority: High for milestones, Medium for progress)
      const currentStreak = userStats?.current_streak || 0;
      const bestStreak = userStats?.best_streak || 0;

      if (currentStreak >= 30) {
        generatedInsights.push({
          id: 'streak-master',
          title: `${currentStreak}-Day Master Streak! 🔥`,
          description: `You've achieved an incredible ${currentStreak}-day prayer streak! This level of consistency is truly inspiring.`,
          icon: 'LineChart',
          actionText: 'Share Achievement',
          priority: 'high',
          type: 'achievement',
          data: { streakDays: currentStreak, milestone: 30 }
        });
      } else if (currentStreak >= 14) {
        generatedInsights.push({
          id: 'streak-strong',
          title: `Strong ${currentStreak}-Day Streak`,
          description: `You're building excellent consistency! ${30 - currentStreak} more days to reach the 30-day milestone.`,
          icon: 'LineChart',
          actionText: 'View Progress',
          priority: 'high',
          type: 'streak',
          data: { streakDays: currentStreak, nextMilestone: 30 }
        });
      } else if (currentStreak >= 7) {
        generatedInsights.push({
          id: 'streak-building',
          title: `Week-Long Streak Achieved!`,
          description: `Great job maintaining a ${currentStreak}-day streak! You're developing a strong prayer habit.`,
          icon: 'LineChart',
          actionText: 'View Progress',
          priority: 'medium',
          type: 'streak',
          data: { streakDays: currentStreak, nextMilestone: 14 }
        });
      } else if (currentStreak > 0) {
        generatedInsights.push({
          id: 'streak-starting',
          title: `${currentStreak}-Day Start`,
          description: `You're building momentum! Keep going to reach your first week-long streak.`,
          icon: 'LineChart',
          actionText: 'Stay Motivated',
          priority: 'medium',
          type: 'streak',
          data: { streakDays: currentStreak, nextMilestone: 7 }
        });
      }

      // 2. TODAY'S PERFORMANCE INSIGHTS
      const todayCompleted = todayRecords?.filter(r => r.completed).length || 0;
      const todayTotal = todayRecords?.length || 5;
      const todayRemaining = todayTotal - todayCompleted;

      if (todayCompleted === todayTotal) {
        generatedInsights.push({
          id: 'today-perfect',
          title: 'Perfect Day Achieved! ⭐',
          description: `You've completed all ${todayTotal} prayers today! Your dedication is remarkable.`,
          icon: 'Trophy',
          actionText: 'Celebrate',
          priority: 'high',
          type: 'achievement',
          data: { completed: todayCompleted, total: todayTotal }
        });
      } else if (todayCompleted >= 3) {
        const currentHour = new Date().getHours();
        let timeContext = '';
        if (currentHour < 12) timeContext = 'Great morning start!';
        else if (currentHour < 17) timeContext = 'Solid afternoon progress!';
        else timeContext = 'Strong evening performance!';

        generatedInsights.push({
          id: 'today-progress',
          title: `${todayCompleted}/${todayTotal} Prayers Today`,
          description: `${timeContext} ${todayRemaining} prayer${todayRemaining > 1 ? 's' : ''} remaining to complete your day.`,
          icon: 'Bell',
          actionText: 'Set Reminder',
          priority: 'medium',
          type: 'reminder',
          data: { completed: todayCompleted, remaining: todayRemaining }
        });
      } else if (todayCompleted > 0) {
        generatedInsights.push({
          id: 'today-encourage',
          title: 'Keep Going Today',
          description: `You've started with ${todayCompleted} prayer${todayCompleted > 1 ? 's' : ''}. ${todayRemaining} more to complete your day!`,
          icon: 'Bell',
          actionText: 'Set Reminder',
          priority: 'high',
          type: 'reminder',
          data: { completed: todayCompleted, remaining: todayRemaining }
        });
      }

      // 3. WEEKLY PATTERN ANALYSIS
      const weeklyCompletion = (recentRecords?.filter(r => r.completed).length || 0) / 35; // 7 days * 5 prayers
      
      if (weeklyCompletion >= 0.9) {
        generatedInsights.push({
          id: 'weekly-excellent',
          title: 'Outstanding Week!',
          description: `${Math.round(weeklyCompletion * 100)}% completion rate this week. You're in the top tier of consistency!`,
          icon: 'LineChart',
          actionText: 'View Trends',
          priority: 'medium',
          type: 'progress',
          data: { weeklyCompletion, percentile: 95 }
        });
      } else if (weeklyCompletion >= 0.7) {
        generatedInsights.push({
          id: 'weekly-good',
          title: 'Solid Weekly Progress',
          description: `${Math.round(weeklyCompletion * 100)}% completion this week. Small improvements can lead to big results!`,
          icon: 'LineChart',
          actionText: 'Get Tips',
          priority: 'medium',
          type: 'progress',
          data: { weeklyCompletion }
        });
      } else if (weeklyCompletion < 0.5) {
        generatedInsights.push({
          id: 'weekly-challenge',
          title: 'Weekly Challenge',
          description: `This week needs attention (${Math.round(weeklyCompletion * 100)}% completion). Let's focus on improvement!`,
          icon: 'AlertTriangle',
          actionText: 'Get Support',
          priority: 'high',
          type: 'challenge',
          data: { weeklyCompletion }
        });
      }

      // 4. PRAYER-SPECIFIC INSIGHTS (Most challenging prayer)
      const prayerTypes = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const prayerStats = prayerTypes.map(prayer => {
        const prayerRecords = recentRecords?.filter(r => r.prayer_type === prayer) || [];
        const completed = prayerRecords.filter(r => r.completed).length;
        const total = prayerRecords.length;
        return {
          prayer,
          completion: total > 0 ? completed / total : 0,
          completed,
          total
        };
      });

      // Find most challenging prayer (lowest completion rate)
      const challengePrayer = prayerStats.reduce((prev, current) => 
        prev.completion < current.completion ? prev : current
      );

      if (challengePrayer.completion < 0.6 && challengePrayer.total > 0) {
        const prayerName = challengePrayer.prayer.charAt(0).toUpperCase() + challengePrayer.prayer.slice(1);
        generatedInsights.push({
          id: `challenge-${challengePrayer.prayer}`,
          title: `${prayerName} Focus Needed`,
          description: `${prayerName} has ${Math.round(challengePrayer.completion * 100)}% completion this week. This prayer could use some extra attention.`,
          icon: 'Target',
          actionText: 'Get Tips',
          priority: 'high',
          type: 'challenge',
          data: { 
            prayerType: challengePrayer.prayer, 
            completionRate: challengePrayer.completion,
            completed: challengePrayer.completed,
            total: challengePrayer.total
          }
        });
      }

      // 5. EMOTIONAL JOURNEY INSIGHTS (if available)
      const emotionalRecords = recentRecords?.filter(r => r.emotional_state_after) || [];
      if (emotionalRecords.length > 0) {
        const positiveEmotions = emotionalRecords.filter(r => 
          ['peaceful', 'grateful', 'focused', 'content', 'blessed'].includes(r.emotional_state_after)
        ).length;
        const emotionalRate = positiveEmotions / emotionalRecords.length;

        if (emotionalRate >= 0.8) {
          generatedInsights.push({
            id: 'emotional-positive',
            title: 'Positive Prayer Impact',
            description: `${Math.round(emotionalRate * 100)}% of your prayers resulted in positive emotions. Prayer is truly benefiting your well-being!`,
            icon: 'LineChart',
            actionText: 'View Journey',
            priority: 'medium',
            type: 'progress',
            data: { emotionalRate, positiveCount: positiveEmotions }
          });
        }
      }

      // 6. MILESTONE & ACHIEVEMENT INSIGHTS
      if (currentStreak > bestStreak) {
        generatedInsights.push({
          id: 'personal-best',
          title: 'New Personal Record!',
          description: `You've surpassed your previous best streak of ${bestStreak} days. You're stronger than ever!`,
          icon: 'Trophy',
          actionText: 'Celebrate',
          priority: 'high',
          type: 'achievement',
          data: { currentStreak, previousBest: bestStreak }
        });
      }

      // 7. TIME-BASED CONTEXTUAL INSIGHTS
      const currentHour = new Date().getHours();
      if (currentHour >= 17 && currentHour < 20) { // Evening time
        const maghribToday = todayRecords?.find(r => r.prayer_type === 'maghrib');
        if (!maghribToday?.completed) {
          generatedInsights.push({
            id: 'maghrib-evening',
            title: 'Maghrib Time Approaching',
            description: 'The blessed time of Maghrib is here. Take a moment to connect with Allah.',
            icon: 'Bell',
            actionText: 'Pray Now',
            priority: 'high',
            type: 'reminder',
            data: { prayerType: 'maghrib', timeContext: 'evening' }
          });
        }
      }

      // 8. MOTIVATIONAL INSIGHTS (when user needs encouragement)
      if (currentStreak === 0 && generatedInsights.length < 3) {
        generatedInsights.push({
          id: 'fresh-start',
          title: 'Fresh Start Opportunity',
          description: 'Every day is a new chance to build consistency. Start your prayer journey today!',
          icon: 'LineChart',
          actionText: 'Begin Today',
          priority: 'medium',
          type: 'reminder',
          data: { motivational: true }
        });
      }

      // QUALITY CONTROL: Ensure 3-5 insights, prioritize by importance
      const prioritizedInsights = generatedInsights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // Return top 5 insights, but ensure at least 3 if possible
      const finalInsights = prioritizedInsights.slice(0, 5);
      
      // If we have less than 3 insights, add some general motivational ones
      if (finalInsights.length < 3) {
        const motivationalInsights = [
          {
            id: 'daily-motivation',
            title: 'Stay Consistent',
            description: 'Consistency in prayer brings peace and blessings to your daily life.',
            icon: 'LineChart',
            actionText: 'Learn More',
            priority: 'low' as const,
            type: 'reminder' as const,
            data: { motivational: true }
          },
          {
            id: 'spiritual-growth',
            title: 'Spiritual Growth',
            description: 'Each prayer is a step forward in your spiritual journey. Keep growing!',
            icon: 'LineChart',
            actionText: 'Reflect',
            priority: 'low' as const,
            type: 'progress' as const,
            data: { motivational: true }
          }
        ];

        finalInsights.push(...motivationalInsights.slice(0, 3 - finalInsights.length));
      }

      return finalInsights;

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