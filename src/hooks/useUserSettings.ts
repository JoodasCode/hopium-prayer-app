'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Settings hook
export function useUserSettings(userId: string | undefined) {
  const queryClient = useQueryClient();
  
  const fetchUserSettings = async () => {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['user_settings', userId],
    queryFn: fetchUserSettings,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const updateSettings = useMutation({
    mutationFn: async (settings: any) => {
      if (!userId) throw new Error('User ID is required');
      
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings', userId] });
    }
  });
  
  return {
    settings: data,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}
