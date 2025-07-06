import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_data?: any;
}

interface PrayerReminder {
  id: string;
  user_id: string;
  prayer_name: string;
  reminder_time: string;
  is_active: boolean;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  reminders: PrayerReminder[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  setReminder: (prayerName: string, reminderMinutes: number) => Promise<boolean>;
  removeReminder: (reminderId: string) => Promise<boolean>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  refreshReminders: () => Promise<void>;
}

export function useNotifications(userId?: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<PrayerReminder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const notificationData = data || [];
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    }
  };

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

      // Set up browser notification if permission is granted
      if ('Notification' in window && Notification.permission === 'granted') {
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        if (timeUntilReminder > 0) {
          setTimeout(() => {
            const notification = new Notification(`${prayerName} Prayer Reminder`, {
              body: `It's time for ${prayerName} prayer`,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: `prayer-${prayerName}-${Date.now()}`,
              requireInteraction: true,
              silent: false
            });

            // Handle notification click
            notification.onclick = () => {
              window.focus();
              notification.close();
            };

            // Auto-close after 30 seconds
            setTimeout(() => {
              notification.close();
            }, 30000);

            // Vibrate on mobile devices
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
          }, timeUntilReminder);
        }
      }

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

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      return false;
    }
  };

  const markAllAsRead = async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (updateError) throw updateError;

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
      return false;
    }
  };

  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) throw deleteError;

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
      return false;
    }
  };

  const refreshNotifications = async () => {
    setIsLoading(true);
    await fetchNotifications();
    setIsLoading(false);
  };

  const refreshReminders = async () => {
    setIsLoading(true);
    await fetchReminders();
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchNotifications(), fetchReminders()]);
      setIsLoading(false);
    };
    
    fetchData();
  }, [userId]);

  return {
    notifications,
    reminders,
    unreadCount,
    isLoading,
    error,
    setReminder,
    removeReminder,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    refreshReminders
  };
} 