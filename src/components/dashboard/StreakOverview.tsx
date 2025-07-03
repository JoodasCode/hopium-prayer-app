'use client';

import { useState, useEffect } from 'react';
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
  recentDays: boolean[];
  streakShields?: number;
  streakAtRisk?: boolean;
  nextMilestone?: number;
  percentToMilestone?: number;
};

export function StreakOverview({ 
  currentStreak = 7, 
  bestStreak = 14, 
  recentDays = new Array(14).fill(true), 
  streakShields = 2,
  streakAtRisk = true,
  nextMilestone = 10,
  percentToMilestone = 70
}: StreakOverviewProps) {
  const { toast } = useToast();
  const [showAnimation, setShowAnimation] = useState(false);
  const [showShieldDialog, setShowShieldDialog] = useState(false);
  
  // Streak tier and visual effects
  const getStreakTier = (streak: number) => {
    if (streak >= 100) return { tier: 'diamond', color: 'from-blue-300 to-blue-500', size: 'scale-110' };
    if (streak >= 30) return { tier: 'platinum', color: 'from-purple-300 to-purple-600', size: 'scale-105' };
    if (streak >= 14) return { tier: 'gold', color: 'from-yellow-300 to-yellow-600', size: 'scale-100' };
    if (streak >= 7) return { tier: 'silver', color: 'from-amber-300 to-amber-600', size: 'scale-100' };
    return { tier: 'bronze', color: 'from-orange-300 to-orange-600', size: 'scale-95' };
  };
  
  const streakInfo = getStreakTier(currentStreak);
  
  // Milestone calculation
  const getMilestoneInfo = () => {
    const milestones = [7, 14, 30, 50, 100, 200, 365];
    const nextMile = milestones.find(m => m > currentStreak) || currentStreak + 10;
    const prevMile = milestones.filter(m => m <= currentStreak).pop() || 0;
    const percent = Math.round(((currentStreak - prevMile) / (nextMile - prevMile)) * 100);
    
    return {
      next: nextMile,
      percent: percent,
      daysLeft: nextMile - currentStreak
    };
  };
  
  const milestone = getMilestoneInfo();
  
  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle streak protection
  const handleActivateShield = () => {
    toast({
      title: "Streak Shield Activated",
      description: "Your prayer streak is now protected for the next 24 hours.",
      variant: "default"
    });
    setShowShieldDialog(false);
  };
  
  // Day names for the mini calendar
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <Card className={cn(
      "mb-4 overflow-hidden transition-all duration-700 ease-out p-0",
      streakAtRisk ? "shadow-md border-amber-500/40" : "shadow-sm border-border",
      showAnimation ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    )}>
      <div className="relative">
        {/* Streak status banner - only shows when streak is at risk */}
        {streakAtRisk && (
          <div className="absolute top-0 left-0 right-0 w-full bg-gradient-to-r from-amber-500/90 to-red-500/90 py-1.5 px-4 text-white flex items-center justify-between text-xs font-medium z-10">
            <div className="flex items-center">
              <Flame className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
              <span>Streak at risk!</span>
            </div>
            <span className="font-bold">8h 23m left</span>
          </div>
        )}
        
        {/* Card Header - adjusted padding for banner if present */}
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
                      <Badge variant="outline" className="bg-gradient-to-r from-orange-300 to-orange-600 text-white">Achieved</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">2 Week Streak</span>
                      <Badge variant="outline" className="bg-gradient-to-r from-yellow-300 to-yellow-600 text-white">Achieved</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">1 Month Streak</span>
                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground">3 days left</Badge>
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
                <div className={cn(
                  "relative mr-3.5 transition-all duration-500",
                  showAnimation ? streakInfo.size : "scale-90 opacity-70"
                )}>
                  <div className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg",
                    streakInfo.color,
                    showAnimation && "animate-flame"
                  )}>
                    <span className="text-xl font-bold text-white">{currentStreak}</span>
                  </div>
                  {/* Particles effect for streaks > 7 */}
                  {currentStreak >= 7 && showAnimation && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-300 animate-ping opacity-70" />
                  )}
                  {currentStreak >= 14 && showAnimation && (
                    <div className="absolute -bottom-1 -right-0 h-3 w-3 rounded-full bg-yellow-300 animate-ping opacity-50 delay-300" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    Prayer Streak
                    {currentStreak >= bestStreak && (
                      <span className="ml-1.5 inline-block animate-bounce">
                        <Star className="h-4 w-4 text-yellow-500 inline-block" />
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Keep it going!
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
                      "rounded-lg flex items-center gap-1.5 transition-all mb-1",
                      streakAtRisk && "animate-pulse bg-gradient-to-r from-amber-500 to-red-500 text-white border-none"
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
          
          {/* Mini calendar */}
          <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-border/50">
            <div className="grid grid-cols-7 gap-2 mb-1">
              {dayNames.map((day, index) => (
                <div key={`day-${index}`} className="text-center text-xs text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* First week - with animation delay */}
            <div className="grid grid-cols-7 gap-2">
              {recentDays.slice(0, 7).map((completed, index) => (
                <div 
                  key={`week1-${index}`}
                  className={cn(
                    "h-8 rounded-md flex items-center justify-center transition-all duration-300 ease-out",
                    completed 
                      ? "bg-gradient-to-br from-primary/80 to-primary shadow-sm" 
                      : "bg-secondary/30 dark:bg-secondary/20",
                    showAnimation 
                      ? "opacity-100 scale-100" 
                      : "opacity-0 scale-95",
                    `transition-delay-${index * 50}`
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
            
            {/* Second week - with animation delay */}
            <div className="grid grid-cols-7 gap-2">
              {recentDays.slice(7, 14).map((completed, index) => (
                <div 
                  key={`week2-${index}`}
                  className={cn(
                    "h-8 rounded-md flex items-center justify-center transition-all duration-300 ease-out",
                    completed 
                      ? "bg-gradient-to-br from-primary/80 to-primary shadow-sm" 
                      : "bg-secondary/30 dark:bg-secondary/20",
                    showAnimation 
                      ? "opacity-100 scale-100" 
                      : "opacity-0 scale-95",
                    `transition-delay-${(index + 7) * 50}`
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
}
