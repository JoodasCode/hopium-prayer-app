'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Sun, Moon, Sunset, Clock, CheckCircle, Bell, Target, Flame, Users, Sparkles, TrendingUp
} from 'lucide-react';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const PrayerReflectionModal = lazy(() => import('@/components/modals/PrayerReflectionModal').then(module => ({ default: module.PrayerReflectionModal })));

import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useUserStats';
import { usePrayerWithRecords } from '@/hooks/usePrayerWithRecords';
import { useNotifications } from '@/hooks/useNotifications';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { getTimeBasedGreeting, getDisplayName } from '@/lib/greetings';
import type { Prayer } from '@/types';

export default function DashboardPage() {
  // Modal states
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  
  // UI interaction states
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  
  // Get current user session
  const { session } = useAuth();
  const userId = session?.user?.id;
  
  // Get real prayer times integrated with database records
  const { 
    prayers, 
    nextPrayer, 
    todaysProgress,
    completePrayerWithReflection
  } = usePrayerWithRecords({ userId });
  
  // Fetch user stats including streak data
  const { userStats } = useUserStats(userId);
  
  // Fetch user notifications and reminders
  const { setReminder } = useNotifications(userId);
  const { communityStats } = useCommunityStats();

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-b from-chart-1/8 to-transparent pt-safe-top pb-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-1/15 flex items-center justify-center">
                {getPrayerIcon()}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {getTimeBasedGreeting().greeting}, {getDisplayName(session?.user)}
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
                <Button 
                  onClick={handleMarkComplete}
                  disabled={isMarkingComplete}
                  className="flex-1 h-12 bg-chart-1 hover:bg-chart-1/90 text-primary-foreground font-medium"
                >
                  {isMarkingComplete ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Marking...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </div>
                  )}
                </Button>
                
                <Button 
                  onClick={handleRemindMe}
                  disabled={isSettingReminder}
                  variant="outline"
                  className="flex-1 h-12 border-chart-1/30 text-chart-1 hover:bg-chart-1/10"
                >
                  {isSettingReminder ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-chart-1/30 border-t-chart-1 rounded-full animate-spin" />
                      Setting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Remind Me
                    </div>
                  )}
                </Button>
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
                  <div className="text-right">
                    <div className="text-2xl font-bold text-chart-2">
                      {userStats?.current_streak || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">day streak</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-chart-3/20 flex items-center justify-center">
                    <Flame className="h-4 w-4 text-chart-3" />
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
                <div className="text-center text-sm text-muted-foreground">
                  {communityStats?.users_praying_now || 26} community members praying now
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Insight Card */}
          <Card className="bg-card border-border shadow-sm">
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
              
                             <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                 <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                   <TrendingUp className="h-3 w-3 text-destructive" />
                 </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    You're 5 days away from your first milestone!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Keep going to unlock the Bronze Badge.
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

      <PhantomBottomNav />
    </div>
  );
}
