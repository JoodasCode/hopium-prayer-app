'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserSettings {
  // Individual settings fields (newly added to database)
  period_exemption?: boolean;
  menstruation_tracking?: boolean;
  travel_exemption?: boolean;
  illness_exemption?: boolean;
  habit_tracking?: boolean;
  gesture_controls?: boolean;
  ambient_sounds?: boolean;
  smart_reminders?: boolean;
  location_based_reminders?: boolean;
  community_features?: boolean;
  prayer_time_notifications?: boolean;
  streak_notifications?: boolean;
  community_updates?: boolean;
  achievement_notifications?: boolean;
  text_size?: number;
  animations?: boolean;
  calculation_method?: string;
  madhab?: string;
  fajr_angle?: number;
  isha_angle?: number;
  
  // Notification related settings
  prayer_reminders?: boolean;
  reminder_time?: number;
  sound_enabled?: boolean;
  vibration_enabled?: boolean;
  
  // Habit tracking settings
  streak_protection?: boolean;
  qada_tracking?: boolean;
  daily_goals?: boolean;
  community_presence?: boolean;
  
  // Privacy settings
  data_collection?: boolean;
  share_insights?: boolean;
  
  // App settings
  reduce_animations?: boolean;
  
  // JSONB fields (existing structure)
  appearance?: {
    theme?: string;
    fontSize?: string;
  };
  notifications?: {
    types?: string[];
    enabled?: boolean;
  };
  privacy?: {
    shareActivity?: boolean;
    dataCollection?: boolean;
  };
  prayer_preferences?: {
    [key: string]: any;
  };
  qibla_preferences?: {
    defaultMode?: string;
  };
  calendar_preferences?: {
    defaultView?: string;
  };
  insights_preferences?: {
    defaultTab?: string;
  };
}

export const useUserSettings = (userId: string | undefined) => {
  const [settings, setSettings] = useState<UserSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchSettings = async () => {
      try {
        setError(null);
        
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching settings:', error);
          setError('Failed to load settings');
          // Still continue to set default settings for better UX
        }

        if (data) {
          setSettings(data);
        } else {
          // Create default settings if none exist
          const defaultSettings: UserSettings = {
            period_exemption: false,
            travel_exemption: false,
            prayer_reminders: true,
            reminder_time: 15,
            sound_enabled: true,
            vibration_enabled: true,
            streak_protection: true,
            text_size: 1.0,
            reduce_animations: false,
            calculation_method: 'ISNA',
            madhab: 'hanafi',
            appearance: { theme: 'system', fontSize: 'medium' },
            notifications: { types: ['prayer_times', 'streaks'], enabled: true },
            privacy: { shareActivity: false, dataCollection: true }
          };

          try {
            const { error: insertError } = await supabase
              .from('settings')
              .insert({ user_id: userId, ...defaultSettings });

            if (insertError) {
              console.error('Error creating default settings:', insertError);
              setError('Failed to create settings');
            }
          } catch (insertErr) {
            console.error('Insert error:', insertErr);
            setError('Failed to initialize settings');
          }
          
          // Always set default settings for UX, even if database insert fails
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
        setError('Failed to load settings');
        
        // Provide fallback settings to prevent broken UI
        setSettings({
          period_exemption: false,
          travel_exemption: false,
          prayer_reminders: true,
          reminder_time: 15,
          sound_enabled: true,
          vibration_enabled: true,
          streak_protection: true,
          text_size: 1.0,
          reduce_animations: false,
          calculation_method: 'ISNA',
          madhab: 'hanafi',
          notifications: { enabled: true }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating settings:', error);
        return false;
      }

      setSettings(prev => ({ ...prev, ...updates }));
      setError(null); // Clear any previous errors on successful update
      return true;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      return false;
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings
  };
};
