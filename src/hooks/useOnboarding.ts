import { useState, useCallback, useEffect } from 'react';
import { useSupabaseClient } from './useSupabaseClient';
import { useAuth } from './useAuth';
import { useGamification } from './useGamification';
import { 
  OnboardingData, 
  FirstPrayerCapture,
  FirstPrayerResult,
  OnboardingProgress,
  OnboardingRecord,
  createEmptyOnboardingData,
  validateOnboardingData,
  calculateOnboardingProgress,
  MOTIVATION_OPTIONS,
  GOAL_OPTIONS,
  PRAYER_METHOD_OPTIONS
} from '../types/onboarding';

// Constants for localStorage keys
const ONBOARDING_PROGRESS_KEY = 'mulvi_onboarding_progress';
const ONBOARDING_DATA_KEY = 'mulvi_onboarding_data';

export const useOnboarding = () => {
  const supabase = useSupabaseClient();
  const { user } = useAuth();
  const { awardXP } = useGamification();

  // Enhanced state management with persistence
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(ONBOARDING_DATA_KEY);
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (error) {
          console.error('Failed to parse saved onboarding data:', error);
        }
      }
    }
    return createEmptyOnboardingData();
  });

  const [progress, setProgress] = useState<OnboardingProgress>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem(ONBOARDING_PROGRESS_KEY);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress);
          return {
            ...parsed,
            startedAt: new Date(parsed.startedAt),
          };
        } catch (error) {
          console.error('Failed to parse saved onboarding progress:', error);
        }
      }
    }
    return {
      currentStep: 0,
      totalSteps: 11, // Updated to match our 11-step flow
      phase: 1,
      startedAt: new Date(),
      completedSteps: [],
      skippedSteps: [],
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  // Persist onboarding data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(onboardingData));
    }
  }, [onboardingData]);

  // Persist progress to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  // Check onboarding completion status on mount and user change
  useEffect(() => {
    const checkStatus = async () => {
      if (user) {
        try {
          // First check the users table for onboarding_completed flag
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          if (userError) {
            console.error('Error checking user onboarding status:', userError);
            // If user doesn't exist, they need onboarding
            setOnboardingCompleted(false);
            return;
          }

          const isCompleted = userData?.onboarding_completed || false;
          setOnboardingCompleted(isCompleted);

          // If onboarding is completed, clear any saved progress
          if (isCompleted && typeof window !== 'undefined') {
            localStorage.removeItem(ONBOARDING_PROGRESS_KEY);
            localStorage.removeItem(ONBOARDING_DATA_KEY);
          }
        } catch (error) {
          console.error('Error in useEffect checkOnboardingStatus:', error);
          // Set a safe default if there's an error
          setOnboardingCompleted(false);
        }
      } else {
        setOnboardingCompleted(null);
      }
    };
    
    checkStatus();
  }, [user, supabase]);

  // Update onboarding data
  const updateOnboardingData = useCallback((updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  }, []);

  // Progress tracking with persistence
  const completeStep = useCallback((stepId: string) => {
    setProgress(prev => {
      const newCompletedSteps = [...prev.completedSteps, stepId];
      const newProgress = {
        ...prev,
        completedSteps: newCompletedSteps,
        currentStep: Math.min(prev.currentStep + 1, prev.totalSteps),
      };
      return newProgress;
    });
  }, []);

  // Set current step (for navigation/restoration)
  const setCurrentStep = useCallback((step: number) => {
    setProgress(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, prev.totalSteps - 1)),
    }));
  }, []);

  // First Prayer Logging (Zero State Killer) - Unified Approach
  const logFirstPrayer = useCallback(async (prayerData: FirstPrayerCapture): Promise<FirstPrayerResult> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      let scheduledTime: Date;
      let completedTime: Date;
      let notes: string;
      let xpAmount: number;

      // All scenarios create COMPLETED prayers with different timing and messaging
      switch (prayerData.scenario) {
        case 'just_finished':
          scheduledTime = now;
          completedTime = now;
          notes = `Great! Logged your ${prayerData.prayerType} prayer`;
          xpAmount = 25;
          break;
          
        case 'about_to_start':
          scheduledTime = now;
          completedTime = now;
          notes = `Perfect timing! Pre-logged your ${prayerData.prayerType} prayer. You can update this after you finish.`;
          xpAmount = 25;
          break;
          
        case 'earlier_today':
          // Set to earlier today based on approximate time
          const hoursAgo = prayerData.approximateTime === 'morning' ? 8 :
                          prayerData.approximateTime === 'afternoon' ? 4 :
                          prayerData.approximateTime === 'evening' ? 2 : 1;
          scheduledTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
          completedTime = scheduledTime;
          notes = `Added your earlier ${prayerData.prayerType} prayer to your log`;
          xpAmount = 20;
          break;
          
        case 'schedule_next':
          scheduledTime = now;
          completedTime = now;
          notes = `Great start! Logged a ${prayerData.prayerType} prayer to get you going. Your next prayer reminder is set.`;
          xpAmount = 15;
          break;
          
        default:
          throw new Error('Invalid prayer scenario');
      }

      // Insert completed prayer record for ALL scenarios
      const { error: prayerError } = await supabase
        .from('prayer_records')
        .insert({
          user_id: user.id,
          prayer_type: prayerData.prayerType,
          scheduled_time: scheduledTime.toISOString(),
          completed_time: completedTime.toISOString(),
          completed: true, // ALWAYS completed for onboarding
          emotional_state_after: prayerData.emotionalState || 'peaceful',
          notes: notes,
          is_onboarding_prayer: true,
          timing_quality: prayerData.timing || 'on_time',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (prayerError) throw prayerError;

      // Award XP based on scenario
      await awardXP(xpAmount, 'first_prayer', 'onboarding');

      // Update onboarding data
      updateOnboardingData({
        firstPrayerType: prayerData.prayerType,
        firstPrayerScenario: prayerData.scenario,
        firstPrayerEmotion: prayerData.emotionalState,
        firstPrayerTiming: prayerData.timing,
      });

      return { 
        success: true, 
        xpEarned: xpAmount,
        message: notes,
        prayerLogged: true 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log first prayer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase, awardXP, updateOnboardingData]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    if (!user || !validateOnboardingData(onboardingData)) {
      throw new Error('Invalid onboarding data');
    }

    setIsLoading(true);
    setError(null);

    try {
      // CRITICAL: Update users table to mark onboarding as completed
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (userUpdateError) throw userUpdateError;

      // Award completion XP
      await awardXP(50, 'onboarding_complete', 'onboarding');

      // Clear localStorage data since onboarding is complete
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ONBOARDING_PROGRESS_KEY);
        localStorage.removeItem(ONBOARDING_DATA_KEY);
      }

      // Update local state
      setOnboardingCompleted(true);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, onboardingData, supabase, awardXP]);

  // Check if user has completed onboarding
  const checkOnboardingStatus = useCallback(async () => {
    if (!user) {
      setOnboardingCompleted(null);
      return false;
    }

    try {
      // First check the users table for onboarding_completed flag
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error checking user onboarding status:', userError);
        // If user doesn't exist, they need onboarding
        setOnboardingCompleted(false);
        return false;
      }

      const isCompleted = userData?.onboarding_completed || false;
      setOnboardingCompleted(isCompleted);

      // If onboarding is completed, clear any saved progress
      if (isCompleted && typeof window !== 'undefined') {
        localStorage.removeItem(ONBOARDING_PROGRESS_KEY);
        localStorage.removeItem(ONBOARDING_DATA_KEY);
      }

      return isCompleted;
    } catch (err) {
      console.error('Error checking onboarding status:', err);
      setOnboardingCompleted(false);
      return false;
    }
  }, [user, supabase]);

  // Reset onboarding (for testing purposes)
  const resetOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ONBOARDING_PROGRESS_KEY);
      localStorage.removeItem(ONBOARDING_DATA_KEY);
    }
    setOnboardingData(createEmptyOnboardingData());
    setProgress({
      currentStep: 0,
      totalSteps: 11,
      phase: 1,
      startedAt: new Date(),
      completedSteps: [],
      skippedSteps: [],
    });
    setOnboardingCompleted(false);
  }, []);

  // Calculate progress percentage
  const progressPercentage = calculateOnboardingProgress(progress.completedSteps);

  return {
    // Data
    onboardingData,
    progress,
    progressPercentage,
    isLoading,
    error,
    onboardingCompleted,
    
    // Options
    motivationOptions: MOTIVATION_OPTIONS,
    goalOptions: GOAL_OPTIONS,
    prayerMethodOptions: PRAYER_METHOD_OPTIONS,
    
    // Actions
    updateOnboardingData,
    completeStep,
    setCurrentStep,
    logFirstPrayer,
    completeOnboarding,
    checkOnboardingStatus,
    resetOnboarding,
    
    // Validation
    isValid: validateOnboardingData(onboardingData),
  };
}; 