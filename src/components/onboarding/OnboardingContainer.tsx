/**
 * OnboardingContainer
 * 
 * Main container component for the enhanced onboarding flow
 * Manages state, progression through steps, and Supabase integration
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingData, OnboardingProgress } from '@/types/onboarding';

// Import all onboarding steps
import WelcomeStep from './steps/WelcomeStep';
import ValueDiscoveryStep from './steps/ValueDiscoveryStep';
import PrayerDemoStep from './steps/PrayerDemoStep';
import MotivationStep from './steps/MotivationStep';
import AuthStep from './steps/AuthStep';
import PrayerSetupStep from './steps/PrayerSetupStep';
import FirstPrayerStep from './steps/FirstPrayerStep';
import GoalSettingStep from './steps/GoalSettingStep';
import GamificationIntroStep from './steps/GamificationIntroStep';
import AIIntroStep from './steps/AIIntroStep';
import CompletionStep from './steps/CompletionStep';

interface OnboardingContainerProps {
  initialStep?: number;
  onComplete?: () => void;
}

export default function OnboardingContainer({ 
  initialStep, 
  onComplete 
}: OnboardingContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    onboardingData, 
    updateOnboardingData, 
    logFirstPrayer,
    completeOnboarding,
    progress,
    completeStep,
    setCurrentStep,
    isLoading,
    error 
  } = useOnboarding();

  // Initialize current step from saved progress or initialStep prop
  const [currentStep, setCurrentStepState] = useState(() => {
    if (initialStep !== undefined) return Math.max(0, Math.min(initialStep, 10)); // Bound between 0-10
    return Math.max(0, Math.min(progress.currentStep || 0, 10)); // Bound between 0-10
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync currentStep with progress when progress changes (on mount/restoration)
  useEffect(() => {
    if (initialStep === undefined && progress.currentStep !== currentStep) {
      const boundedStep = Math.max(0, Math.min(progress.currentStep, 10)); // Bound between 0-10
      setCurrentStepState(boundedStep);
    }
  }, [progress.currentStep, initialStep, currentStep]);

  // Define the complete 11-step onboarding flow
  const steps = [
    // Phase 1: Pre-Auth Discovery
    { component: WelcomeStep, phase: 1, name: 'welcome' },
    { component: ValueDiscoveryStep, phase: 1, name: 'value_discovery' },
    { component: PrayerDemoStep, phase: 1, name: 'prayer_demo' },
    { component: MotivationStep, phase: 1, name: 'motivation' },
    
    // Phase 2: Authentication
    { component: AuthStep, phase: 2, name: 'authentication' },
    
    // Phase 3: Post-Auth Setup
    { component: PrayerSetupStep, phase: 3, name: 'prayer_setup' },
    { component: FirstPrayerStep, phase: 3, name: 'first_prayer' }, // Zero State Killer!
    { component: GoalSettingStep, phase: 3, name: 'goal_setting' },
    { component: GamificationIntroStep, phase: 3, name: 'gamification' },
    { component: AIIntroStep, phase: 3, name: 'ai_introduction' },
    
    // Phase 4: Completion
    { component: CompletionStep, phase: 4, name: 'completion' }
  ];

  // Ensure currentStep is always within valid bounds
  const safeCurrentStep = Math.max(0, Math.min(currentStep, steps.length - 1));
  const currentStepData = steps[safeCurrentStep];
  const isLastStep = safeCurrentStep === steps.length - 1;

  // Update currentStep if it was out of bounds
  useEffect(() => {
    if (currentStep !== safeCurrentStep) {
      setCurrentStepState(safeCurrentStep);
    }
  }, [currentStep, safeCurrentStep]);

  // Show loading state while data is being initialized
  if (isLoading && !currentStepData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  // Navigation handlers
  const goToNextStep = useCallback(async () => {
    if (isTransitioning || !currentStepData) return;
    
    setIsTransitioning(true);
    
    try {
      // Mark current step as completed
      await completeStep(currentStepData.name);
      
      if (isLastStep) {
        // Complete onboarding
        await completeOnboarding();
        onComplete?.();
        router.push('/dashboard');
      } else {
        // Move to next step
        const nextStep = Math.min(currentStep + 1, steps.length - 1);
        setCurrentStepState(nextStep);
        setCurrentStep(nextStep); // Update the hook's progress state
      }
    } catch (err) {
      console.error('Error progressing onboarding:', err);
    } finally {
      setIsTransitioning(false);
    }
  }, [currentStep, isLastStep, completeStep, completeOnboarding, onComplete, router, currentStepData, isTransitioning, setCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0 && !isTransitioning) {
      const prevStep = Math.max(currentStep - 1, 0);
      setCurrentStepState(prevStep);
      setCurrentStep(prevStep); // Update the hook's progress state
    }
  }, [currentStep, isTransitioning, setCurrentStep]);

  const skipStep = useCallback(() => {
    if (!isTransitioning) {
      goToNextStep();
    }
  }, [goToNextStep, isTransitioning]);

  // Data update handler
  const handleDataUpdate = useCallback((updates: Partial<OnboardingData>) => {
    updateOnboardingData(updates);
  }, [updateOnboardingData]);

  // First prayer logging handler
  const handleFirstPrayerLog = useCallback(async (prayerData: any) => {
    try {
      const result = await logFirstPrayer(prayerData);
      return result;
    } catch (err) {
      console.error('Error logging first prayer:', err);
      throw err;
    }
  }, [logFirstPrayer]);

  // Render current step
  const CurrentStepComponent = currentStepData.component;

  // Safety check to ensure currentStepData exists
  if (!currentStepData || !CurrentStepComponent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive font-medium">Onboarding Error</p>
          <p className="text-muted-foreground text-sm mt-2">
            Invalid step configuration. Please restart the onboarding process.
          </p>
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {safeCurrentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">
              Phase {currentStepData?.phase || 1}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((safeCurrentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content - Fixed height, centered, no scrolling */}
      <div className="flex-1 flex items-center justify-center pt-20 pb-4 px-4">
        <div className="w-full max-w-md">
          <div className="h-[calc(100vh-140px)] max-h-[600px] min-h-[500px] flex items-center justify-center overflow-hidden">
            <div className="w-full max-h-full overflow-y-auto">
              {currentStepData?.name === 'first_prayer' ? (
                <FirstPrayerStep
                  onNext={goToNextStep}
                  onPrevious={safeCurrentStep > 0 ? goToPreviousStep : undefined}
                  onFirstPrayerLog={handleFirstPrayerLog}
                  isLoading={isLoading || isTransitioning}
                />
              ) : (
                <CurrentStepComponent
                  data={onboardingData}
                  onDataUpdate={handleDataUpdate}
                  onNext={goToNextStep}
                  onPrevious={safeCurrentStep > 0 ? goToPreviousStep : undefined}
                  isLoading={isLoading || isTransitioning}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="max-w-md mx-auto bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg">
            <p className="text-sm font-medium">Something went wrong</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}