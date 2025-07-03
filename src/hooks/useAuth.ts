'use client';

import { useState, useEffect } from 'react';
import { useSupabaseClient } from './useSupabaseClient';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add session management
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Initialize and listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
    console.log('🔐 SignIn attempt for:', email);
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('🔐 SignIn response:', { data: !!data, error: error?.message });
      
      if (error) throw error;
      
      if (data?.user) {
        console.log('✅ User signed in successfully:', data.user.email);
        
        // Check onboarding status and redirect directly
        const { data: userRecord } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();
        
        if (userRecord?.onboarding_completed) {
          console.log('🎯 Redirecting to dashboard - onboarding completed');
          window.location.href = '/dashboard';
        } else {
          console.log('🎯 Redirecting to onboarding - not completed');
          window.location.href = '/onboarding';
        }
      }
      
      return data;
    } catch (err: any) {
      console.error('❌ SignIn error:', err);
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
      if (updates.onboarding_completed !== undefined) {
        userUpdates.onboarding_completed = updates.onboarding_completed;
      }
      
      if (Object.keys(userUpdates).length > 0) {
        userUpdates.updated_at = new Date().toISOString();
        userUpdates.id = user.id; // Ensure ID is set for upsert
        
        // Use upsert to insert or update the user record
        const { error: upsertError } = await supabase
          .from('users')
          .upsert(userUpdates, { onConflict: 'id' });
        
        if (upsertError) throw upsertError;
      }
      
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
    // Add session-related properties
    session,
    user: session?.user ?? null,
    authLoading,
  };
}
