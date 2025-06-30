'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserState } from '@/contexts/UserStateContext';

export default function Home() {
  const router = useRouter();
  const { userState } = useUserState();
  
  useEffect(() => {
    // Wait for user state to load
    if (userState.isLoading) return;
    
    // If user is authenticated, redirect to dashboard
    if (userState.isAuthenticated) {
      // If onboarding is not completed, redirect to onboarding
      if (!userState.isOnboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } else {
      // If not authenticated, redirect to login
      router.push('/login');
    }
  }, [userState.isLoading, userState.isAuthenticated, userState.isOnboardingCompleted, router]);
  
  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your experience...</p>
      </div>
    </div>
  );
}
