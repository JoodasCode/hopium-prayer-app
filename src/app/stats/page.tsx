'use client';

import { useState, useEffect } from 'react';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, TrendingUp, Award, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsPage() {
  // State for streak data (would come from API/Supabase in production)
  const [streak, setStreak] = useState({ current: 14, best: 21, weekChange: 15 });
  const [todayProgress, setTodayProgress] = useState(3); // Out of 5 prayers
  const [animateStreak, setAnimateStreak] = useState(false);
  const [prayerStats, setPrayerStats] = useState([
    { name: 'Fajr', completion: 65, status: 'challenge' },
    { name: 'Dhuhr', completion: 90, status: 'consistent' },
    { name: 'Asr', completion: 82, status: 'consistent' },
    { name: 'Maghrib', completion: 95, status: 'consistent' },
    { name: 'Isha', completion: 78, status: 'improving' },
  ]);
  
  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', completedCount: 4, totalCount: 5 },
    { day: 'Tue', completedCount: 5, totalCount: 5 },
    { day: 'Wed', completedCount: 3, totalCount: 5 },
    { day: 'Thu', completedCount: 5, totalCount: 5 }, // Today
    { day: 'Fri', completedCount: 0, totalCount: 5 },
    { day: 'Sat', completedCount: 0, totalCount: 5 },
    { day: 'Sun', completedCount: 0, totalCount: 5 },
  ]);
  
  const [nextMilestone, setNextMilestone] = useState({
    name: '30-Day Perfect Streak',
    daysLeft: 16,
    progress: 14/30 * 100, // 47%
    reward: 'Diamond Badge'
  });
  
  // Trigger streak animation periodically for demo purposes
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimateStreak(true);
      setTimeout(() => setAnimateStreak(false), 2000);
    }, 10000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Get challenge area (lowest completion prayer)
  const challengePrayer = prayerStats.reduce((prev, current) => 
    (prev.completion < current.completion) ? prev : current
  );
  
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
                <span className="text-6xl font-bold text-primary">{streak.current}</span>
              </div>
              
              <p className="font-medium mb-1">You're on fire! Keep it up!</p>
              
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-green-500">+{streak.weekChange}% from last week</span>
              </div>
              
              <div className="mt-4 w-full flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Today</p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="font-semibold">{todayProgress}</p>
                    <p className="text-muted-foreground">/5</p>
                  </div>
                </div>
                
                <div className="h-12 w-px bg-border"></div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Best Streak</p>
                  <p className="font-semibold">{streak.best} days</p>
                </div>
                
                <div className="h-12 w-px bg-border"></div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">This Month</p>
                  <p className="font-semibold">21 perfect days</p>
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
              {weeklyData.map((day, index) => {
                const isToday = index === 3; // Thursday is today in our mock data
                const isPast = index < 3;
                const isFuture = index > 3;
                
                // Calculate completion status
                let bgColor = 'bg-secondary/40';
                if (isPast) {
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
          
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              {prayerStats.map((prayer) => (
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
            
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Fajr is your challenge prayer</p>
                  <p className="text-xs text-muted-foreground">Try setting an alarm 10 minutes earlier to give yourself more time.</p>
                  
                  <Button size="sm" variant="outline" className="mt-2 h-8 text-xs rounded-lg border-primary/20">
                    Adjust Fajr Settings
                  </Button>
                </div>
              </div>
            </div>
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
                  <p className="font-medium">{nextMilestone.name}</p>
                  <p className="text-xs text-muted-foreground">Reward: {nextMilestone.reward}</p>
                </div>
              </div>
              
              <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10">
                {nextMilestone.daysLeft} days left
              </Badge>
            </div>
            
            <div className="space-y-1">
              <Progress value={nextMilestone.progress} className="h-2" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{Math.round(nextMilestone.progress)}% complete</span>
                <span className="text-xs font-medium">{nextMilestone.daysLeft} days to go</span>
              </div>
            </div>
            
            <Button className="w-full mt-4 rounded-lg bg-primary hover:bg-primary/90">
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
              <Button variant="ghost" size="sm" className="h-8 gap-1">
                <Calendar className="h-4 w-4" />
                <span>July 2025</span>
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
            
            {/* Calendar grid with dots */}
            <div className="grid grid-cols-7 gap-1">
              {/* First week with some empty spaces */}
              <div className="aspect-square"></div>
              {[...Array(6)].map((_, i) => (
                <div key={`week0-${i}`} className="aspect-square rounded-full border border-primary flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </div>
              ))}
              
              {/* Second week */}
              {[...Array(7)].map((_, i) => (
                <div key={`week1-${i}`} className={cn(
                  "aspect-square rounded-full flex items-center justify-center",
                  i < 5 ? "border border-primary" : "border border-muted"
                )}>
                  <div className={i < 5 ? "h-2 w-2 rounded-full bg-primary" : ""} />
                </div>
              ))}
              
              {/* Third week - with current day */}
              {[...Array(7)].map((_, i) => (
                <div key={`week2-${i}`} className={cn(
                  "aspect-square flex items-center justify-center",
                  i === 3 ? "bg-primary text-primary-foreground rounded-full" : 
                  i < 3 ? "border border-primary rounded-full" : "border border-muted rounded-full"
                )}>
                  {i === 3 ? (
                    <span className="text-xs font-medium">3</span>
                  ) : (
                    <div className={i < 3 ? "h-2 w-2 rounded-full bg-primary" : ""} />
                  )}
                </div>
              ))}
              
              {/* Fourth week */}
              {[...Array(7)].map((_, i) => (
                <div key={`week3-${i}`} className="aspect-square rounded-full border border-muted flex items-center justify-center">
                  <div className="" />
                </div>
              ))}
              
              {/* Fifth week (partial) */}
              {[...Array(5)].map((_, i) => (
                <div key={`week4-${i}`} className="aspect-square rounded-full border border-muted flex items-center justify-center">
                  <div className="" />
                </div>
              ))}
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
    </div>
  );
}
