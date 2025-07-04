'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ds, SPACING, TYPOGRAPHY, SIZING, COLORS } from '@/lib/design-system';
import { 
  Sun, Moon, Sunset, Clock, CheckCircle, Bell, MapPin, X, RefreshCw, Target, Flame
} from 'lucide-react';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const PrayerReflectionModal = lazy(() => import('@/components/modals/PrayerReflectionModal').then(module => ({ default: module.PrayerReflectionModal })));

import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { usePrayerWithRecords } from '@/hooks/usePrayerWithRecords';
import { useNotifications } from '@/hooks/useNotifications';
import { getTimeBasedGreeting, getDisplayName } from '@/lib/greetings';
import type { Prayer } from '@/types';

export default function DashboardPage() {
  // Modal states
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showLocationBanner, setShowLocationBanner] = useState(true);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  
  // UI interaction states
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  
  // Get current user session
  const { session } = useAuth();
  const userId = session?.user?.id;
  
  // Get real prayer times integrated with database records
  const { 
    prayers, 
    nextPrayer, 
    location: userLocation, 
    isLoading: prayerTimesLoading, 
    error: prayerTimesError,
    todaysProgress,
    completePrayerWithReflection
  } = usePrayerWithRecords({ userId });
  
  // Fetch user stats including streak data
  const { userStats, isLoading: statsLoading } = useUserStats(userId);
  
  // Fetch user notifications and reminders
  const { setReminder } = useNotifications(userId);

  // Get next prayer info from real data or fallback
  const getNextPrayerInfo = () => {
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
  };

  const nextAction = getNextPrayerInfo();
  
  // Helper function to format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  // Get prayer icon based on prayer name
  const getPrayerIcon = (prayerName: string) => {
    const hour = new Date().getHours();
    if (prayerName.toLowerCase().includes('fajr')) return '🌅';
    if (prayerName.toLowerCase().includes('dhuhr')) return '☀️';
    if (prayerName.toLowerCase().includes('asr')) return '🌤️';
    if (prayerName.toLowerCase().includes('maghrib')) return '🌅';
    if (prayerName.toLowerCase().includes('isha')) return '🌙';
    
    // Default based on time
    if (hour >= 5 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 15) return '☀️';
    if (hour >= 15 && hour < 18) return '🌤️';
    if (hour >= 18 && hour < 20) return '🌅';
    return '🌙';
  };
  
  // Handle prayer completion with reflection data
  const handlePrayerCompletion = async (reflectionData: {
    emotion: string;
    location: string;
    quality: number;
    reflection?: string;
  }) => {
    if (!selectedPrayer) return;
    
    try {
      await completePrayerWithReflection({
        prayerType: selectedPrayer.name.toLowerCase(),
        scheduledTime: selectedPrayer.time.toISOString(),
        completedTime: new Date().toISOString(),
        emotion: reflectionData.emotion,
        location: reflectionData.location,
        quality: reflectionData.quality,
        reflection: reflectionData.reflection
      });
      
      setShowReflectionModal(false);
      setSelectedPrayer(null);
    } catch (error) {
      console.error('Failed to complete prayer:', error);
    }
  };

  // Handle mark prayer complete
  const handleMarkComplete = async () => {
    if (nextPrayer) {
      setIsMarkingComplete(true);
      // Add slight delay for visual feedback
      setTimeout(() => {
        setSelectedPrayer(nextPrayer);
        setShowReflectionModal(true);
        setIsMarkingComplete(false);
      }, 300);
    }
  };

  // Handle remind me
  const handleRemindMe = async () => {
    if (nextPrayer && userId) {
      setIsSettingReminder(true);
      try {
        const success = await setReminder(nextPrayer.name.toLowerCase(), 15); // 15 minutes before
        if (success) {
          // Visual feedback for success
          setTimeout(() => setIsSettingReminder(false), 500);
        }
      } catch (error) {
        console.error('Failed to set reminder:', error);
        setIsSettingReminder(false);
      }
    }
  };

  // Cycle through insights every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentInsightIndex(prev => (prev + 1) % 5); // Cycle through 5 different insights
    }, 8000);
    
    return () => clearInterval(timer);
  }, []);

  // Mock community data for now
  const mockCommunityData = {
    totalMembers: 1247,
    currentlyPraying: Math.floor(Math.random() * 50) + 20, // 20-70 people
    userPercentile: 78 // User is in top 78%
  };

  // Calculate today's progress
  const todaysPrayerCount = todaysProgress?.completed || 0;
  const totalPrayersToday = 5;
  const progressPercentage = (todaysPrayerCount / totalPrayersToday) * 100;

  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Contextual Header */}
      <header className="w-full bg-background pt-safe-top">
        <div className="bg-gradient-to-b from-primary/5 to-transparent py-4 px-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  {(() => {
                    const { icon } = getTimeBasedGreeting();
                    switch (icon) {
                      case 'sun':
                        return <Sun className="h-4 w-4 text-primary" />;
                      case 'sunset':
                        return <Sunset className="h-4 w-4 text-primary" />;
                      case 'moon':
                        return <Moon className="h-4 w-4 text-primary" />;
                      default:
                        return <Sun className="h-4 w-4 text-primary" />;
                    }
                  })()}
                </div>
                <h1 className="text-base font-semibold">
                  {getTimeBasedGreeting().greeting}, {getDisplayName(session?.user)}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-10">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* Location Banner - Only show if no location and not dismissed */}
        {(!userLocation || prayerTimesError) && showLocationBanner && (
          <div className="bg-primary/10 rounded-xl p-3 mt-3 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                {prayerTimesError ? 'Location access needed for accurate prayer times' : 'Loading location...'}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 ml-1"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full"
              onClick={() => setShowLocationBanner(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* HERO SECTION - Next Prayer (70% of screen focus) */}
        <Card className={cn(COLORS.card.primary, "overflow-hidden bg-gradient-to-b from-primary/5 to-transparent mt-2")}>
          <CardContent className={SPACING.card.comfortable}>
            <div className="text-center">
              {/* Prayer Name */}
              <div className={SPACING.margin.sm}>
                <span className={cn(TYPOGRAPHY.body.small, TYPOGRAPHY.muted.default, "font-medium")}>Next Prayer</span>
              </div>
              
              {/* Prayer Icon & Name */}
              <div className={cn("flex items-center justify-center", SPACING.gap.default, SPACING.margin.lg)}>
                <span className="text-4xl">{getPrayerIcon(nextAction.name)}</span>
                <h2 className={cn("text-5xl font-bold", COLORS.text.primary)}>{nextAction.name}</h2>
              </div>
              
              {/* Prayer Time */}
              <div className={cn("flex items-center justify-center", SPACING.gap.sm, SPACING.margin.sm)}>
                <Clock className={cn(SIZING.icon.default, TYPOGRAPHY.muted.default)} />
                <span className={TYPOGRAPHY.stats.large}>
                  {nextAction.time ? formatTime(nextAction.time) : 'Loading...'}
                </span>
              </div>
              
              {/* Time Remaining */}
              <div className="mb-8">
                <span className={cn(TYPOGRAPHY.stats.medium, TYPOGRAPHY.muted.default)}>
                  {nextAction.timeRemaining}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className={cn("grid grid-cols-2", SPACING.gap.lg)}>
                <Button 
                  onClick={handleMarkComplete}
                  size="lg"
                  className={cn(
                    SIZING.button.lg, "shadow-lg transition-all duration-200",
                    isMarkingComplete && "scale-95 bg-primary/80"
                  )}
                  disabled={prayerTimesLoading || isMarkingComplete}
                >
                  <CheckCircle className={cn(
                    "mr-2", SIZING.icon.sm, "transition-all duration-200",
                    isMarkingComplete && "animate-pulse"
                  )} />
                  <span className={TYPOGRAPHY.body.default}>
                    {isMarkingComplete ? "Marking..." : "Mark Complete"}
                  </span>
                </Button>
                
                <Button 
                  onClick={handleRemindMe}
                  variant="outline"
                  size="lg"
                  className={cn(
                    SIZING.button.lg, "border-primary/20 hover:bg-primary/5 transition-all duration-200",
                    isSettingReminder && "scale-95 bg-primary/10 border-primary/40"
                  )}
                  disabled={prayerTimesLoading || isSettingReminder}
                >
                  <Bell className={cn(
                    "mr-2", SIZING.icon.sm, "transition-all duration-200",
                    isSettingReminder && "animate-pulse"
                  )} />
                  <span className={TYPOGRAPHY.body.default}>
                    {isSettingReminder ? "Setting..." : "Remind Me"}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

                {/* MINI PROGRESS SECTION - Today's Progress */}
        <Card className={COLORS.card.default}>
          <CardContent className={SPACING.card.default}>
            <div className={cn("flex items-center justify-between", SPACING.margin.lg)}>
              <div className={cn("flex items-center", SPACING.gap.default)}>
                <div className={ds.iconContainer('default', 'primary')}>
                  <Target className={cn(SIZING.icon.sm, COLORS.text.primary)} />
                </div>
                <div>
                  <p className={cn(TYPOGRAPHY.header.card, "leading-none")}>Today's Progress</p>
                  <p className={cn(TYPOGRAPHY.muted.small, "mt-1")}>
                    {todaysPrayerCount} of {totalPrayersToday} completed
                  </p>
                </div>
              </div>
              <div className={cn("flex items-center", SPACING.gap.sm)}>
                <div className="text-right">
                  <p className={cn(TYPOGRAPHY.stats.medium, "leading-none")}>
                    {userStats?.current_streak || 0}
                  </p>
                  <p className={TYPOGRAPHY.muted.small}>day streak</p>
                </div>
                {(userStats?.current_streak || 0) > 0 && (
                  <Flame className={cn(SIZING.icon.sm, COLORS.text.primary)} />
                )}
              </div>
            </div>
            
            <Progress value={progressPercentage} className={cn(SIZING.progress.default, SPACING.margin.lg)} />
            
            <div className="text-center">
              <p className={TYPOGRAPHY.muted.caption}>
                {mockCommunityData.currentlyPraying} community members praying now
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SMART INSIGHTS SECTION - Personalized Tips */}
        <Card className={COLORS.card.secondary}>
          <CardContent className={SPACING.card.default}>
            <div className={cn("flex items-center justify-between", SPACING.margin.lg)}>
              <div className={cn("flex items-center", SPACING.gap.default)}>
                <div className={ds.iconContainer('default', 'secondary')}>
                  <span className={TYPOGRAPHY.body.default}>✨</span>
                </div>
                <div>
                  <p className={cn(TYPOGRAPHY.header.card, "leading-none")}>Smart Insight</p>
                  <p className={cn(TYPOGRAPHY.muted.small, "mt-1")}>Personalized for you</p>
                </div>
              </div>
            </div>
            
            {/* Dynamic cycling insights */}
            <div className="space-y-2">
              {(() => {
                const currentStreak = userStats?.current_streak || 0;
                const completionRate = userStats?.completion_rate || 0;
                const totalPrayers = userStats?.total_prayers_completed || 0;
                
                // Define insights array - mix of personalized and educational
                const insights = [
                  // Streak-based insights
                  currentStreak === 0 ? {
                    emoji: "💡",
                    title: "Start your streak today!",
                    description: "Completing just one prayer starts your journey to consistency."
                  } : currentStreak < 7 ? {
                    emoji: "🎯", 
                    title: `You're ${7 - currentStreak} days away from your first milestone!`,
                    description: "Keep going to unlock the Bronze Badge."
                  } : {
                    emoji: "🏆",
                    title: "Excellent consistency!",
                    description: `You're ${30 - currentStreak} days from the Gold Badge milestone.`
                  },
                  
                  // Educational insights for new users
                  {
                    emoji: "🌅",
                    title: "Fajr is the foundation",
                    description: "Starting your day with Fajr sets a positive tone for everything that follows."
                  },
                  
                  {
                    emoji: "📿",
                    title: "Quality over quantity",
                    description: "Focus on presence and mindfulness during your prayers for deeper spiritual connection."
                  },
                  
                  // Community insights
                  {
                    emoji: "🤝",
                    title: "You're part of something bigger",
                    description: `${mockCommunityData.currentlyPraying} community members are praying right now too.`
                  },
                  
                  // Practical tips
                  {
                    emoji: "⏰",
                    title: "Consistency is key",
                    description: "Set reminders 15 minutes before each prayer to build a lasting habit."
                  }
                ];
                
                const currentInsight = insights[currentInsightIndex % insights.length];
                
                return (
                  <div className="transition-all duration-500 ease-in-out" key={currentInsightIndex}>
                    <div className={cn("flex items-start", SPACING.gap.default)}>
                      <span className="text-lg mt-0.5">{currentInsight.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn(TYPOGRAPHY.header.card, COLORS.text.foreground, "leading-tight", SPACING.margin.xs)}>
                          {currentInsight.title}
                        </p>
                        <p className={TYPOGRAPHY.muted.caption}>
                          {currentInsight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Insight indicator dots */}
              <div className={cn("flex items-center justify-center gap-1.5", SPACING.margin.lg)}>
                {[...Array(5)].map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      index === currentInsightIndex % 5 ? "bg-chart-2" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prayer Reflection Modal */}
      {showReflectionModal && selectedPrayer && (
        <Suspense fallback={<div>Loading...</div>}>
                     <PrayerReflectionModal
             open={showReflectionModal}
             onOpenChange={(open) => {
               setShowReflectionModal(open);
               if (!open) setSelectedPrayer(null);
             }}
             onComplete={handlePrayerCompletion}
             prayerName={selectedPrayer.name}
           />
        </Suspense>
      )}

      <PhantomBottomNav />
    </div>
  );
}

