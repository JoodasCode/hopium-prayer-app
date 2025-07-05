'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

// Simplified user state interface - removed data threshold logic
export interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  preferences: {
    theme: string;
    calculationMethod: string;
    notifications: boolean;
    hijriOffset: number;
  };
}

// Define the context interface
interface UserStateContextType {
  userState: UserState;
  updateUserState: (updates: Partial<UserState>) => void;
  refreshUserState: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context with default values
const UserStateContext = createContext<UserStateContextType>({
  userState: {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isOnboardingCompleted: false,
    preferences: {
      theme: 'light',
      calculationMethod: 'mwl',
      notifications: true,
      hijriOffset: 0,
    },
  },
  updateUserState: () => {},
  refreshUserState: async () => {},
  signOut: async () => {},
});

// Provider component
export function UserStateProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [userState, setUserState] = useState<UserState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isOnboardingCompleted: false,
    preferences: {
      theme: 'light',
      calculationMethod: 'mwl',
      notifications: true,
      hijriOffset: 0,
    },
  });

  // Update user state
  const updateUserState = (updates: Partial<UserState>) => {
    setUserState((prev) => ({ ...prev, ...updates }));
  };



  // Simplified refresh user state from Supabase
  const refreshUserState = async () => {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        updateUserState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      const user = session.user;
      
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Profile fetch error: ${profileError.message}`);
      }

      const isOnboardingCompleted = profile?.onboarding_completed || false;
      
      // Update user state (simplified - no prayer data counting)
      updateUserState({
        user,
        isLoading: false,
        isAuthenticated: true,
        isOnboardingCompleted,
        preferences: {
          theme: 'light',
          calculationMethod: 'mwl',
          notifications: true,
          hijriOffset: 0,
        },
      });
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('UserState refresh error:', error);
      }
      
      updateUserState({
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    updateUserState({
      user: null,
      isAuthenticated: false,
      isOnboardingCompleted: false,
    });
  };

  // Initial load
  useEffect(() => {
    refreshUserState();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          refreshUserState();
        } else {
          updateUserState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isOnboardingCompleted: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserStateContext.Provider
      value={{
        userState,
        updateUserState,
        refreshUserState,
        signOut,
      }}
    >
      {children}
    </UserStateContext.Provider>
  );
}

// Custom hook to use the user state context
export const useUserState = () => useContext(UserStateContext);
