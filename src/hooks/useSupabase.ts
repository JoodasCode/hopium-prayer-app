import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

// Auth hooks
export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    signUp: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      
      // Initialize user profile
      if (data?.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          onboarding_completed: false
        });
      }
      
      return data;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };
};

// Prayer records hooks
export const usePrayerRecords = (userId: string | undefined, date: string) => {
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
};

// User stats hooks
export const useUserStats = (userId: string | undefined) => {
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
};

// Settings hooks
export const useUserSettings = (userId: string | undefined) => {
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
};
