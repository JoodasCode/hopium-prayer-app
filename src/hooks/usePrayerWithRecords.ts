'use client';

import { useMemo } from 'react';
import { usePrayerTimes } from './usePrayerTimes';
import { usePrayerRecords } from './usePrayerRecords';
import type { Prayer } from '@/types';

interface UsePrayerWithRecordsProps {
  userId?: string;
  date?: Date;
}

export function usePrayerWithRecords({ 
  userId, 
  date = new Date() 
}: UsePrayerWithRecordsProps = {}) {
  const today = date.toISOString().split('T')[0];
  
  // Get prayer times and location
  const { 
    prayerTimes, 
    nextPrayer: baseNextPrayer, 
    prayers: basePrayers, 
    location, 
    isLoading: prayerTimesLoading, 
    error: prayerTimesError,
    refreshPrayerTimes 
  } = usePrayerTimes({ userId, date });
  
  // Get prayer records from database
  const { 
    prayerRecords, 
    isLoading: recordsLoading,
    completePrayerWithReflection 
  } = usePrayerRecords(userId, today);
  
  // Merge prayer times with database records
  const prayers = useMemo(() => {
    if (!basePrayers || !prayerRecords) return basePrayers || [];
    
    return basePrayers.map(prayer => {
      // Find matching record in database
      const record = prayerRecords.find(record => 
        record.prayer_type === prayer.name.toLowerCase() &&
        new Date(record.scheduled_time).toDateString() === prayer.time.toDateString()
      );
      
      if (record) {
        // Update prayer with database information
        return {
          ...prayer,
          id: record.id,
          status: record.completed ? 'completed' as const : 
                 new Date(record.scheduled_time) < new Date() ? 'missed' as const : 'upcoming' as const,
                     completedTime: record.completed_time ? new Date(record.completed_time).toISOString() : undefined,
          emotionalState: record.emotional_state_after || undefined,
          mindfulnessScore: record.mindfulness_score || undefined,
          location: record.location ? record.location.type : undefined,
          notes: record.notes || undefined,
          timeAgo: record.completed_time ? 
            getTimeAgo(new Date(record.completed_time)) : undefined
        };
      }
      
      return prayer;
    });
  }, [basePrayers, prayerRecords]);
  
  // Update next prayer based on actual completion status
  const nextPrayer = useMemo(() => {
    if (!prayers) return null;
    
    // Find the next uncompleted prayer
    const now = new Date();
    const upcomingPrayers = prayers.filter(p => 
      p.status !== 'completed' && p.time > now
    );
    
    return upcomingPrayers.length > 0 ? upcomingPrayers[0] : null;
  }, [prayers]);
  
  // Calculate today's progress based on actual completion
  const todaysProgress = useMemo(() => {
    if (!prayers) return { completed: 0, total: 5, percentage: 0 };
    
    const completed = prayers.filter(p => p.status === 'completed').length;
    const total = prayers.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }, [prayers]);
  
  const isLoading = prayerTimesLoading || recordsLoading;
  const error = prayerTimesError;
  
  return {
    prayerTimes,
    nextPrayer,
    prayers,
    location,
    isLoading,
    error,
    refreshPrayerTimes,
    todaysProgress,
    completePrayerWithReflection
  };
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
} 