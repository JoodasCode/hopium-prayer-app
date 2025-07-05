import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface QadaPrayer {
  id: string;
  user_id: string;
  original_prayer_id?: string;
  prayer_type: string;
  missed_date: string;
  completed: boolean;
  completed_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface QadaStats {
  totalMissed: number;
  totalCompleted: number;
  remaining: number;
  completionRate: number;
  byPrayerType: Record<string, { missed: number; completed: number; remaining: number }>;
}

interface QadaRecoveryPlan {
  dailyTarget: number;
  estimatedDays: number;
  suggestedSchedule: Array<{
    time: string;
    prayerType: string;
    description: string;
  }>;
}

interface UseQadaRecordsReturn {
  qadaPrayers: QadaPrayer[];
  qadaStats: QadaStats | null;
  recoveryPlan: QadaRecoveryPlan | null;
  isLoading: boolean;
  error: string | null;
  addMissedPrayer: (prayerType: string, missedDate: string, originalPrayerId?: string) => Promise<boolean>;
  completeQadaPrayer: (qadaId: string, notes?: string) => Promise<boolean>;
  deleteQadaPrayer: (qadaId: string) => Promise<boolean>;
  generateRecoveryPlan: (dailyCapacity?: number) => Promise<QadaRecoveryPlan>;
  getQadaHistory: (limit?: number) => Promise<QadaPrayer[]>;
  refreshQadaData: () => Promise<void>;
}

export function useQadaRecords(userId?: string): UseQadaRecordsReturn {
  const [qadaPrayers, setQadaPrayers] = useState<QadaPrayer[]>([]);
  const [qadaStats, setQadaStats] = useState<QadaStats | null>(null);
  const [recoveryPlan, setRecoveryPlan] = useState<QadaRecoveryPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQadaPrayers = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('qada_prayers')
        .select('*')
        .eq('user_id', userId)
        .order('missed_date', { ascending: false });

      if (fetchError) throw fetchError;

      setQadaPrayers(data || []);
      
      // Calculate stats
      if (data) {
        calculateStats(data);
      }
    } catch (err) {
      console.error('Error fetching qada prayers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch qada prayers');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (prayers: QadaPrayer[]) => {
    const totalMissed = prayers.length;
    const totalCompleted = prayers.filter(p => p.completed).length;
    const remaining = totalMissed - totalCompleted;
    const completionRate = totalMissed > 0 ? (totalCompleted / totalMissed) * 100 : 0;

    // Group by prayer type
    const byPrayerType: Record<string, { missed: number; completed: number; remaining: number }> = {};
    
    prayers.forEach(prayer => {
      const type = prayer.prayer_type;
      if (!byPrayerType[type]) {
        byPrayerType[type] = { missed: 0, completed: 0, remaining: 0 };
      }
      
      byPrayerType[type].missed++;
      if (prayer.completed) {
        byPrayerType[type].completed++;
      } else {
        byPrayerType[type].remaining++;
      }
    });

    setQadaStats({
      totalMissed,
      totalCompleted,
      remaining,
      completionRate,
      byPrayerType
    });
  };

  const addMissedPrayer = async (
    prayerType: string, 
    missedDate: string, 
    originalPrayerId?: string
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('qada_prayers')
        .insert({
          user_id: userId,
          original_prayer_id: originalPrayerId,
          prayer_type: prayerType,
          missed_date: missedDate,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Refresh data
      await fetchQadaPrayers();
      
      return true;
    } catch (err) {
      console.error('Error adding missed prayer:', err);
      setError(err instanceof Error ? err.message : 'Failed to add missed prayer');
      return false;
    }
  };

  const completeQadaPrayer = async (qadaId: string, notes?: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('qada_prayers')
        .update({
          completed: true,
          completed_date: new Date().toISOString(),
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', qadaId);

      if (updateError) throw updateError;

      // Update local state
      setQadaPrayers(prev => prev.map(prayer => 
        prayer.id === qadaId 
          ? { 
              ...prayer, 
              completed: true, 
              completed_date: new Date().toISOString(),
              notes: notes || prayer.notes
            }
          : prayer
      ));

      // Recalculate stats
      const updatedPrayers = qadaPrayers.map(prayer => 
        prayer.id === qadaId 
          ? { ...prayer, completed: true }
          : prayer
      );
      calculateStats(updatedPrayers);
      
      return true;
    } catch (err) {
      console.error('Error completing qada prayer:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete qada prayer');
      return false;
    }
  };

  const deleteQadaPrayer = async (qadaId: string): Promise<boolean> => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('qada_prayers')
        .delete()
        .eq('id', qadaId);

      if (deleteError) throw deleteError;

      // Update local state
      const updatedPrayers = qadaPrayers.filter(prayer => prayer.id !== qadaId);
      setQadaPrayers(updatedPrayers);
      calculateStats(updatedPrayers);
      
      return true;
    } catch (err) {
      console.error('Error deleting qada prayer:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete qada prayer');
      return false;
    }
  };

  const generateRecoveryPlan = async (dailyCapacity: number = 2): Promise<QadaRecoveryPlan> => {
    if (!qadaStats) {
      return {
        dailyTarget: 0,
        estimatedDays: 0,
        suggestedSchedule: []
      };
    }

    const remaining = qadaStats.remaining;
    const dailyTarget = Math.min(dailyCapacity, remaining);
    const estimatedDays = Math.ceil(remaining / dailyTarget);

    // Generate suggested schedule based on prayer types needed
    const suggestedSchedule = [];
    const prayerTimes = [
      { time: '05:30', name: 'Fajr', description: 'Dawn prayer' },
      { time: '07:00', name: 'Qada', description: 'Make up missed prayer' },
      { time: '13:00', name: 'Dhuhr', description: 'Noon prayer' },
      { time: '14:30', name: 'Qada', description: 'Make up missed prayer' },
      { time: '16:30', name: 'Asr', description: 'Afternoon prayer' },
      { time: '18:00', name: 'Qada', description: 'Make up missed prayer' },
      { time: '19:30', name: 'Maghrib', description: 'Sunset prayer' },
      { time: '21:00', name: 'Isha', description: 'Night prayer' },
      { time: '22:00', name: 'Qada', description: 'Make up missed prayer' }
    ];

    // Prioritize prayer types with most remaining
    const sortedPrayerTypes = Object.entries(qadaStats.byPrayerType)
      .filter(([_, stats]) => stats.remaining > 0)
      .sort(([_, a], [__, b]) => b.remaining - a.remaining)
      .map(([type, _]) => type);

    let scheduleIndex = 0;
    for (let i = 0; i < dailyTarget && scheduleIndex < prayerTimes.length; i++) {
      const prayerType = sortedPrayerTypes[i % sortedPrayerTypes.length];
      const timeSlot = prayerTimes.find(slot => slot.name === 'Qada');
      
      if (timeSlot) {
        suggestedSchedule.push({
          time: timeSlot.time,
          prayerType: prayerType,
          description: `Make up ${prayerType} prayer`
        });
      }
      scheduleIndex++;
    }

    const plan = {
      dailyTarget,
      estimatedDays,
      suggestedSchedule
    };

    setRecoveryPlan(plan);
    return plan;
  };

  const getQadaHistory = async (limit: number = 50): Promise<QadaPrayer[]> => {
    if (!userId) return [];

    try {
      setError(null);
      
      const { data, error: historyError } = await supabase
        .from('qada_prayers')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('completed_date', { ascending: false })
        .limit(limit);

      if (historyError) throw historyError;

      return data || [];
    } catch (err) {
      console.error('Error fetching qada history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch qada history');
      return [];
    }
  };

  const refreshQadaData = async () => {
    setIsLoading(true);
    await fetchQadaPrayers();
    if (qadaStats && qadaStats.remaining > 0) {
      await generateRecoveryPlan();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchQadaPrayers();
      setIsLoading(false);
    };
    
    fetchData();
  }, [userId]);

  // Generate recovery plan when stats are available
  useEffect(() => {
    if (qadaStats && qadaStats.remaining > 0 && !recoveryPlan) {
      generateRecoveryPlan();
    }
  }, [qadaStats]);

  return {
    qadaPrayers,
    qadaStats,
    recoveryPlan,
    isLoading,
    error,
    addMissedPrayer,
    completeQadaPrayer,
    deleteQadaPrayer,
    generateRecoveryPlan,
    getQadaHistory,
    refreshQadaData
  };
} 