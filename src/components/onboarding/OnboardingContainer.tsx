/**
 * OnboardingContainer
 * 
 * Main container component for the enhanced onboarding flow
 * Manages state, progression through steps, and Supabase integration
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/types/supabase';

// Import types
import { OnboardingState, ThemeOption } from './types';

// Step components
import { WelcomeStep } from './steps/WelcomeStep';
import { MotivationStep } from './steps/MotivationStep';
import { PrayerStoryStep } from './steps/PrayerStoryStep';
import { QiblaStep } from './steps/QiblaStep';
import { PrayerBaselineStep } from './steps/PrayerBaselineStep';
import { RemindersStep } from './steps/RemindersStep';
import { IntentionStep } from './steps/IntentionStep';
import { LopiIntroStep } from './steps/LopiIntroStep';
import { CompletionStep } from './steps/CompletionStep';

export default function OnboardingContainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    motivations: [],
    prayerStory: '',
    theme: 'serene',
    prayerBaseline: {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false
    },
    intentions: [],
    lopiEnabled: true
  });
  
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  
  // Fetch user ID and onboarding state on mount
  useEffect(() => {
    async function getUserData() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        // For demo purposes, allow access even without authentication
        // In production, you would redirect to login
        if (userError || !user) {
          console.log('No authenticated user, using demo mode');
          setUserId('demo-user');
          
          // Initialize demo state
          setOnboardingState({
            motivations: [],
            prayerStory: '',
            theme: 'serene',
            prayerBaseline: {
              fajr: false,
              dhuhr: false,
              asr: false,
              maghrib: false,
              isha: false
            },
            intentions: [],
            lopiEnabled: true
          });
          
          setLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Check if user has already completed onboarding
        const { data: onboarding, error: onboardingError } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (onboardingError && onboardingError.code !== 'PGRST116') {
          console.error('Error fetching onboarding data:', onboardingError);
        }
        
        if (onboarding) {
          // If onboarding is completed, redirect to dashboard
          if (onboarding.completed) {
            router.push('/');
            return;
          }
          
          // Otherwise, resume from last step
          setCurrentStep(onboarding.step || 0);
          setOnboardingState({
            motivations: onboarding.motivations || [],
            prayerStory: onboarding.prayer_story || '',
            theme: (onboarding.theme as ThemeOption) || 'serene',
            prayerBaseline: onboarding.prayer_baseline || {
              fajr: false,
              dhuhr: false,
              asr: false,
              maghrib: false,
              isha: false
            },
            intentions: onboarding.intentions || [],
            lopiEnabled: onboarding.lopi_enabled !== false
          });
        } else {
          // Create initial onboarding record
          const { error: insertError } = await supabase
            .from('user_onboarding')
            .insert({
              user_id: user.id,
              step: 0,
              completed: false,
              created_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error creating onboarding record:', insertError);
          }
        }
      } catch (error) {
        console.error('Unexpected error in getUserData:', error);
      } finally {
        setLoading(false);
      }
    }
    
    getUserData();
  }, [supabase, router]);
  
  // Save progress to Supabase
  const saveProgress = async (updates = {}, nextStep?: number) => {
    if (!userId) return;
    
    try {
      setSaving(true);
      
      // For demo user, just update local state and skip database operations
      if (userId === 'demo-user') {
        console.log('Demo mode: skipping database update');
        return;
      }
      
      // Prepare data for Supabase
      const supabaseData: any = {};
      
      // Map state keys to database column names
      if ('motivations' in updates) supabaseData.motivations = updates.motivations;
      if ('prayerStory' in updates) supabaseData.prayer_story = updates.prayerStory;
      if ('theme' in updates) supabaseData.theme = updates.theme;
      if ('prayerBaseline' in updates) supabaseData.prayer_baseline = updates.prayerBaseline;
      if ('intentions' in updates) supabaseData.intentions = updates.intentions;
      if ('lopiEnabled' in updates) supabaseData.lopi_enabled = updates.lopiEnabled;
      
      // Always update the step if provided
      if (nextStep !== undefined) {
        supabaseData.step = nextStep;
      }
      
      // Update the database
      const { error } = await supabase
        .from('user_onboarding')
        .update(supabaseData)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error saving progress:', error);
        toast({
          title: 'Error saving progress',
          description: 'Please try again',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Unexpected error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle step navigation
  const nextStep = async (updates = {}) => {
    const nextStepNumber = currentStep + 1;
    await saveProgress(updates, nextStepNumber);
    setOnboardingState(prev => ({ ...prev, ...updates }));
    setCurrentStep(nextStepNumber);
  };
  
  const prevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };
  
  // Complete onboarding
  const completeOnboarding = async () => {
    if (!userId) return;
    
    try {
      setSaving(true);
      
      // For demo user, skip database operations
      if (userId === 'demo-user') {
        console.log('Demo mode: completing onboarding without database update');
        // Show success message
        toast({
          title: 'Welcome to Hopium!',
          description: 'Your journey begins now',
          variant: 'default'
        });
        
        // Redirect to dashboard
        router.push('/');
        return;
      }
      
      // Mark onboarding as completed
      const { error } = await supabase
        .from('user_onboarding')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error completing onboarding:', error);
        toast({
          title: 'Error completing onboarding',
          description: 'Please try again',
          variant: 'destructive'
        });
        return;
      }
      
      // Show success message
      toast({
        title: 'Welcome to Hopium!',
        description: 'Your journey begins now',
        variant: 'default'
      });
      
      // Redirect to dashboard
      router.push('/');
    } catch (error) {
      console.error('Unexpected error completing onboarding:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted-foreground">Setting up your journey...</p>
      </div>
    );
  }
  
  // Render current step
  const renderStep = () => {
    switch(currentStep) {
      case 0:
        return <WelcomeStep onNext={() => nextStep()} />;
      case 1:
        return <MotivationStep 
          onNext={(motivations: string[]) => nextStep({ motivations })} 
          onBack={prevStep} 
          selectedMotivations={onboardingState.motivations} 
        />;
      case 2:
        return <PrayerStoryStep 
          onNext={(prayerStory: string) => nextStep({ prayerStory })} 
          onBack={prevStep} 
          selectedStory={onboardingState.prayerStory} 
        />;
      case 3:
        return <QiblaStep 
          onNext={() => nextStep()} 
          onBack={prevStep} 
        />;
      case 4:
        return <PrayerBaselineStep 
          onNext={(prayerBaseline: Record<string, boolean>) => nextStep({ prayerBaseline })} 
          onBack={prevStep} 
          selectedBaseline={onboardingState.prayerBaseline} 
        />;
      case 5:
        return <RemindersStep 
          onNext={() => nextStep()} 
          onBack={prevStep} 
        />;
      case 6:
        return <IntentionStep 
          onNext={(intentions: string[]) => nextStep({ intentions })} 
          onBack={prevStep} 
          selectedIntentions={onboardingState.intentions || []} 
        />;
      case 7:
        return <LopiIntroStep 
          onNext={(lopiEnabled: boolean) => nextStep({ lopiEnabled })} 
          onBack={prevStep} 
          initialEnabled={onboardingState.lopiEnabled} 
        />;
      case 8:
        return <CompletionStep 
          onComplete={completeOnboarding} 
          userName={getUserName()}
        />;
      default:
        return <WelcomeStep onNext={() => nextStep()} />;
    }
  };
  
  // Helper to get user's name for completion step
  const getUserName = () => {
    try {
      // Try to get name from local storage or session
      const storedName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
      if (storedName) return storedName;
      
      // Default to 'friend' if no name found
      return 'friend';
    } catch (e) {
      return 'friend';
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / 9) * 100;
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8 space-y-2">
          <Progress value={progressPercentage} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of 9</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
        </div>
        
        {/* Current step */}
        {renderStep()}
      </div>
    </div>
  );
}