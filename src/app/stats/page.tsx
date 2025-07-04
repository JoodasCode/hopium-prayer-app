'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Flame, Calendar, TrendingUp, Award, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useStatsAnalytics } from '@/hooks/useStatsAnalytics';

export default function StatsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user?.id;
  
  // Fetch real analytics data from backend
  const { analytics, isLoading, error } = useStatsAnalytics(userId);
  
  // UI state
  const [animateStreak, setAnimateStreak] = useState(false);
  const [showAchievementsDialog, setShowAchievementsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "fajr" | "dhuhr" | "asr" | "maghrib" | "isha">("all");
  
  // Trigger streak animation periodically for demo purposes
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimateStreak(true);
      setTimeout(() => setAnimateStreak(false), 2000);
    }, 10000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Get challenge area (lowest completion prayer)
  const challengePrayer = (analytics?.prayerStats && analytics.prayerStats.length > 0) 
    ? analytics.prayerStats.reduce((prev, current) => 
        (prev.completion < current.completion) ? prev : current
      )
    : null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-background min-h-screen pb-24">
        <header className="w-full bg-background pt-safe-top">
          <div className="bg-gradient-to-b from-primary/5 to-transparent py-4 px-4">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-base font-semibold">Your Prayer Stats</h1>
                <p className="text-xs text-muted-foreground mt-1">Loading...</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-md mx-auto px-4 space-y-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-background min-h-screen pb-24">
        <header className="w-full bg-background pt-safe-top">
          <div className="bg-gradient-to-b from-primary/5 to-transparent py-4 px-4">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-base font-semibold">Your Prayer Stats</h1>
                <p className="text-xs text-red-500 mt-1">Error loading stats</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-md mx-auto px-4 mt-4">
          <Card className="border-red-200">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!analytics) return null;
  
  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Contextual Header - adapts to time of day */}
      <header className="w-full bg-background pt-safe-top">
        <div className="bg-gradient-to-b from-primary/5 to-transparent py-4 px-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold">Your Prayer Stats</h1>
              <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* Hero Section - Streak */}
        <Card className="border-primary/20 overflow-hidden bg-gradient-to-b from-primary/5 to-transparent mt-2">
          <CardContent className="pt-6 pb-4 px-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className={cn(
                  "rounded-full p-1 bg-primary/20",
                  animateStreak && "animate-pulse"
                )}>
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <span className="text-6xl font-bold text-primary">{analytics.streak.current}</span>
              </div>
              
              <p className="font-medium mb-1">
                {analytics.streak.current > 0 ? "You're on fire! Keep it up!" : "Start your prayer streak today!"}
              </p>
              
              {analytics.streak.weekChange !== 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className={cn(
                    "h-3 w-3",
                    analytics.streak.weekChange > 0 ? "text-green-500" : "text-red-500"
                  )} />
                  <span className={cn(
                    "text-xs font-medium",
                    analytics.streak.weekChange > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {analytics.streak.weekChange > 0 ? '+' : ''}{analytics.streak.weekChange}% from last week
                  </span>
                </div>
              )}
              
              <div className="mt-4 w-full flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Today</p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="font-semibold">{analytics.todayProgress}</p>
                    <p className="text-muted-foreground">/5</p>
                  </div>
                </div>
                
                <div className="h-12 w-px bg-border"></div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Best Streak</p>
                  <p className="font-semibold">{analytics.streak.best} days</p>
                </div>
                
                <div className="h-12 w-px bg-border"></div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">This Month</p>
                  <p className="font-semibold">{analytics.monthlyPerfectDays} perfect days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* This Week at a Glance */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Week at a Glance</CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center justify-between">
              {analytics.weeklyData.map((day, index) => {
                const isToday = index === analytics.weeklyData.length - 1; // Last day is today
                const isPast = new Date(day.date) < new Date();
                const isFuture = new Date(day.date) > new Date();
                
                // Calculate completion status
                let bgColor = 'bg-secondary/40';
                if (isPast || isToday) {
                  bgColor = day.completedCount === day.totalCount ? 'bg-primary' : 
                           day.completedCount > 0 ? 'bg-primary/50' : 'bg-secondary/40';
                }
                
                return (
                  <div key={day.day} className="flex flex-col items-center gap-1">
                    <p className="text-xs font-medium mb-1">{day.day}</p>
                    <div className={cn(
                      "h-14 w-10 rounded-full flex items-center justify-center",
                      isToday ? "bg-gradient-to-b from-primary/70 to-primary border-2 border-primary" : bgColor,
                      "transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    )}>
                      <span className={cn(
                        "font-semibold text-sm",
                        isToday || (isPast && day.completedCount === day.totalCount) ? "text-primary-foreground" : 
                        "text-foreground"
                      )}>
                        {isPast || isToday ? `${day.completedCount}/${day.totalCount}` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Prayer Consistency Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Prayer Consistency</CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0 pb-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid grid-cols-6 h-8 mb-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="fajr" className="text-xs">Fajr</TabsTrigger>
                <TabsTrigger value="dhuhr" className="text-xs">Dhuhr</TabsTrigger>
                <TabsTrigger value="asr" className="text-xs">Asr</TabsTrigger>
                <TabsTrigger value="maghrib" className="text-xs">Maghrib</TabsTrigger>
                <TabsTrigger value="isha" className="text-xs">Isha</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="flex flex-col gap-3">
                  {analytics.prayerStats.map((prayer) => (
                    <div key={prayer.name} className="flex items-center gap-3">
                      <div className="w-16 text-sm font-medium">{prayer.name}</div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Progress value={prayer.completion} className="h-2" />
                          <span className="text-xs font-medium">{prayer.completion}%</span>
                        </div>
                        
                        {prayer.status === 'challenge' && (
                          <p className="text-xs text-amber-500 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Your challenge area
                          </p>
                        )}
                        
                        {prayer.status === 'improving' && (
                          <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Improving this week
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Individual prayer tabs */}
              {analytics.prayerStats.map((prayer) => {
                const prayerName = prayer.name.toLowerCase();
                return (
                  <TabsContent key={prayerName} value={prayerName} className="mt-0">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-sm font-medium">{prayer.name}</div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Progress value={prayer.completion} className="h-2" />
                            <span className="text-xs font-medium">{prayer.completion}%</span>
                          </div>
                          
                          {prayer.status === 'challenge' && (
                            <p className="text-xs text-amber-500 font-medium flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Your challenge area
                            </p>
                          )}
                          
                          {prayer.status === 'improving' && (
                            <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" /> Improving this week
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Prayer-specific insights */}
                      <div className="p-3 bg-primary/5 rounded-lg mt-2">
                        <h4 className="text-sm font-medium mb-1">Tips for {prayer.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {prayer.status === 'challenge' 
                            ? `${prayer.name} seems to be challenging for you. Try setting a dedicated alarm and preparing the night before.` 
                            : prayer.status === 'improving' 
                              ? `Great job improving your ${prayer.name} prayer consistency! Keep up the momentum.` 
                              : `You're maintaining good consistency with ${prayer.name}. Consider helping others establish this habit.`}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
            
            {challengePrayer && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{challengePrayer.name} is your challenge prayer</p>
                    <p className="text-xs text-muted-foreground">Try setting an alarm 10 minutes earlier to give yourself more time.</p>
                    
                    <Button size="sm" variant="outline" className="mt-2 h-8 text-xs rounded-lg border-primary/20">
                      Adjust {challengePrayer.name} Settings
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Next Milestone Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Next Milestone</CardTitle>
            <CardDescription>Keep going to unlock rewards</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{analytics.nextMilestone.name}</p>
                  <p className="text-xs text-muted-foreground">Reward: {analytics.nextMilestone.reward}</p>
                </div>
              </div>
              
              <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10">
                {analytics.nextMilestone.daysLeft} days left
              </Badge>
            </div>
            
            <div className="space-y-1">
              <Progress value={analytics.nextMilestone.progress} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{Math.round(analytics.nextMilestone.progress)}% complete</span>
                <span className="text-xs font-medium">{analytics.nextMilestone.daysLeft} days to go</span>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4 rounded-lg bg-primary hover:bg-primary/90"
              onClick={() => setShowAchievementsDialog(true)}
            >
              View All Achievements
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
        
        {/* Monthly Overview - Simplified Calendar */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Monthly Overview</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 gap-1"
                onClick={() => router.push('/calendar')}
              >
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 pb-4">
            {/* Simple calendar placeholder */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                <div key={day} className="text-xs font-medium text-muted-foreground">{day}</div>
              ))}
            </div>
            
            {/* Calendar grid with real data */}
            <div className="grid grid-cols-7 gap-1">
              {analytics.monthlyData.map((dayData) => {
                const isToday = dayData.day === new Date().getDate();
                
                return (
                  <div 
                    key={dayData.day} 
                    className={cn(
                      "aspect-square flex items-center justify-center",
                      dayData.status === 'completed' ? "bg-primary text-primary-foreground rounded-full" :
                      dayData.status === 'partial' ? "border border-primary rounded-full" :
                      dayData.status === 'missed' ? "border border-muted rounded-full" :
                      "border border-muted rounded-full opacity-50",
                      isToday && "ring-2 ring-primary ring-offset-1"
                    )}
                  >
                    {dayData.status === 'completed' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : dayData.status === 'partial' ? (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    ) : dayData.status === 'future' ? (
                      <span className="text-xs text-muted-foreground">{dayData.day}</span>
                    ) : (
                      <div className="" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-primary"></div>
                <span className="text-xs">All prayers</span>
              </div>
              
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full border border-primary"></div>
                <span className="text-xs">Some prayers</span>
              </div>
              
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full border border-muted"></div>
                <span className="text-xs">No prayers</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Navigation */}
      <PhantomBottomNav />
      
      {/* Achievements Dialog */}
      <Dialog open={showAchievementsDialog} onOpenChange={setShowAchievementsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Achievements</DialogTitle>
            <DialogDescription>
              Track your prayer journey milestones and unlock special rewards.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Unlocked achievements */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Unlocked ({analytics.achievements.filter(a => a.unlocked).length})
              </h4>
              <div className="space-y-3">
                {analytics.achievements.filter(a => a.unlocked).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {achievement.icon === 'flame' && <Flame className="h-5 w-5 text-primary" />}
                      {achievement.icon === 'sun' && <CheckCircle className="h-5 w-5 text-primary" />}
                      {achievement.icon === 'award' && <Award className="h-5 w-5 text-primary" />}
                      {achievement.icon === 'trophy' && <Award className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Locked achievements */}
            {analytics.achievements.filter(a => !a.unlocked).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Coming Soon</h4>
                <div className="space-y-3">
                  {analytics.achievements.filter(a => !a.unlocked).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="bg-muted p-2 rounded-full">
                        <Award className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowAchievementsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
