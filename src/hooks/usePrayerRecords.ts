'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Prayer records hook
export function usePrayerRecords(userId: string | undefined, date: string) {
  const queryClient = useQueryClient();
  
  const fetchPrayerRecords = async () => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('prayer_records')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_time', `${date}T00:00:00`)
      .lte('scheduled_time', `${date}T23:59:59`)
      .order('scheduled_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['prayer_records', userId, date],
    queryFn: fetchPrayerRecords,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const markPrayerCompleted = useMutation({
    mutationFn: async ({ prayerId, completedTime, emotionalState, notes }: {
      prayerId: string;
      completedTime: string;
      emotionalState?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('prayer_records')
        .update({
          completed: true,
          completed_time: completedTime,
          emotional_state_after: emotionalState,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', prayerId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch prayer records
      queryClient.invalidateQueries({ queryKey: ['prayer_records', userId, date] });
      // Also invalidate user stats as they will be updated by the trigger
      queryClient.invalidateQueries({ queryKey: ['user_stats', userId] });
    }
  });
  
  return {
    prayerRecords: data || [],
    isLoading,
    error,
    markPrayerCompleted: markPrayerCompleted.mutate,
    isMarkingCompleted: markPrayerCompleted.isPending,
  };
}
