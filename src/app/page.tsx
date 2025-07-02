'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    const checkAuthAndRoute = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not authenticated, go to login
          router.push('/login');
          return;
        }
        
        // User is authenticated, check if onboarding is completed
        const { data: userRecord } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
        
        if (userRecord?.onboarding_completed) {
          // Onboarding completed, go to dashboard
          router.push('/dashboard');
        } else {
          // Onboarding not completed, go to onboarding
          router.push('/onboarding');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On error, go to login
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndRoute();
  }, [router, supabase]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return null;
}
