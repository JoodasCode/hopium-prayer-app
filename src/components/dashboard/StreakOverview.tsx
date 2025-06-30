'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type StreakOverviewProps = {
  currentStreak: number;
  bestStreak: number;
  recentDays: boolean[];
};

export function StreakOverview({ currentStreak, bestStreak, recentDays }: StreakOverviewProps) {
  // Get day names for the calendar
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  return (
    <Card className="mb-4 shadow-sm border-border overflow-hidden">
      <CardHeader className="pb-0 pt-4 px-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold uppercase text-foreground">Prayer Streaks</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7 text-primary">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3">
        
        <div className="flex flex-col gap-2">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-1">
            {dayNames.map((day, index) => (
              <div key={`day-${index}`} className="text-center text-xs text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* First week */}
          <div className="grid grid-cols-7 gap-2">
            {recentDays.slice(0, 7).map((completed, index) => (
              <div 
                key={`week1-${index}`}
                className={cn(
                  "h-8 rounded-md flex items-center justify-center",
                  completed 
                    ? "bg-gradient-to-br from-primary to-primary/80 shadow-sm" 
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
            {recentDays.slice(7, 14).map((completed, index) => (
              <div 
                key={`week2-${index}`}
                className={cn(
                  "h-8 rounded-md flex items-center justify-center",
                  completed 
                    ? "bg-gradient-to-br from-primary to-primary/80 shadow-sm" 
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
          
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">CURRENT STREAK</span>
              <div className="text-xl font-bold text-primary">{currentStreak} <span className="text-sm font-normal">days</span></div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">BEST STREAK</span>
              <div className="text-xl font-bold">{bestStreak} <span className="text-sm font-normal">days</span></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
