'use client';

import { useState } from 'react';
import { useSupabaseClient } from './useSupabaseClient';
import { useUserState } from '@/contexts/UserStateContext';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const supabase = useSupabaseClient();
  const { refreshUserState } = useUserState();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign up a new user
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      // Initialize user profile after signup
      if (data?.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: false,
          theme: 'light',
          calculation_method: 'mwl',
          notifications_enabled: true,
          hijri_offset: 0,
        });
        
        // Log analytics event
        await supabase.from('app_analytics').insert({
          user_id: data.user.id,
          event: 'user_signup',
          timestamp: new Date().toISOString(),
        });
        
        // Refresh user state
        await refreshUserState();
        
        // Redirect to onboarding
        router.push('/onboarding');
      }
      
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in an existing user
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Log analytics event
      if (data?.user) {
        await supabase.from('app_analytics').insert({
          user_id: data.user.id,
          event: 'user_signin',
          timestamp: new Date().toISOString(),
        });
        
        // Refresh user state
        await refreshUserState();
        
        // Redirect based on onboarding status
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();
        
        if (userData?.onboarding_completed) {
          router.push('/');
        } else {
          router.push('/onboarding');
        }
      }
      
      return data;
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out the current user
  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Refresh user state
      await refreshUserState();
      
      // Redirect to login
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign out');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during password reset');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) throw error || new Error('User not found');
      
      // Update user metadata
      if (updates.name) {
        await supabase.auth.updateUser({
          data: { name: updates.name },
        });
      }
      
      // Update user preferences in the users table
      const userUpdates: any = {};
      
      if (updates.theme) userUpdates.theme = updates.theme;
      if (updates.calculation_method) userUpdates.calculation_method = updates.calculation_method;
      if (updates.notifications_enabled !== undefined) userUpdates.notifications_enabled = updates.notifications_enabled;
      if (updates.hijri_offset !== undefined) userUpdates.hijri_offset = updates.hijri_offset;
      if (updates.onboarding_completed !== undefined) userUpdates.onboarding_completed = updates.onboarding_completed;
      
      if (Object.keys(userUpdates).length > 0) {
        userUpdates.updated_at = new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', user.id);
        
        if (updateError) throw updateError;
      }
      
      // Refresh user state
      await refreshUserState();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred updating profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isLoading,
    error,
  };
}
