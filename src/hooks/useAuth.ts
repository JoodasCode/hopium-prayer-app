'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from './useSupabaseClient';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
        setAuthLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        setIsLoading(false);
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
      console.log('Starting sign up for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: undefined, // Disable email confirmation for development
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      console.log('Sign up successful:', data);
      
      // Initialize user profile after signup
      if (data?.user) {
        console.log('Creating user profile for:', data.user.id);
        
        // Use the correct column names for the users table
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email || '',
          display_name: name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          onboarding_completed: false, // CRITICAL: New users need onboarding
          theme_preference: 'system',
          prayer_method: 'ISNA', // Use the default from schema
          notification_settings: { prayer_reminders: true, community_updates: false },
          location: { latitude: null, longitude: null, city: null, country: null },
          avatar_url: null,
          last_active: new Date().toISOString(),
        });
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw here, user is created but profile failed
          // Try to continue anyway
        } else {
          console.log('User profile created successfully');
        }

        // Create gamification profile
        console.log('Creating gamification profile for:', data.user.id);
        const { error: gamificationError } = await supabase.from('user_gamification').insert({
          user_id: data.user.id,
          level: 1,
          current_xp: 0,
          xp_to_next: 100,
          total_xp: 0,
          rank: 'Seeker',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (gamificationError) {
          console.error('Gamification profile creation error:', gamificationError);
          // Don't throw here, continue with onboarding
        } else {
          console.log('Gamification profile created successfully');
        }
        
        console.log('Redirecting new user to onboarding');
        // NEW users always go to onboarding
        router.push('/onboarding');
      }
      
      return data;
    } catch (err: any) {
      console.error('Sign up failed:', err);
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
      console.log('Starting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        // Handle email not confirmed error
        if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see it.');
        } else {
          throw error;
        }
        return null;
      }
      
      console.log('Sign in successful:', data);
      
      if (data?.user) {
        console.log('Checking onboarding status for user:', data.user.id);
        
        // Check if user has completed onboarding
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();
        
        if (userError) {
          console.error('Error checking onboarding status:', userError);
          console.log('User not found in users table, sending to onboarding');
          // If we can't check, assume they need onboarding
          router.push('/onboarding');
          return data;
        }
        
        console.log('User onboarding status:', userData?.onboarding_completed);

        // Check if user has gamification profile, create if missing
        const { data: gamificationData, error: gamificationCheckError } = await supabase
          .from('user_gamification')
          .select('user_id')
          .eq('user_id', data.user.id)
          .single();

        if (gamificationCheckError && gamificationCheckError.code === 'PGRST116') {
          // Gamification profile doesn't exist, create it
          console.log('Creating missing gamification profile for existing user:', data.user.id);
          const { error: gamificationError } = await supabase.from('user_gamification').insert({
            user_id: data.user.id,
            level: 1,
            current_xp: 0,
            xp_to_next: 100,
            total_xp: 0,
            rank: 'Seeker',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          if (gamificationError) {
            console.error('Error creating gamification profile for existing user:', gamificationError);
          } else {
            console.log('Gamification profile created for existing user');
          }
        }
        
        // Route based on onboarding status
        if (userData?.onboarding_completed === true) {
          console.log('User completed onboarding, going to dashboard');
          router.push('/dashboard');
        } else {
          console.log('User needs onboarding, going to onboarding');
          router.push('/onboarding');
        }
      }
      
      return data;
    } catch (err: any) {
      console.error('Sign in failed:', err);
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
      console.log('Signing out user');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mulvi_onboarding_progress');
        localStorage.removeItem('mulvi_onboarding_data');
      }
      
      console.log('Sign out successful, redirecting to login');
      // Redirect to login
      router.push('/login');
    } catch (err: any) {
      console.error('Sign out failed:', err);
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
    user,
    isLoading,
    authLoading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };
}
