'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Calendar, Moon, CheckCircle } from 'lucide-react';

type ActionZoneProps = {
  journeyProgress: number;
  nextPrayer: {
    name: string;
    time: string;
    id?: string; // Add id property to support prayer completion
  } | null;
  onPrayerComplete?: () => void; // Optional callback for prayer completion
};

export function ActionZone({ journeyProgress, nextPrayer, onPrayerComplete }: ActionZoneProps) {
  const [prayerCompleted, setPrayerCompleted] = useState(false);
  
  const handlePrayerAction = () => {
    if (nextPrayer && !prayerCompleted) {
      setPrayerCompleted(true);
      // Call the callback to update parent component state
      if (onPrayerComplete) {
        onPrayerComplete();
      }
    }
  };
  return (
    <div className="mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Main Action Button */}
            <div className="transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Button 
                className={`w-full py-6 text-lg font-medium relative overflow-hidden ${prayerCompleted ? 'bg-green-600 hover:bg-green-700' : ''}`}
                size="lg"
                onClick={handlePrayerAction}
                disabled={!nextPrayer || prayerCompleted}
              >
                {prayerCompleted ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>{nextPrayer?.name} Prayer Completed</span>
                  </div>
                ) : nextPrayer ? (
                  `Prepare for ${nextPrayer.name} (${nextPrayer.time})`
                ) : (
                  'All Prayers Completed Today'
                )}
                
                {!prayerCompleted && nextPrayer && (
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-primary/10">
                    Click when prayer is complete
                  </span>
                )}
              </Button>
            </div>
            
            {/* Journey Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Journey Progress</span>
                <span className="text-primary">{journeyProgress}%</span>
              </div>
              <Progress value={journeyProgress} className="h-2" />
            </div>
            
            {/* Quick Actions */}
            <div className="flex justify-between gap-3 mt-3">
              <Button variant="outline" className="flex-1 flex flex-col items-center py-5 h-auto" size="sm">
                <Calendar className="h-5 w-5 mb-2" />
                <span className="text-xs font-medium">Schedule</span>
              </Button>
              <Button variant="outline" className="flex-1 flex flex-col items-center py-5 h-auto" size="sm">
                <MessageSquare className="h-5 w-5 mb-2" />
                <span className="text-xs font-medium">Reflect</span>
              </Button>
              <Button variant="outline" className="flex-1 flex flex-col items-center py-5 h-auto" size="sm">
                <Moon className="h-5 w-5 mb-2" />
                <span className="text-xs font-medium">Meditate</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
