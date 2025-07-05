'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ds, SPACING, TYPOGRAPHY, SIZING, COLORS } from '@/lib/design-system';
import { 
  Sun, Moon, Sunset, Clock, CheckCircle, Bell, MapPin, X, RefreshCw, Target, Flame, Users, TrendingUp, Calendar
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

  // Mock community data - stable values to prevent glitching
  const mockCommunityData = {
    totalMembers: 1247,
    currentlyPraying: 34, // Fixed stable number
    userPercentile: 78 // User is in top 78%
  };

  // Calculate today's progress
  const todaysPrayerCount = todaysProgress?.completed || 0;
  const totalPrayersToday = 5;
  const progressPercentage = (todaysPrayerCount / totalPrayersToday) * 100;

  return (
    <div className="bg-background min-h-screen">
      {/* Header with proper safe area */}
      <header className="bg-gradient-to-b from-primary/5 to-transparent pt-safe-top pb-4 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  {(() => {
                    const hour = new Date().getHours();
                    if (hour >= 5 && hour < 12) return <Sun className="h-4 w-4 text-primary" />;
                    if (hour >= 12 && hour < 18) return <Sun className="h-4 w-4 text-primary" />;
                    if (hour >= 18 && hour < 20) return <Sunset className="h-4 w-4 text-primary" />;
                    return <Moon className="h-4 w-4 text-primary" />;
                  })()}
                </div>
                <h1 className="text-lg font-semibold text-foreground">
                  {getTimeBasedGreeting().greeting}, {getDisplayName(session?.user)}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="touch-target">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with proper bottom padding */}
      <main className="px-4 pb-4">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Next Prayer Card - Compact but prominent */}
          <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Next Prayer</p>
                  <h2 className="text-2xl font-bold text-foreground capitalize">
                    {nextAction.name}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xl font-bold text-foreground">
                      {formatTime(nextAction.time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                    {nextAction.timeRemaining}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleMarkComplete}
                  disabled={isMarkingComplete}
                  className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isMarkingComplete ? 'Marking...' : 'Complete'}
                </Button>
                <Button
                  onClick={handleRemindMe}
                  disabled={isSettingReminder}
                  variant="outline"
                  className="h-10 border-2 border-border hover:bg-muted/50 font-medium rounded-lg"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {isSettingReminder ? 'Setting...' : 'Remind'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Progress & Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Today's Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Today</h3>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {todaysPrayerCount}<span className="text-sm text-muted-foreground">/5</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {progressPercentage.toFixed(0)}% Complete
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Streak */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-semibold">Streak</h3>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {userStats?.current_streak || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userStats?.current_streak === 1 ? 'Day' : 'Days'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prayer Times Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Today's Prayers</h3>
              </div>
              <div className="space-y-2">
                {prayers.slice(0, 5).map((prayer, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        prayer.status === 'completed' ? 'bg-green-500' : 
                        prayer.status === 'current' ? 'bg-orange-500 animate-pulse' : 
                        'bg-muted-foreground/30'
                      )} />
                      <span className="text-sm font-medium capitalize">{prayer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatTime(prayer.time)}
                      </span>
                      {prayer.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community & Insights */}
          <div className="grid grid-cols-2 gap-4">
            {/* Community Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">Community</h3>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground mb-1">
                    {mockCommunityData.currentlyPraying}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Praying now
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-semibold">This Week</h3>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground mb-1">
                    {Math.round(((userStats?.current_streak || 0) / 7) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Consistency
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Smart Insight - Actually useful */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm">💡</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {userStats?.current_streak === 0 ? 'Start your journey today' :
                     userStats?.current_streak && userStats.current_streak < 7 ? 
                     `${7 - userStats.current_streak} days to your first milestone` :
                     'Great consistency! Keep it up'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userStats?.current_streak === 0 ? 'Complete your first prayer to begin building your streak' :
                     userStats?.current_streak && userStats.current_streak < 7 ? 
                     'Stay consistent to unlock your first achievement' :
                     'You\'re building excellent prayer habits'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Bottom Navigation with proper spacing */}
      <PhantomBottomNav />

      {/* Prayer Reflection Modal */}
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
    </div>
  );
}

