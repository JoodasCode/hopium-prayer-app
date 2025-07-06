'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const { onboardingCompleted, checkOnboardingStatus } = useOnboarding();
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize onboarding status
  useEffect(() => {
    const initializeOnboarding = async () => {
      console.log('Initializing onboarding page:', { user: user?.id, authLoading });

      // Wait for auth to be ready
      if (authLoading) {
        return;
      }

      // No user - redirect to login
      if (!user) {
        console.log('No user on onboarding page, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        console.log('Checking onboarding status for user:', user.id);
        await checkOnboardingStatus();
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setError('Failed to check onboarding status');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeOnboarding();
  }, [user, authLoading, checkOnboardingStatus, router]);

  // Redirect if onboarding is already completed
  useEffect(() => {
    if (onboardingCompleted === true) {
      console.log('Onboarding already completed, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [onboardingCompleted, router]);

  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    console.log('Onboarding completed, redirecting to dashboard');
    router.push('/dashboard');
  };

  // Show loading while initializing
  if (authLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">
          {authLoading ? 'Checking authentication...' : 'Initializing onboarding...'}
        </p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive font-medium">Onboarding Error</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render onboarding
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  // If onboarding is completed, show redirecting message
  if (onboardingCompleted === true) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  // Render onboarding for users who haven't completed it
  console.log('Rendering onboarding container for user:', user.id);
  return (
    <OnboardingContainer 
      onComplete={handleOnboardingComplete}
    />
  );
} 