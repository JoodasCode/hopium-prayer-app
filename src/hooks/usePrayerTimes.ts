'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Prayer = {
  id: string;
  name: string;
  time: Date;
  timestamp: number; // Unix timestamp in ms
  formattedTime: string;
  status: 'upcoming' | 'current' | 'missed' | 'completed';
};

type PrayerTimesResult = {
  prayers: Prayer[];
  nextPrayer: Prayer | null;
  currentPrayer: Prayer | null;
  loading: boolean;
  error: string | null;
  todayCompleted: number;
  todayMissed: number;
  currentStreak: number;
  refreshPrayers: () => Promise<void>;
  completePrayer: (prayerId: string) => Promise<void>;
  markAsMissed: (prayerId: string) => Promise<void>;
  markAsQada: (prayerId: string) => Promise<void>;
};

export function usePrayerTimes(): PrayerTimesResult {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayCompleted, setTodayCompleted] = useState(0);
  const [todayMissed, setTodayMissed] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Function to fetch prayers from the database or API
  const fetchPrayers = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from Supabase
      // For now, we'll create mock data
      const now = new Date();
      const currentHour = now.getHours();
      
      // Create mock prayers for today
      const mockPrayers: Prayer[] = [
        {
          id: '1',
          name: 'Fajr',
          time: new Date(now.setHours(5, 30, 0, 0)),
          timestamp: new Date(now.setHours(5, 30, 0, 0)).getTime(),
          formattedTime: '5:30 AM',
          status: currentHour >= 5 ? 'completed' : 'upcoming'
        },
        {
          id: '2',
          name: 'Dhuhr',
          time: new Date(now.setHours(13, 15, 0, 0)),
          timestamp: new Date(now.setHours(13, 15, 0, 0)).getTime(),
          formattedTime: '1:15 PM',
          status: currentHour >= 13 ? 'completed' : 'upcoming'
        },
        {
          id: '3',
          name: 'Asr',
          time: new Date(now.setHours(16, 45, 0, 0)),
          timestamp: new Date(now.setHours(16, 45, 0, 0)).getTime(),
          formattedTime: '4:45 PM',
          status: 'upcoming'
        },
        {
          id: '4',
          name: 'Maghrib',
          time: new Date(now.setHours(19, 30, 0, 0)),
          timestamp: new Date(now.setHours(19, 30, 0, 0)).getTime(),
          formattedTime: '7:30 PM',
          status: 'upcoming'
        },
        {
          id: '5',
          name: 'Isha',
          time: new Date(now.setHours(21, 0, 0, 0)),
          timestamp: new Date(now.setHours(21, 0, 0, 0)).getTime(),
          formattedTime: '9:00 PM',
          status: 'upcoming'
        }
      ];
      
      setPrayers(mockPrayers);
      setTodayCompleted(2); // Mock data - 2 prayers completed
      setTodayMissed(0);
      setCurrentStreak(5); // Mock streak data
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch prayer times. Please try again.');
      setLoading(false);
    }
  };

  // Find next prayer
  const getNextPrayer = (): Prayer | null => {
    const now = new Date().getTime();
    const upcoming = prayers
      .filter(prayer => prayer.timestamp > now && prayer.status === 'upcoming')
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  // Find current prayer
  const getCurrentPrayer = (): Prayer | null => {
    return prayers.find(prayer => prayer.status === 'current') || null;
  };

  // Complete a prayer
  const completePrayer = async (prayerId: string): Promise<void> => {
    try {
      // In a real implementation, this would update Supabase
      setPrayers(prev => 
        prev.map(prayer => 
          prayer.id === prayerId 
            ? {...prayer, status: 'completed'} 
            : prayer
        )
      );
      setTodayCompleted(prev => prev + 1);
    } catch (err) {
      setError('Failed to mark prayer as completed.');
    }
  };

  // Mark as missed
  const markAsMissed = async (prayerId: string): Promise<void> => {
    try {
      setPrayers(prev => 
        prev.map(prayer => 
          prayer.id === prayerId 
            ? {...prayer, status: 'missed'} 
            : prayer
        )
      );
      setTodayMissed(prev => prev + 1);
    } catch (err) {
      setError('Failed to mark prayer as missed.');
    }
  };

  // Mark as Qada (make up prayer)
  const markAsQada = async (prayerId: string): Promise<void> => {
    try {
      setPrayers(prev => 
        prev.map(prayer => 
          prayer.id === prayerId 
            ? {...prayer, status: 'completed'} 
            : prayer
        )
      );
      setTodayMissed(prev => prev - 1);
      setTodayCompleted(prev => prev + 1);
    } catch (err) {
      setError('Failed to mark prayer as Qada.');
    }
  };

  // Refresh prayers
  const refreshPrayers = async (): Promise<void> => {
    await fetchPrayers();
  };

  // Initialize on component mount
  useEffect(() => {
    fetchPrayers();
  }, []);

  return {
    prayers,
    nextPrayer: getNextPrayer(),
    currentPrayer: getCurrentPrayer(),
    loading,
    error,
    todayCompleted,
    todayMissed,
    currentStreak,
    refreshPrayers,
    completePrayer,
    markAsMissed,
    markAsQada
  };
}
