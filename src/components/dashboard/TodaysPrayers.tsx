'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Prayer } from './data';

type TodaysPrayersProps = {
  prayers: Prayer[];
  completedPrayers: string[];
  nextPrayerId?: string;
};

export function TodaysPrayers({ prayers, completedPrayers, nextPrayerId }: TodaysPrayersProps) {
  // Calculate progress
  const completedCount = completedPrayers.length;
  const totalPrayers = prayers.length;
  const progressPercentage = (completedCount / totalPrayers) * 100;
  const isLastPrayer = completedCount === totalPrayers - 1;
  
  return (
    <Card className="mb-4 shadow-sm border-border overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-semibold uppercase text-foreground">TODAY'S PRAYERS</CardTitle>
          <span className="text-xs font-medium">{completedCount} of {totalPrayers} complete</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-secondary/40 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="px-5 pb-5 pt-0">
        <div className="grid grid-cols-5 gap-3">
          {prayers.map((prayer, index) => {
            const isCompleted = completedPrayers.includes(prayer.id);
            const isNext = nextPrayerId === prayer.id;
            const isLast = index === prayers.length - 1;
            
            return (
              <div 
                key={prayer.id}
                className={cn(
                  "rounded-xl text-center transition-all h-[110px] flex flex-col relative overflow-hidden",
                  isCompleted ? "bg-gradient-to-b from-chart-3 to-chart-3/90 text-white shadow-md" : 
                  isNext ? "bg-gradient-to-b from-primary/90 to-primary text-primary-foreground shadow-md border border-primary/30" : 
                  "bg-secondary/30 hover:bg-secondary/40 text-secondary-foreground"
                )}
              >
                {/* Special glow effect for last prayer of the day */}
                {isLast && isCompleted && (
                  <div className="absolute inset-0 bg-yellow-400/20 animate-pulseGentle z-0"></div>
                )}
                
                <div className="p-3 flex flex-col items-center justify-between h-full relative z-10">
                  <div className="text-xs font-semibold uppercase">{prayer.name}</div>
                  
                  <div className="text-sm font-medium">
                    {prayer.time}
                  </div>
                  
                  <div>
                    {isCompleted ? (
                      <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-sm">✓</span>
                      </div>
                    ) : isNext ? (
                      <div className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                        <span className="text-sm">⏱</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">Upcoming</span>
                    )}
                  </div>
                  
                  {/* Special icon for last prayer */}
                  {isLast && (
                    <div className="absolute top-1 right-1 text-xs">
                      {isCompleted ? "✨" : "🌙"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
