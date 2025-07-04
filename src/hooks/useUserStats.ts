'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { UserStats } from '@/types';

// User stats hook with real-time calculation fallback
export function useUserStats(userId: string | undefined) {
  const fetchUserStats = async (): Promise<UserStats | null> => {
    if (!userId) return null;
    
    // First, try to get existing user stats
    const { data: existingStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // If user stats exist, return them
    if (existingStats && !statsError) {
      return existingStats;
    }
    
    // If no user stats exist, calculate them from prayer records
    console.log('No user stats found, calculating from prayer records...');
    
    // Get all prayer records for this user
    const { data: prayerRecords, error: recordsError } = await supabase
      .from('prayer_records')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_time', { ascending: false });
    
    if (recordsError) {
      console.error('Error fetching prayer records:', recordsError);
      return getDefaultStats(userId);
    }
    
    if (!prayerRecords || prayerRecords.length === 0) {
      console.log('No prayer records found, returning default stats');
      return getDefaultStats(userId);
    }
    
    // Calculate stats from prayer records
    const calculatedStats = calculateStatsFromRecords(userId, prayerRecords);
    
    // Optionally, save calculated stats to database for future use
    try {
      const { error: insertError } = await supabase
        .from('user_stats')
        .insert([calculatedStats]);
      
      if (insertError) {
        console.log('Could not save calculated stats:', insertError.message);
      } else {
        console.log('Calculated stats saved to database');
      }
    } catch (saveError) {
      console.log('Error saving calculated stats:', saveError);
    }
    
    return calculatedStats;
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['user_stats', userId],
    queryFn: fetchUserStats,
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for real-time feel)
    refetchOnWindowFocus: true,
  });
  
  return {
    userStats: data,
    isLoading,
    error,
  };
}

// Calculate stats from prayer records
function calculateStatsFromRecords(userId: string, records: any[]): UserStats {
  const completed = records.filter(r => r.completed);
  const totalPrayers = records.length;
  const totalCompleted = completed.length;
  const totalMissed = totalPrayers - totalCompleted;
  
  // Calculate completion rate
  const completionRate = totalPrayers > 0 ? Math.round((totalCompleted / totalPrayers) * 100) : 0;
  
  // Calculate current streak
  const currentStreak = calculateCurrentStreak(records);
  
  // Calculate best streak
  const bestStreak = calculateBestStreak(records);
  
  // Calculate average mindfulness score
  const mindfulnessScores = completed
    .filter(r => r.mindfulness_score !== null)
    .map(r => r.mindfulness_score);
  
  const avgMindfulness = mindfulnessScores.length > 0 
    ? Math.round((mindfulnessScores.reduce((a, b) => a + b, 0) / mindfulnessScores.length) * 10) / 10
    : 0;
  
  // Calculate streak shields (every 7 days of streak)
  const streakShields = Math.floor(bestStreak / 7);
  
  return {
    user_id: userId,
    current_streak: currentStreak,
    best_streak: bestStreak,
    total_prayers_completed: totalCompleted,
    total_prayers_missed: totalMissed,
    completion_rate: completionRate,
    streak_shields: streakShields,
    mindfulness_index: avgMindfulness,
    last_calculated_at: new Date().toISOString(),
  };
}

// Calculate current streak from recent records
function calculateCurrentStreak(records: any[]): number {
  if (records.length === 0) return 0;
  
  // Group records by date
  const recordsByDate = groupRecordsByDate(records);
  const dates = Object.keys(recordsByDate).sort().reverse(); // Most recent first
  
  let currentStreak = 0;
  
  for (const date of dates) {
    const dayRecords = recordsByDate[date];
    const completedCount = dayRecords.filter(r => r.completed).length;
    const totalCount = dayRecords.length;
    
    // Check if this date falls within a period exemption
    const isExemptDay = checkPeriodExemption(date, dayRecords[0]?.user_id);
    
    if (isExemptDay) {
      // Exempt days count as completed for streak purposes
      currentStreak++;
      continue;
    }
    
    // Consider a day "complete" if 80% or more prayers are completed
    const dayCompletionRate = totalCount > 0 ? completedCount / totalCount : 0;
    
    if (dayCompletionRate >= 0.8) {
      currentStreak++;
    } else {
      break; // Streak is broken
    }
  }
  
  return currentStreak;
}

// Calculate best streak from all records
function calculateBestStreak(records: any[]): number {
  if (records.length === 0) return 0;
  
  const recordsByDate = groupRecordsByDate(records);
  const dates = Object.keys(recordsByDate).sort(); // Chronological order
  
  let bestStreak = 0;
  let currentStreak = 0;
  
  for (const date of dates) {
    const dayRecords = recordsByDate[date];
    const completedCount = dayRecords.filter(r => r.completed).length;
    const totalCount = dayRecords.length;
    
    // Check if this date falls within a period exemption
    const isExemptDay = checkPeriodExemption(date, dayRecords[0]?.user_id);
    
    if (isExemptDay) {
      // Exempt days count as completed for streak purposes
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
      continue;
    }
    
    const dayCompletionRate = totalCount > 0 ? completedCount / totalCount : 0;
    
    if (dayCompletionRate >= 0.8) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return bestStreak;
}

// Check if a date falls within a period exemption
function checkPeriodExemption(date: string, userId: string): boolean {
  // This is a simplified check - in a real implementation, you'd want to
  // query the period_exemptions table asynchronously
  // For now, we'll return false and implement the full logic later
  return false;
}

// Group records by date
function groupRecordsByDate(records: any[]): { [date: string]: any[] } {
  const grouped: { [date: string]: any[] } = {};
  
  records.forEach(record => {
    const date = new Date(record.scheduled_time).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(record);
  });
  
  return grouped;
}

// Default stats for new users
function getDefaultStats(userId: string): UserStats {
  return {
    user_id: userId,
    current_streak: 0,
    best_streak: 0,
    total_prayers_completed: 0,
    total_prayers_missed: 0,
    completion_rate: 0,
    streak_shields: 0,
    mindfulness_index: 0,
    last_calculated_at: new Date().toISOString(),
  };
}
