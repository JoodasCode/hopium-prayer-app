'use client';

import { useState, memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Star, Award, Flame, Calendar, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type StreakOverviewProps = {
  currentStreak: number;
  bestStreak: number;
  recentDays?: boolean[];
  streakShields?: number;
  streakAtRisk?: boolean;
  nextMilestone?: number;
  percentToMilestone?: number;
  isLoading?: boolean;
};

const StreakOverview = memo(function StreakOverview({ 
  currentStreak = 0, 
  bestStreak = 0, 
  recentDays = [], 
  streakShields = 0,
  streakAtRisk = false,
  nextMilestone,
  percentToMilestone,
  isLoading = false
}: StreakOverviewProps) {
  const { toast } = useToast();
  const [showShieldDialog, setShowShieldDialog] = useState(false);
  
  // Generate recent days data if not provided (for last 14 days)
  const displayDays = useMemo(() => {
    if (recentDays.length > 0) return recentDays.slice(-14);
    
    // Generate mock data based on current streak for visual consistency
    const days = new Array(14).fill(false);
    if (currentStreak > 0) {
      // Fill the last 'currentStreak' days as completed, up to 14
      const completedDays = Math.min(currentStreak, 14);
      for (let i = 14 - completedDays; i < 14; i++) {
        days[i] = true;
      }
    }
    return days;
  }, [recentDays, currentStreak]);
  
  // Memoize streak tier calculation
  const streakInfo = useMemo(() => {
    if (currentStreak >= 100) return { tier: 'diamond', color: 'from-blue-300 to-blue-500' };
    if (currentStreak >= 30) return { tier: 'platinum', color: 'from-purple-300 to-purple-600' };
    if (currentStreak >= 14) return { tier: 'gold', color: 'from-yellow-300 to-yellow-600' };
    if (currentStreak >= 7) return { tier: 'silver', color: 'from-amber-300 to-amber-600' };
    return { tier: 'bronze', color: 'from-orange-300 to-orange-600' };
  }, [currentStreak]);
  
  // Memoize milestone calculation
  const milestone = useMemo(() => {
    const milestones = [7, 14, 30, 50, 100, 200, 365];
    const nextMile = milestones.find(m => m > currentStreak) || currentStreak + 10;
    const prevMile = milestones.filter(m => m <= currentStreak).pop() || 0;
    const percent = Math.round(((currentStreak - prevMile) / (nextMile - prevMile)) * 100);
    
    return {
      next: nextMile,
      percent: percent,
      daysLeft: nextMile - currentStreak
    };
  }, [currentStreak]);
  
  // Handle streak protection with useCallback
  const handleActivateShield = useCallback(() => {
    toast({
      title: "Streak Shield Activated",
      description: "Your prayer streak is now protected for the next 24 hours.",
      variant: "default"
    });
    setShowShieldDialog(false);
  }, [toast]);
  
  // Day names for the mini calendar
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2 px-5 pt-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 opacity-70" />
              Prayer Streak
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="h-14 w-14 rounded-full bg-secondary animate-pulse mr-3.5" />
                <div>
                  <div className="h-6 w-24 bg-secondary animate-pulse rounded mb-2" />
                  <div className="h-4 w-16 bg-secondary animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="h-8 bg-secondary animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn(
      "mb-4 overflow-hidden",
      streakAtRisk ? "shadow-md border-amber-500/40" : "shadow-sm border-border"
    )}>
      <div className="relative">
        {/* Streak status banner - only shows when streak is at risk */}
        {streakAtRisk && (
          <div className="absolute top-0 left-0 right-0 w-full bg-gradient-to-r from-amber-500/90 to-red-500/90 py-1.5 px-4 text-white flex items-center justify-between text-xs font-medium z-10">
            <div className="flex items-center">
              <Flame className="h-3.5 w-3.5 mr-1.5" />
              <span>Streak at risk!</span>
            </div>
            <span className="font-bold">8h 23m left</span>
          </div>
        )}
        
        {/* Card Header */}
        <CardHeader className={cn(
          "pb-2 px-5", 
          streakAtRisk ? "pt-9" : "pt-4"
        )}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 opacity-70" />
              Prayer Streak
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs h-7 text-primary hover:text-primary/80">
                  View History
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Prayer Streak History</DialogTitle>
                  <DialogDescription>
                    Your consistent prayer journey over time
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <h4 className="text-sm font-medium mb-2">Streak Milestones</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">1 Week Streak</span>
                      <Badge variant="outline" className={currentStreak >= 7 ? "bg-gradient-to-r from-orange-300 to-orange-600 text-white" : "bg-muted/50 text-muted-foreground"}>
                        {currentStreak >= 7 ? "Achieved" : `${7 - currentStreak} days left`}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">2 Week Streak</span>
                      <Badge variant="outline" className={currentStreak >= 14 ? "bg-gradient-to-r from-yellow-300 to-yellow-600 text-white" : "bg-muted/50 text-muted-foreground"}>
                        {currentStreak >= 14 ? "Achieved" : `${14 - currentStreak} days left`}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">1 Month Streak</span>
                      <Badge variant="outline" className={currentStreak >= 30 ? "bg-gradient-to-r from-purple-300 to-purple-600 text-white" : "bg-muted/50 text-muted-foreground"}>
                        {currentStreak >= 30 ? "Achieved" : `${30 - currentStreak} days left`}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => toast({
                    title: "Calendar View",
                    description: "Viewing your complete prayer history"
                  })}>View Full Calendar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="p-5 pt-0">
          {/* Main streak display */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="relative mr-3.5">
                  <div className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg",
                    streakInfo.color
                  )}>
                    <span className="text-xl font-bold text-white">{currentStreak}</span>
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-lg flex items-center">
                    Prayer Streak
                    {currentStreak >= bestStreak && currentStreak > 0 && (
                      <Star className="h-4 w-4 text-yellow-500 ml-1.5" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentStreak > 0 ? "Keep it going!" : "Start your streak today!"}
                  </div>
                </div>
              </div>
              
              {/* Progress to next milestone */}
              <div className="mt-4 pr-4">
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <div className="text-muted-foreground">
                    Next milestone: <span className="font-medium text-foreground">{milestone.next} days</span>
                  </div>
                  <div className="font-medium">
                    {milestone.daysLeft} days left
                  </div>
                </div>
                <Progress value={milestone.percent} className="h-1.5" />
              </div>
            </div>
            
            {/* Streak shield section */}
            <div className="ml-2 flex flex-col items-end">
              <Dialog open={showShieldDialog} onOpenChange={setShowShieldDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant={streakAtRisk ? "default" : "outline"} 
                    size="sm"
                    className={cn(
                      "rounded-lg flex items-center gap-1.5 mb-1",
                      streakAtRisk && "bg-gradient-to-r from-amber-500 to-red-500 text-white border-none"
                    )}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span className="font-medium">{streakShields}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Streak Protection</DialogTitle>
                    <DialogDescription>
                      Use a Streak Shield to protect your prayer streak for 24 hours
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">Streak Shields</h4>
                        <p className="text-sm text-muted-foreground">You have {streakShields} shields remaining</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      {streakAtRisk ? (
                        <p className="text-amber-600 dark:text-amber-400 font-medium">Your streak is at risk! Activate a shield to protect it.</p>
                      ) : (
                        <p>Shields protect your streak for 24 hours when you can't pray on time.</p>
                      )}
                    </div>
                    
                    {streakShields === 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div className="text-sm">Complete 5 prayers in a row to earn another shield</div>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => setShowShieldDialog(false)}>Cancel</Button>
                    <Button 
                      onClick={handleActivateShield} 
                      disabled={streakShields === 0}
                      className={streakShields > 0 ? "bg-gradient-to-r from-blue-500 to-blue-700" : ""}
                    >
                      Activate Shield
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-xs text-muted-foreground mr-1">BEST:</span>
                <span className="text-sm font-semibold">{bestStreak}</span>
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>
          </div>
          
          {/* Mini calendar - FIXED: Removed flickering animations */}
          <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-border/50">
            <div className="grid grid-cols-7 gap-2 mb-1">
              {dayNames.map((day, index) => (
                <div key={`day-${index}`} className="text-center text-xs text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* First week */}
            <div className="grid grid-cols-7 gap-2">
              {displayDays.slice(0, 7).map((completed, index) => (
                <div 
                  key={`week1-${index}`}
                  className={cn(
                    "h-8 rounded-md flex items-center justify-center",
                    completed 
                      ? "bg-gradient-to-br from-primary/80 to-primary shadow-sm" 
                      : "bg-secondary/30 dark:bg-secondary/20"
                  )}
                  title={`${completed ? 'Completed' : 'Missed'} prayers`}
                >
                  {completed ? (
                    <span className="text-xs text-primary-foreground">✓</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">·</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Second week */}
            <div className="grid grid-cols-7 gap-2">
              {displayDays.slice(7, 14).map((completed, index) => (
                <div 
                  key={`week2-${index}`}
                  className={cn(
                    "h-8 rounded-md flex items-center justify-center",
                    completed 
                      ? "bg-gradient-to-br from-primary/80 to-primary shadow-sm" 
                      : "bg-secondary/30 dark:bg-secondary/20"
                  )}
                  title={`${completed ? 'Completed' : 'Missed'} prayers`}
                >
                  {completed ? (
                    <span className="text-xs text-primary-foreground">✓</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">·</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
});

export { StreakOverview };
