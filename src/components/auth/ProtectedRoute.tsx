'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserState } from '@/contexts/UserStateContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

/**
 * ProtectedRoute component to handle authentication and onboarding redirects
 * 
 * @param children - The content to render if conditions are met
 * @param requireAuth - If true, redirects to login if user is not authenticated
 * @param requireOnboarding - If true, redirects to onboarding if user hasn't completed it
 */
export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireOnboarding = false 
}: ProtectedRouteProps) {
  const { userState } = useUserState();
  const router = useRouter();
  
  useEffect(() => {
    // Wait until auth state is loaded
    if (userState.isLoading) return;
    
    // Handle authentication requirement
    if (requireAuth && !userState.isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Handle onboarding requirement
    if (requireOnboarding && !userState.isOnboardingCompleted && userState.isAuthenticated) {
      router.push('/onboarding');
      return;
    }
    
    // Redirect completed onboarding users away from onboarding page
    const isOnboardingPage = window.location.pathname.includes('/onboarding');
    if (isOnboardingPage && userState.isOnboardingCompleted && userState.isAuthenticated) {
      router.push('/');
      return;
    }
  }, [userState.isLoading, userState.isAuthenticated, userState.isOnboardingCompleted, requireAuth, requireOnboarding, router]);
  
  // Show nothing while loading or redirecting
  if (userState.isLoading) {
    return null;
  }
  
  // Show nothing if authentication is required but user is not authenticated
  if (requireAuth && !userState.isAuthenticated) {
    return null;
  }
  
  // Show nothing if onboarding is required but user hasn't completed it
  if (requireOnboarding && !userState.isOnboardingCompleted && userState.isAuthenticated) {
    return null;
  }
  
  return <>{children}</>;
}
