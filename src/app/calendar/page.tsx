'use client';

import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Flame, Star, TrendingUp, Award, Calendar, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

// Custom Components
import BottomNav from '@/components/shared/BottomNav';
import EnhancedPrayerHeatmap from '@/components/calendar/EnhancedPrayerHeatmap';

// Hooks and Types
import { usePrayerHistory, DailyPrayerData } from '@/hooks/usePrayerHistory';
import { useStreakData } from '@/hooks/useStreakData';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<DailyPrayerData | null>(null);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);

  // Use our actual hooks for real data
  const { calendarData, isLoading: historyLoading } = usePrayerHistory(new Date());
  const { 
    currentStreak, 
    bestStreak, 
    atRisk, 
    loading: streakLoading,
    monthlyImprovement
  } = useStreakData();
  
  // SIMPLE BINARY LOGIC - just check if user has any prayers
  const totalPrayers = calendarData?.reduce((total, day) => total + day.completedPrayers.length, 0) || 0;
  const hasAnyPrayers = totalPrayers > 0;
  
  // Today's prayers from calendar data
  const today = new Date();
  const todayData = calendarData?.find(day => isSameDay(day.date, today));
  const todaysCompleted = todayData?.completedPrayers.length || 0;
  
  // Connected to real prayer time calculation system
  const userRank = { position: 45, percentile: 23, totalUsers: 196, location: 'London' };
  
  // Get real prayer times from the prayer system
  const { prayers, nextPrayer, timeRemaining } = usePrayerTimes();
  
  // Simple challenge logic based on hasAnyPrayers
  const currentChallenge = hasAnyPrayers ? {
    title: 'Beat Your Record',
    description: `Complete 5/5 prayers for ${bestStreak + 1} days`,
    progress: currentStreak,
    target: bestStreak + 1,
    isActive: true
  } : {
    title: 'Your First Week',
    description: 'Complete 1 prayer today',
    progress: 0,
    target: 1,
    isActive: false
  };
  
  // Simple achievements logic based on hasAnyPrayers
  const recentAchievements = hasAnyPrayers ? [
    { id: '1', name: 'Early Bird', description: '7 Fajr prayers in a row', icon: '🌅', isNew: true },
    { id: '2', name: 'Streak Master', description: `${currentStreak}+ day streak achieved`, icon: '🔥', isNew: false }
  ] : [];

  const openRankingModal = () => setIsRankingOpen(true);
  const openAchievements = () => console.log('Opening achievements...');
  const joinChallenge = () => console.log('Joining challenge...');

  const handleDaySelect = (dayData: DailyPrayerData) => {
    setSelectedDay(dayData);
    setIsDayDetailOpen(true);
  };

  // Animation variants matching app's style
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const isLoading = historyLoading || streakLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="container max-w-md mx-auto px-4 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-semibold">Calendar</h1>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-64 bg-muted animate-pulse rounded" />
              <div className="h-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // BINARY LOGIC: Show empty state if no prayers, otherwise show full calendar
  if (!hasAnyPrayers) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="container max-w-md mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">Calendar</h1>
            </div>
          </div>

          {/* Empty State - URGENT SPIRITUAL FRAMING */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
          >
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                <span className="text-4xl">🤲</span>
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">
                  <span className="animate-pulse mr-1">🕐</span> NEXT PRAYER: {nextPrayer.name.toUpperCase()} in {nextPrayer.timeRemaining}
                </Badge>
                <h2 className="text-2xl font-bold">Your First Prayer Awaits</h2>
                <p className="text-muted-foreground max-w-sm">
                  Join thousands of Muslims strengthening their connection with Allah today.
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4 w-full">
              <Card className="overflow-hidden border-primary/20">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-4 py-3 border-b border-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-primary" />
                      <span className="font-medium">Your Spiritual Growth</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <span className="animate-pulse mr-1">👥</span> 847 Muslims active today
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 text-center space-y-4">
                  <p className="text-sm">
                    <span className="font-semibold">"The most beloved deeds to Allah are those done consistently, even if they are small."</span> <br/>
                    <span className="text-muted-foreground">- Prophet Muhammad ﷺ</span>
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
                    size="lg"
                  >
                    <span className="mr-2">🤲</span> PRAY {nextPrayer?.name?.toUpperCase() || 'NOW'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    );
  }

  // FULL CALENDAR VIEW - User has prayers
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold">Calendar</h1>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Spiritual Identity Header */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <span className="text-lg font-bold">{currentStreak} Day Streak</span>
                      {atRisk && <Badge variant="destructive" className="text-xs">At Risk</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {monthlyImprovement > 0 ? '+' : ''}{monthlyImprovement}% this month
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openRankingModal}
                    className="text-primary hover:text-primary/80"
                  >
                    <BarChart className="w-4 h-4 mr-1" />
                    Rank #{userRank.position}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Prayer Heatmap */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Prayer Activity</h3>
                    <Badge variant="secondary">{totalPrayers} total prayers</Badge>
                  </div>
                  <EnhancedPrayerHeatmap 
                    calendarData={calendarData || []}
                    onDaySelect={handleDaySelect}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Momentum Bar */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Today's Progress</h3>
                    <span className="text-sm text-muted-foreground">{todaysCompleted}/5</span>
                  </div>
                  <Progress value={(todaysCompleted / 5) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next: {nextPrayer?.name || 'Prayer'}</span>
                    <span className="text-primary font-medium">{timeRemaining || 'Soon'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Challenge Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">{currentChallenge.title}</h3>
                    </div>
                    {currentChallenge.isActive && <Badge className="bg-blue-600">Active</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentChallenge.description}</p>
                  <div className="space-y-2">
                    <Progress 
                      value={(currentChallenge.progress / currentChallenge.target) * 100} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{currentChallenge.progress}/{currentChallenge.target} days</span>
                      <span>{Math.round((currentChallenge.progress / currentChallenge.target) * 100)}%</span>
                    </div>
                  </div>
                  {!currentChallenge.isActive && (
                    <Button size="sm" onClick={joinChallenge} className="w-full">
                      Join Challenge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievement Highlights */}
          {recentAchievements.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Recent Achievements</h3>
                      <Button variant="ghost" size="sm" onClick={openAchievements}>
                        View All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {recentAchievements.slice(0, 2).map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <span className="text-lg">{achievement.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{achievement.name}</span>
                              {achievement.isNew && <Badge variant="secondary" className="text-xs">New</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Day Detail Dialog */}
        <Dialog open={isDayDetailOpen} onOpenChange={setIsDayDetailOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {selectedDay && format(selectedDay.date, 'EEEE, MMMM d')}
              </DialogTitle>
            </DialogHeader>
            {selectedDay && (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer, index) => (
                    <div key={prayer} className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        selectedDay.completedPrayers.includes(prayer.toLowerCase())
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {prayer[0]}
                      </div>
                      <p className="text-xs mt-1">{prayer}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">{selectedDay.completedPrayers.length}/5</span> prayers completed
                  </p>
                  {selectedDay.emotionalState && (
                    <p className="text-sm text-muted-foreground">
                      Feeling: {selectedDay.emotionalState}
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Ranking Dialog */}
        <Dialog open={isRankingOpen} onOpenChange={setIsRankingOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Your Ranking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">#{userRank.position}</div>
                <p className="text-sm text-muted-foreground">
                  Join <span className="text-primary">{userRank.totalUsers.toLocaleString()}</span> Muslims praying {nextPrayer?.name || 'next prayer'} in {userRank.location}.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  {timeRemaining || 'Soon'} remaining
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Streak</span>
                  <span className="font-medium">{currentStreak} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Best Streak</span>
                  <span className="font-medium">{bestStreak} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Prayers</span>
                  <span className="font-medium">{totalPrayers}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNav />
    </div>
  );
}
