'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// User stats hook
export function useUserStats(userId: string | undefined) {
  const fetchUserStats = async () => {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['user_stats', userId],
    queryFn: fetchUserStats,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    userStats: data,
    isLoading,
    error,
  };
}
