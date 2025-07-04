import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PrayerReminder {
  id: string;
  user_id: string;
  prayer_name: string;
  reminder_time: string;
  is_active: boolean;
  created_at: string;
}

interface UseNotificationsReturn {
  reminders: PrayerReminder[];
  isLoading: boolean;
  error: string | null;
  setReminder: (prayerName: string, reminderMinutes: number) => Promise<boolean>;
  removeReminder: (reminderId: string) => Promise<boolean>;
  refreshReminders: () => Promise<void>;
}

export function useNotifications(userId?: string): UseNotificationsReturn {
  const [reminders, setReminders] = useState<PrayerReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('prayer_reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setReminders(data || []);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const setReminder = async (prayerName: string, reminderMinutes: number): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Calculate reminder time (prayer time - reminder minutes)
      const now = new Date();
      const reminderTime = new Date(now.getTime() + reminderMinutes * 60000);

      const { error: insertError } = await supabase
        .from('prayer_reminders')
        .insert({
          user_id: userId,
          prayer_name: prayerName,
          reminder_time: reminderTime.toISOString(),
          is_active: true
        });

      if (insertError) throw insertError;

      // Refresh reminders list
      await fetchReminders();
      
      return true;
    } catch (err) {
      console.error('Error setting reminder:', err);
      setError(err instanceof Error ? err.message : 'Failed to set reminder');
      return false;
    }
  };

  const removeReminder = async (reminderId: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('prayer_reminders')
        .update({ is_active: false })
        .eq('id', reminderId);

      if (updateError) throw updateError;

      // Refresh reminders list
      await fetchReminders();
      
      return true;
    } catch (err) {
      console.error('Error removing reminder:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove reminder');
      return false;
    }
  };

  const refreshReminders = async () => {
    setIsLoading(true);
    await fetchReminders();
  };

  useEffect(() => {
    fetchReminders();
  }, [userId]);

  return {
    reminders,
    isLoading,
    error,
    setReminder,
    removeReminder,
    refreshReminders
  };
} 