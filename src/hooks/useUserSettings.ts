'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserSettings {
  // JSONB fields (matching actual database schema)
  appearance?: {
    theme?: string;
    fontSize?: string;
  };
  notifications?: {
    enabled?: boolean;
    types?: string[];
  };
  privacy?: {
    shareActivity?: boolean;
    dataCollection?: boolean;
  };
  prayer_preferences?: any; // JSONB field
  qibla_preferences?: {
    defaultMode?: string;
  };
  calendar_preferences?: {
    defaultView?: string;
  };
  insights_preferences?: {
    defaultTab?: string;
  };
  
  // Individual columns (matching actual database schema)
  period_exemption?: boolean;
  menstruation_tracking?: boolean;
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
  text_size?: string; // 'small' | 'medium' | 'large'
  animations?: boolean;
  calculation_method?: string;
  madhab?: string;
  fajr_angle?: number;
  isha_angle?: number;
  prayer_reminders?: boolean;
  reminder_time?: number;
  sound_enabled?: boolean;
  vibration_enabled?: boolean;
  streak_protection?: boolean;
  qada_tracking?: boolean;
  daily_goals?: boolean;
  community_presence?: boolean;
  data_collection?: boolean;
  share_insights?: boolean;
  reduce_animations?: boolean;
  travel_exemption?: boolean;
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
          // Create default settings that match the actual database schema
          const defaultSettings: UserSettings = {
            appearance: {
              theme: "system",
              fontSize: "medium",
            },
            notifications: {
              enabled: true,
              types: ["prayer_times", "streaks"],
            },
            privacy: {
              shareActivity: false,
              dataCollection: true,
            },
            prayer_preferences: {
              calculation_method: 'ISNA',
              madhab: 'hanafi',
              location_based_reminders: true,
              period_exemption: false,
              travel_exemption: false,
              menstruation_tracking: false,
              illness_exemption: false
            },
            qibla_preferences: {
              defaultMode: "standard"
            },
            calendar_preferences: {
              defaultView: "month"
            },
            insights_preferences: {
              defaultTab: "overview"
            },
            period_exemption: false,
            menstruation_tracking: false,
            habit_tracking: false,
            gesture_controls: false,
            ambient_sounds: false,
            smart_reminders: false,
            location_based_reminders: true,
            community_features: false,
            prayer_time_notifications: true,
            streak_notifications: true,
            community_updates: false,
            achievement_notifications: true,
            text_size: "medium",
            animations: true,
            calculation_method: 'ISNA',
            madhab: 'hanafi',
            prayer_reminders: true,
            reminder_time: 15,
            sound_enabled: true,
            vibration_enabled: true,
            streak_protection: false,
            qada_tracking: false,
            daily_goals: false,
            community_presence: false,
            data_collection: true,
            share_insights: false,
            reduce_animations: false,
            travel_exemption: false
          };

          try {
            const { error: insertError } = await supabase
              .from('settings')
              .insert({ 
                user_id: userId, 
                ...defaultSettings,
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Error creating default settings:', insertError);
              // Don't set error here, just log it and continue with defaults
            }
          } catch (insertErr) {
            console.error('Insert error:', insertErr);
            // Don't set error here, just log it and continue with defaults
          }
          
          // Always set default settings for UX, even if database insert fails
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
        setError('Failed to load settings');
        
        // Provide fallback settings to prevent broken UI
        setSettings({
          appearance: { theme: "system", fontSize: "medium" },
          notifications: { enabled: true, types: ["prayer_times"] },
          privacy: { shareActivity: false, dataCollection: true },
          prayer_preferences: { 
            calculation_method: 'ISNA', 
            madhab: 'hanafi',
            period_exemption: false,
            travel_exemption: false
          },
          qibla_preferences: { defaultMode: "standard" },
          calendar_preferences: { defaultView: "month" },
          insights_preferences: { defaultTab: "overview" },
          period_exemption: false,
          menstruation_tracking: false,
          habit_tracking: false,
          gesture_controls: false,
          ambient_sounds: false,
          smart_reminders: false,
          location_based_reminders: true,
          community_features: false,
          prayer_time_notifications: true,
          streak_notifications: true,
          community_updates: false,
          achievement_notifications: true,
          text_size: "medium",
          animations: true,
          calculation_method: 'ISNA',
          madhab: 'hanafi',
          prayer_reminders: true,
          reminder_time: 15,
          sound_enabled: true,
          vibration_enabled: true,
          streak_protection: false,
          qada_tracking: false,
          daily_goals: false,
          community_presence: false,
          data_collection: true,
          share_insights: false,
          reduce_animations: false,
          travel_exemption: false
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
