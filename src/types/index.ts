// Core User Types
export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  onboarding_completed: boolean;
  prayer_method: string;
  theme_preference: string;
  notification_settings: NotificationSettings;
}

export interface NotificationSettings {
  prayer_reminders: boolean;
  community_updates: boolean;
  achievement_notifications: boolean;
  reminder_timing: number; // minutes before prayer
}

// Prayer Types
export interface Prayer {
  id: string;
  name: PrayerName;
  time: Date;
  status: PrayerStatus;
  timeAgo?: string;
  timeRemaining?: string;
  scheduledTime: string;
  completedTime?: string;
  completed: boolean;
  notes?: string;
  emotionalStateBefore?: EmotionalState;
  emotionalStateAfter?: EmotionalState;
  mindfulnessScore?: number;
}

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export type PrayerStatus = 'completed' | 'upcoming' | 'missed' | 'current';
export type EmotionalState = 'anxious' | 'calm' | 'grateful' | 'tired' | 'focused' | 'peaceful' | 'stressed' | 'blessed';

// Prayer Time Calculation
export interface PrayerTimes {
  fajr: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  sunrise: Date;
  sunset: Date;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface CalculationMethod {
  name: string;
  params: {
    fajr: number;
    isha: number;
    maghrib?: number;
    midnight?: 'Standard' | 'Jafari';
  };
}

// User Stats & Progress
export interface UserStats {
  user_id: string;
  current_streak: number;
  best_streak: number;
  total_prayers_completed: number;
  total_prayers_missed: number;
  completion_rate: number;
  streak_shields: number;
  last_calculated_at: string;
  mindfulness_index: number;
}

export interface PrayerStats {
  total_prayers: number;
  completed_prayers: number;
  missed_prayers: number;
  late_prayers: number;
  on_time_prayers: number;
  completion_rate: number;
  avg_delay_minutes: number;
  most_missed_prayer?: PrayerName;
  best_prayer?: PrayerName;
}

// Settings & Preferences
export interface UserSettings {
  user_id: string;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  qibla_preferences: QiblaPreferences;
  calendar_preferences: CalendarPreferences;
  insights_preferences: InsightsPreferences;
  updated_at: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
}

export interface PrivacySettings {
  shareActivity: boolean;
  dataCollection: boolean;
  analytics: boolean;
}

export interface QiblaPreferences {
  defaultMode: 'standard' | 'ar' | 'map';
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

export interface CalendarPreferences {
  defaultView: 'month' | 'week' | 'day';
  showHijriDate: boolean;
  highlightPrayerTimes: boolean;
}

export interface InsightsPreferences {
  defaultTab: 'overview' | 'trends' | 'achievements';
  showDetailedStats: boolean;
}

// Lopi AI Assistant Types
export interface LopiConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  context?: Record<string, any>;
  is_archived: boolean;
  category?: string;
}

export interface LopiMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: Record<string, any>;
  tokens_used?: number;
  model_used?: string;
}

export interface LopiKnowledge {
  id: string;
  topic: string;
  content: string;
  source?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  embedding?: number[];
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Form Types
export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
}

export interface SignInForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface OnboardingForm {
  display_name: string;
  location: LocationData;
  prayer_method: string;
  notification_preferences: NotificationSettings;
  privacy_preferences: PrivacySettings;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Hook Return Types
export interface UseAuthReturn {
  session: any;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<any>;
}

export interface UsePrayerTimesReturn {
  prayerTimes: PrayerTimes | null;
  nextPrayer: Prayer | null;
  prayers: Prayer[];
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  refreshPrayerTimes: () => Promise<void>;
}

export interface UseUserStatsReturn {
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
} 