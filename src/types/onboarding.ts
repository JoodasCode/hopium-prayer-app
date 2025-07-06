// Onboarding Data Types for Mulvi
// Comprehensive interfaces for the 4-phase onboarding system

export interface OnboardingData {
  // Phase 1: Pre-auth Discovery
  motivations: string[];
  discoverySource: string;
  locationPermission: boolean;
  
  // Phase 2: Authentication (handled by Supabase)
  authMethod: 'email' | 'google' | 'apple';
  
  // Phase 3: Post-auth Setup
  prayerMethod: string;
  currentConsistency: number; // 1-5 scale
  spiritualGoals: string[];
  personalWhy: string;
  
  // First Prayer Logging (Zero State Killer)
  firstPrayerType: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  firstPrayerScenario: 'just_finished' | 'about_to_start' | 'earlier_today' | 'schedule_next';
  firstPrayerEmotion?: 'focused' | 'peaceful' | 'rushed' | 'grateful' | 'strong';
  firstPrayerTiming?: 'early' | 'on_time' | 'late';
  
  // User Preferences
  notificationStyle: 'gentle' | 'standard' | 'persistent';
  gamificationLevel: 'minimal' | 'balanced' | 'full';
  
  // Metadata
  completedAt: Date;
  onboardingVersion: string;
}

export interface FirstPrayerCapture {
  prayerType: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  scenario: 'just_finished' | 'about_to_start' | 'earlier_today' | 'schedule_next';
  emotionalState?: 'focused' | 'peaceful' | 'rushed' | 'grateful' | 'strong';
  timing?: 'early' | 'on_time' | 'late';
  approximateTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  reminderPreference?: {
    enabled: boolean;
    minutesBefore: 5 | 10 | 15 | 30;
  };
}

export interface FirstPrayerResult {
  success: boolean;
  xpEarned: number;
  message: string;
  prayerLogged: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: string;
  isCompleted: boolean;
  data?: Record<string, any>;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  phase: 1 | 2 | 3 | 4;
  startedAt: Date;
  completedSteps: string[];
  skippedSteps: string[];
}

export interface MotivationOption {
  id: string;
  label: string;
  description: string;
  icon?: string;
}

export interface GoalOption {
  id: string;
  label: string;
  description: string;
  targetConsistency: number; // 1-5 scale
}

export interface PrayerMethodOption {
  id: string;
  name: string;
  description: string;
  region: string;
  isDefault: boolean;
}

// Database record for storing onboarding data
export interface OnboardingRecord {
  id: string;
  user_id: string;
  onboarding_data: OnboardingData;
  first_prayer_logged: boolean;
  completed_at: Date;
  created_at: Date;
  updated_at: Date;
}

// Analytics events for tracking onboarding funnel
export interface OnboardingAnalyticsEvent {
  event_type: 'step_started' | 'step_completed' | 'step_skipped' | 'onboarding_completed' | 'onboarding_abandoned';
  step_id: string;
  phase: number;
  user_id?: string;
  session_id: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Predefined options for the onboarding flow
export const MOTIVATION_OPTIONS: MotivationOption[] = [
  {
    id: 'consistency',
    label: 'Build consistency',
    description: 'Never miss a prayer again',
  },
  {
    id: 'progress',
    label: 'Track progress',
    description: 'See your spiritual growth over time',
  },
  {
    id: 'accountability',
    label: 'Stay accountable',
    description: 'Keep yourself motivated with gentle reminders',
  },
  {
    id: 'growth',
    label: 'Personal growth',
    description: 'Develop a deeper spiritual practice',
  },
];

export const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'maintain',
    label: 'Maintain current level',
    description: 'Keep up your existing prayer routine',
    targetConsistency: 3,
  },
  {
    id: 'improve',
    label: 'Improve consistency',
    description: 'Pray more regularly than you do now',
    targetConsistency: 4,
  },
  {
    id: 'optimize',
    label: 'Optimize and perfect',
    description: 'Never miss a prayer, perfect timing',
    targetConsistency: 5,
  },
];

export const PRAYER_METHOD_OPTIONS: PrayerMethodOption[] = [
  {
    id: 'isna',
    name: 'ISNA',
    description: 'Islamic Society of North America',
    region: 'North America',
    isDefault: true,
  },
  {
    id: 'mwl',
    name: 'Muslim World League',
    description: 'Used in Europe, Far East, parts of US',
    region: 'Global',
    isDefault: false,
  },
  {
    id: 'egypt',
    name: 'Egyptian General Authority',
    description: 'Used in Africa, Syria, Iraq, Lebanon, Malaysia',
    region: 'Africa/Middle East',
    isDefault: false,
  },
  {
    id: 'makkah',
    name: 'Umm Al-Qura University',
    description: 'Used in Saudi Arabia',
    region: 'Saudi Arabia',
    isDefault: false,
  },
];

// Helper functions for onboarding data
export const createEmptyOnboardingData = (): Partial<OnboardingData> => ({
  motivations: [],
  spiritualGoals: [],
  discoverySource: 'direct',
  locationPermission: false,
  currentConsistency: 3,
  notificationStyle: 'standard',
  gamificationLevel: 'balanced',
  onboardingVersion: '1.0.0',
});

export const validateOnboardingData = (data: Partial<OnboardingData>): boolean => {
  // Basic validation rules
  return !!(
    data.motivations?.length &&
    data.prayerMethod &&
    data.firstPrayerType &&
    data.firstPrayerScenario
  );
};

export const calculateOnboardingProgress = (completedSteps: string[]): number => {
  const totalSteps = 7; // Based on our 7-step onboarding flow
  return Math.round((completedSteps.length / totalSteps) * 100);
}; 