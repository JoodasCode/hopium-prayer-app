'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      // Wait for auth to initialize
      if (authLoading) {
        return;
      }

      console.log('Checking user status on home page:', { user: user?.id, authLoading });

      // No user - redirect to login
      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      // User exists - check onboarding status
      try {
        console.log('User found, checking onboarding status');
        
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: userData, error } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          // If we can't check, assume they need onboarding
          console.log('Cannot check onboarding status, sending to onboarding');
          router.push('/onboarding');
          return;
        }

        console.log('Onboarding status retrieved:', userData?.onboarding_completed);
        setOnboardingStatus(userData?.onboarding_completed || false);

        // Route based on onboarding status
        if (userData?.onboarding_completed === true) {
          console.log('User completed onboarding, going to dashboard');
          router.push('/dashboard');
        } else {
          console.log('User needs onboarding, going to onboarding');
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Error in user status check:', error);
        // Default to onboarding if there's any error
        router.push('/onboarding');
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [user, authLoading, router]);

  // Show loading while checking
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">
          {authLoading ? 'Checking authentication...' : 'Checking user status...'}
        </p>
      </div>
    );
  }

  // This should rarely be seen since we redirect above
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-muted-foreground">Redirecting...</p>
    </div>
  );
}
