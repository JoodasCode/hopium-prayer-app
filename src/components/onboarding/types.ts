// Onboarding step component types

// Base props for all step components
export interface BaseStepProps {
  onBack?: () => void;
}

// Welcome Step
export interface WelcomeStepProps extends BaseStepProps {
  onNext: () => void;
}

// Motivation Step
export interface MotivationStepProps extends BaseStepProps {
  onNext: (motivations: string[]) => void;
  selectedMotivations?: string[];
}

// Prayer Story Step
export interface PrayerStoryStepProps extends BaseStepProps {
  onNext: (prayerStory: string) => void;
  selectedStory?: string;
}

// Theme Step
export type ThemeOption = 'serene' | 'degen' | 'beginner' | 'custom';

export interface ThemeStepProps extends BaseStepProps {
  onNext: (theme: ThemeOption) => void;
  selectedTheme?: ThemeOption;
}

// Qibla Step
export interface QiblaStepProps extends BaseStepProps {
  onNext: () => void;
}

// Prayer Baseline Step
export interface PrayerBaselineStepProps extends BaseStepProps {
  onNext: (prayerBaseline: Record<string, boolean>) => void;
  selectedBaseline?: Record<string, boolean>;
}

// Reminders Step
export interface RemindersStepProps extends BaseStepProps {
  onNext: () => void;
}

// Intention Step
export interface IntentionStepProps extends BaseStepProps {
  onNext: (intentions: string[]) => void;
  selectedIntentions?: string[];
}

// Mulvi Intro Step
export interface MulviIntroStepProps extends BaseStepProps {
  onNext: (mulviEnabled: boolean) => void;
  initialEnabled?: boolean;
}

// Completion Step
export interface CompletionStepProps {
  onComplete: () => void;
  userName?: string;
}

// Onboarding state interface
export interface OnboardingState {
  motivations?: string[];
  prayerStory?: string;
  theme?: ThemeOption;
  qiblaSettings?: {
    locationPermission?: boolean;
    calculationMethod?: string;
    hijriOffset?: number;
    autoLocation?: boolean;
  };
  prayerBaseline?: Record<string, boolean>;
  reminderSettings?: {
    timing?: string;
    style?: string;
  };
  intentions?: string[];
  mulviEnabled?: boolean;
  completed?: boolean;
}
