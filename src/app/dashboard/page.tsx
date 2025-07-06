'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Sun, Moon, Sunset, Clock, CheckCircle, Bell, Target, Flame, Users, Sparkles, TrendingUp, Shield
} from 'lucide-react';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { usePrayerWithRecords } from '@/hooks/usePrayerWithRecords';
import { useUserStats } from '@/hooks/useUserStats';
import { useNotifications } from '@/hooks/useNotifications';
import { Header } from '@/components/dashboard/Header';
import { NextPrayerCard } from '@/components/dashboard/NextPrayerCard';
import { TodaysPrayers } from '@/components/dashboard/TodaysPrayers';
import { StreakOverview } from '@/components/dashboard/StreakOverview';
import { ActionZone } from '@/components/dashboard/ActionZone';
import { CommunityPresence } from '@/components/dashboard/CommunityPresence';
import { MindfulnessTips } from '@/components/dashboard/MindfulnessTips';
import { PrayerJourney } from '@/components/dashboard/PrayerJourney';
import { SmartTip } from '@/components/dashboard/SmartTip';
import { EmotionalContext } from '@/components/dashboard/EmotionalContext';
import { EmotionTracker } from '@/components/dashboard/EmotionTracker';
import { CommunityPresenceModal } from '@/components/modals/CommunityPresenceModal';
import { LocationPermissionModal } from '@/components/modals/LocationPermissionModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, MapPin, AlertTriangle } from 'lucide-react';
import { prayers as fallbackPrayers, getNextPrayer } from '@/components/dashboard/data';

// Direct imports instead of lazy loading to fix webpack chunk issues
import { PrayerReflectionModal } from '@/components/modals/PrayerReflectionModal';
import { InsightsModal } from '@/components/modals/InsightsModal';
import { StreakMilestoneModal } from '@/components/modals/StreakMilestoneModal';
import { QadaRecoveryModal } from '@/components/modals/QadaRecoveryModal';
import { GoalSettingModal } from '@/components/modals/GoalSettingModal';
import { StreakFreezeModal } from '@/components/modals/StreakFreezeModal';
import { PrayerReminderModal } from '@/components/modals/PrayerReminderModal';

import { useCommunityStats } from '@/hooks/useCommunityStats';
import { usePrayerInsights } from '@/hooks/usePrayerInsights';
import { useGoals } from '@/hooks/useGoals';
import { useUserSettings } from '@/hooks/useUserSettings';
import { getTimeBasedGreeting, getDisplayName } from '@/lib/greetings';
import { formatTime } from '@/lib/timeUtils';
import type { Prayer } from '@/types';
import { usePeriodExemptions } from '@/hooks/usePeriodExemptions';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { LoadingButton } from '@/components/ui/loading-button';


export default function DashboardPage() {
  // Modal states
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showStreakMilestoneModal, setShowStreakMilestoneModal] = useState(false);
  const [showQadaRecoveryModal, setShowQadaRecoveryModal] = useState(false);
  const [showGoalSettingModal, setShowGoalSettingModal] = useState(false);
  const [showStreakFreezeModal, setShowStreakFreezeModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [missedPrayerToRecover, setMissedPrayerToRecover] = useState<Prayer | null>(null);
  const [manualQadaMode, setManualQadaMode] = useState(false);
  const [selectedManualQadaPrayer, setSelectedManualQadaPrayer] = useState<Prayer | null>(null);
  
  // UI interaction states
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [completedPrayerIds, setCompletedPrayerIds] = useState<Set<string>>(new Set());
  
  // State for streak protection modal
  const [showStreakProtectionModal, setShowStreakProtectionModal] = useState(false);
  const [streakAtRisk, setStreakAtRisk] = useState(false);
  
  // Get current user
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;
  
  // Get real prayer times integrated with database records
  const { 
    prayers, 
    nextPrayer, 
    location, 
    isLoading: prayerTimesLoading, 
    error: prayerTimesError,
    refreshPrayerTimes,
    todaysProgress,
    completePrayerWithReflection
  } = usePrayerWithRecords({ userId });
  
  // Fetch user stats including streak data
  const { userStats, isLoading: statsLoading, error: statsError } = useUserStats(userId);
  
  // Fetch user notifications and reminders
  const { setReminder } = useNotifications(userId);
  const { communityStats } = useCommunityStats();
  
  // Get AI-powered insights
  const { insights } = usePrayerInsights(userId);
  
  // Get user goals
  const { goals, createGoal, updateStreakGoalProgress, hasActiveGoalOfType } = useGoals(userId);
  
  // Get user settings for period exemption
  const { settings } = useUserSettings(userId);
  
  // Get period exemption data
  const { isCurrentlyExempt } = usePeriodExemptions(userId);

  // Location permission modal state
  const [showLocationPermissionModal, setShowLocationPermissionModal] = useState(false);

  // Check for streak milestones
  const checkStreakMilestone = (currentStreak: number) => {
    const milestones = [7, 14, 30, 50, 100];
    return milestones.includes(currentStreak);
  };

  // List of missed prayers in last 24 hours - Enhanced logic
  const missedPrayersList = useMemo(() => {
    const now = new Date();
    const missed = prayers.filter(prayer => {
      const prayerTime = new Date(prayer.time);
      const hoursAgo = (now.getTime() - prayerTime.getTime()) / (1000 * 60 * 60);
      
      // Consider a prayer missed if:
      // 1. It was scheduled more than 1 hour ago
      // 2. It's within the last 24 hours
      // 3. It's not completed
      // 4. It's not the current prayer (status !== 'current')
      const isMissed = hoursAgo >= 1 && 
                     hoursAgo < 24 && 
                     prayer.status !== 'completed' && 
                     prayer.status !== 'current';
      
      return isMissed;
    });
    
    // Only log if there are missed prayers to avoid spam
    if (missed.length > 0) {
      console.log('Total missed prayers found:', missed.length);
    }
    return missed;
  }, [prayers]);

  // Enhanced Qada button click handler
  const handleQadaClick = () => {
    // For testing purposes, always allow Qada entry regardless of missed prayers
    setManualQadaMode(true);
    setShowQadaRecoveryModal(true);
  };

  // Enhanced manual Qada prayer selection
  const handleManualQadaPrayerSelect = (prayer: Prayer) => {
    setSelectedManualQadaPrayer(prayer);
  };

  // Enhanced prayer recovery function
  const handlePrayerRecovery = async (prayerId: string) => {
    const prayerToRecover = manualQadaMode ? selectedManualQadaPrayer : missedPrayerToRecover;
    
    if (!prayerToRecover) {
      console.error('No prayer selected for recovery');
      return;
    }

    try {
      const prayerTime = typeof prayerToRecover.time === 'string' 
        ? new Date(prayerToRecover.time) 
        : prayerToRecover.time;
      
      await completePrayerWithReflection({
        prayerType: prayerToRecover.name.toLowerCase(),
        scheduledTime: prayerTime.toISOString(),
        completedTime: new Date().toISOString(),
        emotion: 'grateful',
        location: 'home',
        quality: 4,
        reflection: 'Made up missed prayer (Qada)',
        // Mark as Qada prayer in reflection
      });
      
      // Close modal and reset state
      setShowQadaRecoveryModal(false);
      setManualQadaMode(false);
      setSelectedManualQadaPrayer(null);
      setMissedPrayerToRecover(null);
      
    } catch (error) {
      console.error('Failed to recover prayer:', error);
    }
  };

  // Effect to show milestone modal when streak milestone is reached
  useEffect(() => {
    if (userStats?.current_streak && checkStreakMilestone(userStats.current_streak)) {
      // Check if we've already shown this milestone (you might want to store this in localStorage)
      const lastShownMilestone = localStorage.getItem('lastShownMilestone');
      if (lastShownMilestone !== userStats.current_streak.toString()) {
        setShowStreakMilestoneModal(true);
        localStorage.setItem('lastShownMilestone', userStats.current_streak.toString());
      }
    }
  }, [userStats?.current_streak]);

  // Check for missed prayers that can be recovered
  const checkForMissedPrayers = () => {
    const now = new Date();
    const missedPrayers = prayers.filter(prayer => {
      const prayerTime = new Date(prayer.time);
      const timeSincePrayer = now.getTime() - prayerTime.getTime();
      const hoursAgo = timeSincePrayer / (1000 * 60 * 60);
      
      // Consider a prayer "missed" if it's been more than 1 hour since its time
      // and it's not marked as completed, but still within recovery window (24 hours)
      // Show recovery modal between 1-2 hours after missed prayer for immediate action
      return hoursAgo >= 1 && hoursAgo <= 2 && prayer.status !== 'completed';
    });
    
    return missedPrayers[0] || null; // Return first missed prayer
  };

  // Handle setting reminder for missed prayer
  const handleSetQadaReminder = async (prayerId: string, reminderTime: Date) => {
    const prayerToRecover = manualQadaMode ? selectedManualQadaPrayer : missedPrayerToRecover;
    
    if (prayerToRecover && userId) {
      try {
        await setReminder(`${prayerToRecover.name.toLowerCase()}_qada`, 30);
        setShowQadaRecoveryModal(false);
        setManualQadaMode(false);
        setSelectedManualQadaPrayer(null);
        setMissedPrayerToRecover(null);
      } catch (error) {
        console.error('Failed to set Qada reminder:', error);
      }
    }
  };

  // Effect to check for missed prayers
  useEffect(() => {
    const missedPrayer = checkForMissedPrayers();
    if (missedPrayer && !showQadaRecoveryModal) {
      // Check if we've already shown recovery modal for this prayer
      const lastShownQada = localStorage.getItem('lastShownQada');
      const prayerTime = typeof missedPrayer.time === 'string' 
        ? new Date(missedPrayer.time) 
        : missedPrayer.time;
      const prayerKey = `${missedPrayer.name}_${prayerTime.toISOString()}`;
      
      if (lastShownQada !== prayerKey) {
        setMissedPrayerToRecover(missedPrayer);
        setShowQadaRecoveryModal(true);
        localStorage.setItem('lastShownQada', prayerKey);
      }
    }
  }, [prayers, showQadaRecoveryModal]);

  // Get next prayer info from real data or fallback
  const getNextPrayerInfo = () => {
    try {
      if (nextPrayer) {
        return {
          name: nextPrayer.name,
          time: nextPrayer.time,
          timeRemaining: nextPrayer.timeRemaining || 'Loading...'
        };
      }
      
      // Fallback to first upcoming prayer
      const upcomingPrayer = prayers.find(p => p.status === 'upcoming');
      if (upcomingPrayer) {
        return {
          name: upcomingPrayer.name,
          time: upcomingPrayer.time,
          timeRemaining: upcomingPrayer.timeRemaining || 'Loading...'
        };
      }
      
      // Default fallback
      return { 
        name: 'Dhuhr', 
        time: new Date(),
        timeRemaining: 'Loading...' 
      };
    } catch (error) {
      console.error('Error getting next prayer info:', error);
      return { 
        name: 'Dhuhr', 
        time: new Date(),
        timeRemaining: 'Loading...' 
      };
    }
  };

  const nextAction = getNextPrayerInfo();
  
  // Handle prayer completion with reflection data
  const handlePrayerCompletion = async (reflectionData: {
    emotion: string;
    location: string;
    quality: number;
    reflection?: string;
  }) => {
    if (!selectedPrayer) return;
    
    try {
      const prayerTime = typeof selectedPrayer.time === 'string' 
        ? new Date(selectedPrayer.time) 
        : selectedPrayer.time;
      
      await completePrayerWithReflection({
        prayerType: selectedPrayer.name.toLowerCase(),
        scheduledTime: prayerTime.toISOString(),
        completedTime: new Date().toISOString(),
        emotion: reflectionData.emotion,
        location: reflectionData.location,
        quality: reflectionData.quality,
        reflection: reflectionData.reflection
      });
      
      // Clear the prayer from completed IDs since it's now successfully completed
      const prayerKey = `${selectedPrayer.name}_${prayerTime.toISOString()}`;
      setCompletedPrayerIds(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(prayerKey);
        return newSet;
      });
      
      setShowReflectionModal(false);
      setSelectedPrayer(null);
    } catch (error) {
      console.error('Failed to complete prayer:', error);
      // If prayer completion fails, also clear the lock so user can try again
      if (selectedPrayer) {
        const prayerTime = typeof selectedPrayer.time === 'string' 
          ? new Date(selectedPrayer.time) 
          : selectedPrayer.time;
        const prayerKey = `${selectedPrayer.name}_${prayerTime.toISOString()}`;
        setCompletedPrayerIds(prev => {
          const newSet = new Set(Array.from(prev));
          newSet.delete(prayerKey);
          return newSet;
        });
      }
    }
  };

  // Handle mark prayer complete with smart locking
  const handleMarkComplete = async () => {
    if (!nextPrayer) return;
    
    // Create unique prayer ID based on prayer name and time
    const prayerTime = typeof nextPrayer.time === 'string' 
      ? new Date(nextPrayer.time) 
      : nextPrayer.time;
    const prayerKey = `${nextPrayer.name}_${prayerTime.toISOString()}`;
    
    // Check if this prayer is already being processed or completed
    if (isMarkingComplete || completedPrayerIds.has(prayerKey)) {
      return; // Prevent duplicate processing
    }
    
    // Lock this prayer
    setIsMarkingComplete(true);
    setCompletedPrayerIds(prev => new Set(Array.from(prev).concat(prayerKey)));
    
    // Add slight delay for visual feedback
    setTimeout(() => {
      setSelectedPrayer(nextPrayer);
      setShowReflectionModal(true);
      setIsMarkingComplete(false);
    }, 300);
    
    // Safety timeout to clear lock if something goes wrong (30 seconds)
    setTimeout(() => {
      setCompletedPrayerIds(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(prayerKey);
        return newSet;
      });
    }, 30000);
  };

  // Handle remind me - now opens the new modal
  const handleRemindMe = async () => {
    if (nextPrayer) {
      setShowReminderModal(true);
    }
  };

  // Handle setting reminder with options
  const handleSetReminderWithOptions = async (reminderOptions: {
    minutesBefore: number;
    enableSound: boolean;
    enableVibration: boolean;
  }) => {
    if (!nextPrayer || !userId) return false;

    setIsSettingReminder(true);
    try {
      const success = await setReminder(nextPrayer.name.toLowerCase(), reminderOptions.minutesBefore);
      if (success) {
        // Store reminder preferences for future use
        localStorage.setItem('reminderPreferences', JSON.stringify({
          enableSound: reminderOptions.enableSound,
          enableVibration: reminderOptions.enableVibration,
          lastUsedMinutes: reminderOptions.minutesBefore
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to set reminder:', error);
      return false;
    } finally {
      setIsSettingReminder(false);
    }
  };

  // Calculate today's progress
  const todaysPrayerCount = todaysProgress?.completed || 0;
  const totalPrayersToday = 5;
  const progressPercentage = (todaysPrayerCount / totalPrayersToday) * 100;

  const getPrayerIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return <Sun className="h-5 w-5 text-chart-1" />;
    if (hour >= 12 && hour < 18) return <Sun className="h-5 w-5 text-chart-1" />;
    if (hour >= 18 && hour < 20) return <Sunset className="h-5 w-5 text-chart-1" />;
    return <Moon className="h-5 w-5 text-chart-1" />;
  };

  // Handle setting a new goal
  const handleSetGoal = async (goalType: string, value: number) => {
    if (!userId) return;
    
    try {
      // Map goal types to proper titles and descriptions
      const goalMappings = {
        'consistent_7': {
          title: '7-Day Consistency',
          description: 'Complete all daily prayers for 7 consecutive days'
        },
        'consistent_30': {
          title: 'Monthly Devotion', 
          description: 'Complete all daily prayers for 30 consecutive days'
        },
        'streak_milestone': {
          title: `${value}-Day Milestone`,
          description: `Reach a ${value}-day prayer streak`
        },
        'custom_streak': {
          title: 'Custom Prayer Goal',
          description: `Maintain a ${value}-day prayer streak`
        }
      };

      const goalData = goalMappings[goalType as keyof typeof goalMappings];
      
      if (!goalData) {
        console.error('Unknown goal type:', goalType);
        return;
      }

      // Create goal in database
      const newGoal = await createGoal({
        title: goalData.title,
        description: goalData.description,
        target_value: value,
        goal_type: goalType,
        end_date: goalType.includes('consistent') ? 
          new Date(Date.now() + value * 24 * 60 * 60 * 1000).toISOString() : 
          undefined
      });
      
      if (newGoal) {
        console.log('Goal created successfully:', newGoal);
        // Show success feedback (you could add a toast here)
      }
    } catch (error) {
      console.error('Failed to set goal:', error);
    }
  };

  // Enhanced streak protection logic
  const checkStreakAtRisk = () => {
    const now = new Date();
    const nextPrayer = getNextPrayerInfo();
    
    if (!nextPrayer) return false;
    
    const timeDiff = nextPrayer.time.getTime() - now.getTime();
    const hoursUntilPrayer = timeDiff / (1000 * 60 * 60);
    
    // Consider streak at risk if next prayer is in less than 2 hours
    return hoursUntilPrayer < 2 && hoursUntilPrayer > 0;
  };

  // Update streak risk status
  useEffect(() => {
    const isAtRisk = checkStreakAtRisk();
    setStreakAtRisk(isAtRisk);
  }, [prayers]);

  // Handle streak protection modal
  const handleStreakProtectionClick = () => {
    console.log('Streak protection clicked');
    setShowStreakProtectionModal(true);
  };

  // Handle using streak freeze
  const handleUseStreakFreeze = async () => {
    try {
      // Here you would implement the backend call to use a streak freeze
      console.log('Using streak freeze');
      
      // For now, just show a success message
      toast({
        title: "Streak Shield Activated",
        description: "Your prayer streak is now protected for the next 24 hours.",
        variant: "default"
      });
      
      setShowStreakProtectionModal(false);
    } catch (error) {
      console.error('Error using streak freeze:', error);
      toast({
        title: "Error",
        description: "Failed to activate streak shield. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get streak freezes remaining (placeholder - should come from backend)
  const getStreakFreezesRemaining = () => {
    // This should be fetched from your backend/database
    return 3; // Placeholder value
  };

  // Effect to check for streak at risk
  useEffect(() => {
    if (userStats?.current_streak && userStats.current_streak > 3) { // Only for users with established streaks
      const isAtRisk = checkStreakAtRisk();
      
      if (isAtRisk && !showStreakFreezeModal) {
        // Check if we've already shown this today
        const lastShownRisk = localStorage.getItem('lastShownStreakRisk');
        const today = new Date().toDateString();
        
        if (lastShownRisk !== today) {
          setShowStreakFreezeModal(true);
          localStorage.setItem('lastShownStreakRisk', today);
        }
      }
    }
  }, [userStats?.current_streak, todaysPrayerCount, showStreakFreezeModal]);

  useEffect(() => {
    // Update goal progress when streak changes
    if (userStats?.current_streak !== undefined) {
      updateStreakGoalProgress(userStats.current_streak);
    }
  }, [userStats?.current_streak, updateStreakGoalProgress]);

  const router = useRouter();

  // Handle "View All Insights" navigation
  const handleViewAllInsights = () => {
    router.push('/stats?tab=insights');
    setShowInsightsModal(false);
  };

  // Determine if we have any critical errors
  const hasCriticalError = prayerTimesError && !prayers?.length;
  const hasLocationError = prayerTimesError?.includes('Location') || !location;

  // Use fallback data when there are errors
  const safePrayers = prayers?.length > 0 ? prayers : fallbackPrayers;
  const safeNextPrayer = nextPrayer || getNextPrayer(fallbackPrayers);
  const safeLocation = location || { city: 'Current Location', country: 'Unknown' };

  // Calculate missed prayers safely
  const missedPrayers = useMemo(() => {
    try {
      const now = new Date();
      const missed = safePrayers.filter(prayer => {
        const prayerTime = new Date(prayer.time);
        const timeSincePrayer = now.getTime() - prayerTime.getTime();
        const hoursAgo = timeSincePrayer / (1000 * 60 * 60);
        return hoursAgo >= 1 && hoursAgo <= 24 && prayer.status !== 'completed';
      });
      
      console.log(`Total missed prayers found: ${missed.length}`);
      return missed;
    } catch (error) {
      console.error('Error calculating missed prayers:', error);
      return [];
    }
  }, [safePrayers]);

  // Only show skeleton if we truly don't have any data
  if (authLoading || prayerTimesLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state with retry options
  if (hasCriticalError) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto mt-20">
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to load prayer times. Please check your connection and try again.
            </AlertDescription>
          </Alert>
          
          {hasLocationError && (
            <Alert className="mb-4">
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Location access needed for accurate prayer times.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Button 
              onClick={() => refreshPrayerTimes()} 
              className="w-full"
              disabled={prayerTimesLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${prayerTimesLoading ? 'animate-spin' : ''}`} />
              Retry Loading Prayer Times
            </Button>
            
            {hasLocationError && (
              <Button 
                onClick={() => setShowLocationPermissionModal(true)} 
                variant="outline" 
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Enable Location Access
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient pt-safe-top pb-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-1/15 flex items-center justify-center">
                {getPrayerIcon()}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {getTimeBasedGreeting().greeting}, {getDisplayName(user)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="touch-target">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Next Prayer Card */}
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">Next Prayer</p>
              
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">☀️</span>
                  <h2 className="text-4xl font-bold text-chart-1">
                    {nextAction.name}
                  </h2>
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-semibold text-foreground">
                    {formatTime(nextAction.time)}
                  </span>
                </div>
                
                <p className="text-muted-foreground">
                  {nextAction.timeRemaining}
                </p>
              </div>
              
              <div className="flex gap-3">
                <LoadingButton 
                  onClick={handleMarkComplete}
                  disabled={!nextPrayer || (nextPrayer && completedPrayerIds.has(`${nextPrayer.name}_${nextPrayer.time.toISOString()}`))}
                  className="flex-1 h-12 bg-chart-1 hover:bg-chart-1/90 text-primary-foreground font-medium"
                  loading={isMarkingComplete}
                  loadingText="Marking..."
                >
                  {nextPrayer && completedPrayerIds.has(`${nextPrayer.name}_${nextPrayer.time.toISOString()}`) ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </div>
                  )}
                </LoadingButton>
                
                <LoadingButton 
                  onClick={handleRemindMe}
                  variant="outline"
                  className="flex-1 h-12 border-chart-1/30 text-chart-1 hover:bg-chart-1/10"
                  loading={isSettingReminder}
                  loadingText="Setting..."
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Remind Me
                  </div>
                </LoadingButton>
              </div>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-chart-2/20 flex items-center justify-center">
                    <Target className="h-4 w-4 text-chart-2" />
                  </div>
                  <h3 className="font-medium text-foreground">Today's Progress</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right relative">
                    {/* Period Exemption Banner */}
                    {settings?.period_exemption && isCurrentlyExempt() && (
                      <div className="absolute -top-2 -right-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full border border-purple-200 z-10">
                        Exempted
                      </div>
                    )}
                    
                    <div className="text-2xl font-bold text-chart-2">
                      {userStats?.current_streak || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">day streak</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-chart-3/20 flex items-center justify-center">
                      <Flame className="h-4 w-4 text-chart-3" />
                    </div>
                    
                    {/* Streak Protection Shield */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleStreakProtectionClick}
                      className={cn(
                        "w-8 h-8 p-0 rounded-full transition-all duration-200",
                        streakAtRisk 
                          ? "bg-amber-100 hover:bg-amber-200 text-amber-600" 
                          : "bg-primary/10 hover:bg-primary/20 text-primary"
                      )}
                      title={streakAtRisk ? "Your streak is at risk! Click to protect it." : "Streak Protection"}
                    >
                      <Shield className={cn(
                        "h-4 w-4 transition-all duration-200",
                        streakAtRisk && "animate-pulse"
                      )} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {todaysPrayerCount} of {totalPrayersToday} completed
                  </span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    {communityStats?.users_praying_now || 26} community members praying now
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowGoalSettingModal(true)}
                      className="text-xs h-6 px-2 text-chart-2 hover:bg-chart-2/10"
                    >
                      {hasActiveGoalOfType('consistent_7') || hasActiveGoalOfType('consistent_30') || hasActiveGoalOfType('streak_milestone') || hasActiveGoalOfType('custom_streak') ? 'Update Goal' : 'Set Goal'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 px-2 text-amber-600 border-amber-200 hover:bg-amber-100"
                      onClick={handleQadaClick}
                      title="Make up a missed prayer (Qada)"
                    >
                      <Clock className="h-4 w-4 mr-1" /> Qada
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Insight Card */}
          <Card className="bg-card border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowInsightsModal(true)}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-chart-4/20 flex items-center justify-center">
                   <Sparkles className="h-4 w-4 text-chart-4" />
                 </div>
                <div>
                  <h3 className="font-medium text-foreground">Smart Insight</h3>
                  <p className="text-sm text-muted-foreground">Personalized for you</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-chart-5/10 rounded-lg">
                 <div className="w-6 h-6 rounded-full bg-chart-5/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                   <TrendingUp className="h-3 w-3 text-chart-5" />
                 </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    {insights && insights.length > 0 ? insights[0].title : "You're 5 days away from your first milestone!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {insights && insights.length > 0 ? insights[0].description : "Keep going to unlock the Bronze Badge."}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center mt-4 gap-1">
                <div className="w-2 h-2 rounded-full bg-chart-1"></div>
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <div className="w-2 h-2 rounded-full bg-muted"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Prayer Reflection Modal */}
      {showReflectionModal && selectedPrayer && (
        <PrayerReflectionModal
          open={showReflectionModal}
          onOpenChange={(open) => {
            setShowReflectionModal(open);
            if (!open) setSelectedPrayer(null);
          }}
          onComplete={handlePrayerCompletion}
          prayerName={selectedPrayer.name}
        />
      )}

      {/* Insights Modal */}
      {showInsightsModal && (
        <InsightsModal
          open={showInsightsModal}
          onOpenChange={setShowInsightsModal}
          insights={insights.map(insight => ({
            title: insight.title,
            description: insight.description,
            icon: insight.icon === 'LineChart' ? <TrendingUp className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />,
            color: insight.priority === 'high' ? 'border-red-500' : 'border-primary'
          }))}
          onViewAllInsights={handleViewAllInsights}
        />
      )}

      {/* Streak Milestone Modal */}
      {showStreakMilestoneModal && (
        <StreakMilestoneModal
          open={showStreakMilestoneModal}
          onOpenChange={setShowStreakMilestoneModal}
          streak={userStats?.current_streak || 0}
          onContinue={() => {
            setShowStreakMilestoneModal(false);
            // Could add additional celebration logic here
          }}
        />
      )}

      {/* Qada Recovery Modal */}
      {showQadaRecoveryModal && ((manualQadaMode && selectedManualQadaPrayer) || (!manualQadaMode && missedPrayerToRecover)) && (
        <QadaRecoveryModal
          open={showQadaRecoveryModal}
          onOpenChange={(open) => {
            setShowQadaRecoveryModal(open);
            if (!open) {
              setManualQadaMode(false);
              setSelectedManualQadaPrayer(null);
            }
          }}
          prayer={{
            id: manualQadaMode ? selectedManualQadaPrayer!.name : missedPrayerToRecover!.name,
            name: manualQadaMode ? selectedManualQadaPrayer!.name : missedPrayerToRecover!.name,
            time: manualQadaMode ? selectedManualQadaPrayer!.time : missedPrayerToRecover!.time,
            expiresAt: new Date((typeof (manualQadaMode ? selectedManualQadaPrayer!.time : missedPrayerToRecover!.time) === 'string' 
              ? new Date(manualQadaMode ? selectedManualQadaPrayer!.time : missedPrayerToRecover!.time).getTime() 
              : (manualQadaMode ? selectedManualQadaPrayer!.time : missedPrayerToRecover!.time).getTime()) + 24 * 60 * 60 * 1000)
          }}
          onRecover={handlePrayerRecovery}
          onSetReminder={handleSetQadaReminder}
        />
      )}

      {/* Streak Protection Modal */}
      {showStreakProtectionModal && (
        <StreakFreezeModal
          open={showStreakProtectionModal}
          onOpenChange={setShowStreakProtectionModal}
          currentStreak={userStats?.current_streak || 0}
          freezesRemaining={getStreakFreezesRemaining()}
          prayer={{
            name: nextPrayer?.name || 'Next Prayer',
            time: nextPrayer?.time || new Date()
          }}
          onUseFreeze={handleUseStreakFreeze}
          onNavigateToSettings={() => {
            setShowStreakProtectionModal(false);
            // Navigate to settings page where streak shields can be managed
            window.location.href = '/settings';
          }}
        />
      )}

      {/* Goal Setting Modal */}
      {showGoalSettingModal && (
        <GoalSettingModal
          open={showGoalSettingModal}
          onOpenChange={setShowGoalSettingModal}
          onSetGoal={handleSetGoal}
          currentStreak={userStats?.current_streak || 0}
          onDismiss={() => setShowGoalSettingModal(false)}
          existingGoals={goals.map(goal => ({
            id: goal.id,
            title: goal.title,
            goal_type: goal.goal_type,
            target_value: goal.target_value,
            current_value: goal.current_value,
            completed: goal.completed
          }))}
        />
      )}

      {/* Streak Freeze Modal */}
      {showStreakFreezeModal && nextPrayer && (
        <StreakFreezeModal
          open={showStreakFreezeModal}
          onOpenChange={setShowStreakFreezeModal}
          currentStreak={userStats?.current_streak || 0}
          freezesRemaining={getStreakFreezesRemaining()}
          prayer={{
            name: nextPrayer.name,
            time: nextPrayer.time
          }}
          onUseFreeze={handleUseStreakFreeze}
          onNavigateToSettings={() => {
            setShowStreakFreezeModal(false);
            // Navigate to settings page where streak shields can be managed
          }}
        />
      )}

      {/* Prayer Reminder Modal */}
      {showReminderModal && nextPrayer && (
        <PrayerReminderModal
          open={showReminderModal}
          onOpenChange={setShowReminderModal}
          prayer={{
            name: nextPrayer.name,
            time: nextPrayer.time,
            timeRemaining: nextPrayer.timeRemaining || 'Loading...'
          }}
          onSetReminder={handleSetReminderWithOptions}
        />
      )}

      {/* Manual Qada Mode Modal */}
      {manualQadaMode && showQadaRecoveryModal && !selectedManualQadaPrayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="font-medium mb-4 text-foreground">Select a missed prayer to make up</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {safePrayers.length > 0 ? (
                safePrayers.map((prayer) => (
                  <Button
                    key={prayer.name + (typeof prayer.time === 'string' ? prayer.time : prayer.time.toISOString())}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => handleManualQadaPrayerSelect(prayer)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{prayer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(prayer.time, { hour12: true })}
                      </span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No prayers available to make up
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              className="mt-4 w-full" 
              onClick={() => { 
                setManualQadaMode(false); 
                setShowQadaRecoveryModal(false); 
                setSelectedManualQadaPrayer(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Streak Protection Modal */}
      {showStreakProtectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="font-medium mb-4 text-foreground">Streak Protection</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to activate streak protection?
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="text-chart-1 hover:bg-chart-1/10"
                onClick={() => setShowStreakProtectionModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-chart-1 text-primary-foreground hover:bg-chart-1/90"
                onClick={handleUseStreakFreeze}
              >
                Activate
              </Button>
            </div>
          </div>
        </div>
      )}

      <PhantomBottomNav />
    </div>
  );
}
