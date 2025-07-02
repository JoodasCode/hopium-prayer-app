/**
 * OnboardingContainer
 * 
 * Main container component for the enhanced onboarding flow
 * Manages state, progression through steps, and Supabase integration
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useAuth } from '@/hooks/useAuth';
// Removed UserStateContext dependency
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Import beautiful step components
import { WelcomeStep } from './steps/WelcomeStep';
import { MotivationStep } from './steps/MotivationStep';
import { PrayerStoryStep } from './steps/PrayerStoryStep';
import { PrayerBaselineStep } from './steps/PrayerBaselineStep';
import { IntentionStep } from './steps/IntentionStep';
import { CompletionStep } from './steps/CompletionStep';

// Types
interface OnboardingState {
  motivations: string[];
  prayerStory: string;
  prayerBaseline: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  intentions: string[];
  lopiEnabled: boolean;
}

export default function OnboardingContainer() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { updateProfile } = useAuth();
  // Direct onboarding without UserStateContext
  
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    motivations: [],
    prayerStory: '',
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

  // Load user data on mount
  useEffect(() => {
    async function getUserData() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error } = await supabase.auth.getUser();
        
        // Require authentication - redirect to login if no user
        if (error || !user) {
          console.log('No authenticated user, redirecting to login');
          router.push('/login');
          return;
        }
        
        setUserId(user.id);
        
        // UserStateContext will handle redirects based on onboarding completion
        // We just initialize with default state
        setOnboardingState({
          motivations: [],
          prayerStory: '',
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
      } catch (error) {
        console.error('Unexpected error in getUserData:', error);
      } finally {
        setLoading(false);
      }
    }

    getUserData();
  }, [supabase, router]);

  // Save progress (simplified - just local state)
  const saveProgress = async (updates = {}, nextStep?: number) => {
    if (!userId) return;
    
    try {
      setSaving(true);
      
      console.log('Saving onboarding progress:', { updates, nextStep });
      
      // Update local state
      setOnboardingState(prev => ({ ...prev, ...updates }));
      
      if (nextStep !== undefined) {
        setCurrentStep(nextStep);
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
  };
  
  const prevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };
  
  // Complete onboarding - Simple and direct approach
  const completeOnboarding = async () => {
    setSaving(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }
      
      // Direct database update - upsert user record with onboarding completed
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (upsertError) {
        throw upsertError;
      }
      
      // Show success message
      toast({
        title: 'Welcome to Hopium!',
        description: 'Your spiritual journey begins now',
        variant: 'default'
      });
      
      // Direct redirect to dashboard - let ProtectedRoute handle verification
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalSteps = 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeStep 
            onNext={() => nextStep()}
          />
        );
      case 1:
        return (
          <MotivationStep 
            onNext={(motivations) => nextStep({ motivations })}
            onBack={prevStep}
            selectedMotivations={onboardingState.motivations}
          />
        );
      case 2:
        return (
          <PrayerStoryStep 
            onNext={(story) => nextStep({ prayerStory: story })}
            onBack={prevStep}
            selectedStory={onboardingState.prayerStory}
          />
        );
      case 3:
        return (
          <PrayerBaselineStep 
            onNext={(baseline) => nextStep({ prayerBaseline: baseline })}
            onBack={prevStep}
            selectedBaseline={onboardingState.prayerBaseline}
          />
        );
      case 4:
        return (
          <IntentionStep 
            onNext={(intentions) => nextStep({ intentions })}
            onBack={prevStep}
            selectedIntentions={onboardingState.intentions}
          />
        );
      case 5:
        return (
          <CompletionStep 
            onComplete={completeOnboarding}
            userName={'Friend'} // Simplified without UserState
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Beautiful Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
}