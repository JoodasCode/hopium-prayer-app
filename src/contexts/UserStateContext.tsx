'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { User } from '@supabase/supabase-js';

// Define the user state interface
export interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  hasPrayerData: boolean;
  dataThreshold: 'none' | 'minimal' | 'sufficient';
  lastVisited: string | null;
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
    hasPrayerData: false,
    dataThreshold: 'none',
    lastVisited: null,
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
  const [userState, setUserState] = useState<UserState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isOnboardingCompleted: false,
    hasPrayerData: false,
    dataThreshold: 'none',
    lastVisited: null,
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

  // Determine data threshold based on prayer records count
  const determineDataThreshold = (count: number): 'none' | 'minimal' | 'sufficient' => {
    if (count === 0) return 'none';
    if (count < 21) return 'minimal'; // Less than 3 days (7 prayers per day)
    return 'sufficient'; // 7+ days of data
  };

  // Refresh user state from Supabase
  const refreshUserState = async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
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
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Count prayer records
      const { count } = await supabase
        .from('prayer_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get last visited timestamp
      const { data: analytics } = await supabase
        .from('app_analytics')
        .select('timestamp')
        .eq('user_id', user.id)
        .eq('event', 'app_visit')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      // Update last visited in analytics
      await supabase
        .from('app_analytics')
        .insert({
          user_id: user.id,
          event: 'app_visit',
          timestamp: new Date().toISOString(),
        });

      // Update user state
      updateUserState({
        user,
        isLoading: false,
        isAuthenticated: true,
        isOnboardingCompleted: profile?.onboarding_completed || false,
        hasPrayerData: count ? count > 0 : false,
        dataThreshold: determineDataThreshold(count || 0),
        lastVisited: analytics?.timestamp || null,
        preferences: {
          theme: profile?.theme || 'light',
          calculationMethod: profile?.calculation_method || 'mwl',
          notifications: profile?.notifications_enabled || true,
          hijriOffset: profile?.hijri_offset || 0,
        },
      });
    } catch (error) {
      console.error('Error refreshing user state:', error);
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
      hasPrayerData: false,
      dataThreshold: 'none',
      lastVisited: null,
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
            hasPrayerData: false,
            dataThreshold: 'none',
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
