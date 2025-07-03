'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type PrayerPreference = {
  notifications: boolean;
  reminderMinutesBefore: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  exemptPeriods: {
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
    reason?: string;
  };
};

type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  prayerPreferences: Record<string, PrayerPreference>;
  streakGoal: number;
  qadaReminders: boolean;
  communityFeatures: boolean;
  language: string;
};

type PreferencesResult = {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<void>;
  updatePrayerPreference: (prayerName: string, settings: Partial<PrayerPreference>) => Promise<void>;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  prayerPreferences: {
    Fajr: {
      notifications: true,
      reminderMinutesBefore: 15,
      soundEnabled: true,
      vibrationEnabled: true,
      exemptPeriods: { enabled: false }
    },
    Dhuhr: {
      notifications: true,
      reminderMinutesBefore: 10,
      soundEnabled: true,
      vibrationEnabled: true,
      exemptPeriods: { enabled: false }
    },
    Asr: {
      notifications: true,
      reminderMinutesBefore: 10,
      soundEnabled: true,
      vibrationEnabled: true,
      exemptPeriods: { enabled: false }
    },
    Maghrib: {
      notifications: true,
      reminderMinutesBefore: 5,
      soundEnabled: true,
      vibrationEnabled: true,
      exemptPeriods: { enabled: false }
    },
    Isha: {
      notifications: true,
      reminderMinutesBefore: 10,
      soundEnabled: true,
      vibrationEnabled: true,
      exemptPeriods: { enabled: false }
    }
  },
  streakGoal: 30,
  qadaReminders: true,
  communityFeatures: true,
  language: 'en'
};

export function useUserPreferences(): PreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user preferences
  const fetchPreferences = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use the default preferences
      
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
    } catch (err) {
      setError('Failed to load preferences. Using defaults.');
      setLoading(false);
    }
  };

  // Update all preferences
  const updatePreferences = async (newPreferences: Partial<UserPreferences>): Promise<void> => {
    try {
      setPreferences(prev => ({ ...prev, ...newPreferences }));
      
      // In a real implementation, this would update Supabase
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return Promise.resolve();
    } catch (err) {
      setError('Failed to update preferences.');
      return Promise.reject(error);
    }
  };

  // Update specific prayer preference
  const updatePrayerPreference = async (
    prayerName: string, 
    settings: Partial<PrayerPreference>
  ): Promise<void> => {
    try {
      setPreferences(prev => ({
        ...prev,
        prayerPreferences: {
          ...prev.prayerPreferences,
          [prayerName]: {
            ...prev.prayerPreferences[prayerName],
            ...settings
          }
        }
      }));
      
      // In a real implementation, this would update Supabase
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return Promise.resolve();
    } catch (err) {
      setError(`Failed to update ${prayerName} preferences.`);
      return Promise.reject(error);
    }
  };

  // Initialize on component mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updatePrayerPreference
  };
}
