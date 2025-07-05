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
  const getStreakTier = (currentStreak: number) => {
    if (currentStreak >= 100) return { tier: 'diamond', color: 'bg-chart-1 text-chart-1-foreground' };
    if (currentStreak >= 30) return { tier: 'platinum', color: 'bg-chart-2 text-chart-2-foreground' };
    if (currentStreak >= 14) return { tier: 'gold', color: 'bg-chart-3 text-chart-3-foreground' };
    if (currentStreak >= 7) return { tier: 'silver', color: 'bg-chart-4 text-chart-4-foreground' };
    return { tier: 'bronze', color: 'bg-chart-5 text-chart-5-foreground' };
  };
  
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
      "mb-4 overflow-hidden claymorph-card",
      streakAtRisk ? "border-destructive/40" : ""
    )}>
      <div className="relative">
        {/* Streak status banner - only shows when streak is at risk */}
        {streakAtRisk && (
          <div className="absolute top-0 left-0 right-0 w-full bg-destructive py-1.5 px-4 text-destructive-foreground flex items-center justify-between text-xs font-medium z-10">
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
            <CardTitle className="text-sm font-semibold uppercase text-foreground">STREAK</CardTitle>
            
            {/* Streak badges */}
            <div className="flex gap-1">
              <Badge variant="outline" className={currentStreak >= 7 ? "bg-chart-4 text-chart-4-foreground border-chart-4" : "bg-muted/50 text-muted-foreground"}>
                7d
              </Badge>
              
              <Badge variant="outline" className={currentStreak >= 14 ? "bg-chart-3 text-chart-3-foreground border-chart-3" : "bg-muted/50 text-muted-foreground"}>
                14d
              </Badge>
              
              <Badge variant="outline" className={currentStreak >= 30 ? "bg-chart-2 text-chart-2-foreground border-chart-2" : "bg-muted/50 text-muted-foreground"}>
                30d
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        {/* Card Content */}
        <CardContent className="px-5 pb-5 pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Streak icon with tier-based styling */}
              <div className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center claymorph-elevated",
                getStreakTier(currentStreak).color
              )}>
                <Flame className="h-7 w-7" />
              </div>
              
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{currentStreak}</span>
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs px-2 py-0.5",
                      streakAtRisk && "bg-destructive text-destructive-foreground border-destructive"
                    )}
                  >
                    {streakAtRisk ? "At Risk" : getStreakTier(currentStreak).tier}
                  </Badge>
                  
                  {/* Streak Shield */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-auto text-xs"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Shield className="h-4 w-4" />
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Streak Shield
                        </DialogTitle>
                        <DialogDescription>
                          Protect your streak from being broken
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{streakShields}</div>
                          <div className="text-sm text-muted-foreground">shields remaining</div>
                        </div>
                        
                        <Button 
                          className={cn(
                            "w-full",
                            streakShields > 0 ? "bg-primary text-primary-foreground" : ""
                          )}
                          disabled={streakShields === 0}
                        >
                          {streakShields > 0 ? "Use Shield" : "No shields left"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-xs text-muted-foreground mr-1">BEST:</span>
                  <span className="text-sm font-semibold text-foreground">{bestStreak}</span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
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
                      ? "bg-primary text-primary-foreground claymorph-inset" 
                      : "bg-secondary/30 dark:bg-secondary/20"
                  )}
                  title={`${completed ? 'Completed' : 'Missed'} prayers`}
                >
                  {completed ? (
                    <span className="text-xs">✓</span>
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
                      ? "bg-primary text-primary-foreground claymorph-inset" 
                      : "bg-secondary/30 dark:bg-secondary/20"
                  )}
                  title={`${completed ? 'Completed' : 'Missed'} prayers`}
                >
                  {completed ? (
                    <span className="text-xs">✓</span>
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
