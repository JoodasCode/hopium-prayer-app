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

  // Create a new prayer record for a specific prayer time
  const createPrayerRecord = useMutation({
    mutationFn: async ({ 
      prayerType, 
      scheduledTime 
    }: {
      prayerType: string;
      scheduledTime: string;
    }) => {
      if (!userId) throw new Error('User ID is required');
      
      const { data, error } = await supabase
        .from('prayer_records')
        .insert({
          user_id: userId,
          prayer_type: prayerType,
          scheduled_time: scheduledTime,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer_records', userId, date] });
    }
  });
  
  const markPrayerCompleted = useMutation({
    mutationFn: async ({ 
      prayerId, 
      completedTime, 
      emotionalState, 
      mindfulnessScore,
      location,
      notes 
    }: {
      prayerId: string;
      completedTime: string;
      emotionalState?: string;
      mindfulnessScore?: number;
      location?: string;
      notes?: string;
    }) => {
      const updateData: any = {
        completed: true,
        completed_time: completedTime,
        updated_at: new Date().toISOString()
      };

      if (emotionalState) updateData.emotional_state_after = emotionalState;
      if (mindfulnessScore !== undefined) updateData.mindfulness_score = mindfulnessScore;
      if (location) updateData.location = { type: location };
      if (notes) updateData.notes = notes;

      const { data, error } = await supabase
        .from('prayer_records')
        .update(updateData)
        .eq('id', prayerId)
        .select()
        .single();
      
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

  // Complete a prayer with full reflection data
  const completePrayerWithReflection = useMutation({
    mutationFn: async ({
      prayerType,
      scheduledTime,
      completedTime,
      emotion,
      location,
      quality,
      reflection
    }: {
      prayerType: string;
      scheduledTime: string;
      completedTime: string;
      emotion: string;
      location: string;
      quality: number;
      reflection?: string;
    }) => {
      if (!userId) throw new Error('User ID is required');

      // First, check if a record already exists for this prayer time
      const { data: existingRecord } = await supabase
        .from('prayer_records')
        .select('id')
        .eq('user_id', userId)
        .eq('prayer_type', prayerType)
        .eq('scheduled_time', scheduledTime)
        .single();

      let recordId: string;

      if (existingRecord) {
        // Update existing record
        recordId = existingRecord.id;
        const { error } = await supabase
          .from('prayer_records')
          .update({
            completed: true,
            completed_time: completedTime,
            emotional_state_after: emotion,
            mindfulness_score: quality,
            location: { type: location },
            notes: reflection || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', recordId);

        if (error) throw error;
      } else {
        // Create new record
        const { data: newRecord, error } = await supabase
          .from('prayer_records')
          .insert({
            user_id: userId,
            prayer_type: prayerType,
            scheduled_time: scheduledTime,
            completed: true,
            completed_time: completedTime,
            emotional_state_after: emotion,
            mindfulness_score: quality,
            location: { type: location },
            notes: reflection || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (error) throw error;
        recordId = newRecord.id;
      }

      return { id: recordId };
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
    createPrayerRecord: createPrayerRecord.mutate,
    isCreatingRecord: createPrayerRecord.isPending,
    markPrayerCompleted: markPrayerCompleted.mutate,
    isMarkingCompleted: markPrayerCompleted.isPending,
    completePrayerWithReflection: completePrayerWithReflection.mutate,
    isCompletingPrayer: completePrayerWithReflection.isPending,
  };
}
