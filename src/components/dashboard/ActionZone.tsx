'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Calendar, Moon, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const router = useRouter();
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

  // Smart prefetching for quick actions
  const handleMulviHover = () => router.prefetch('/mulvi');
  const handleStatsHover = () => router.prefetch('/stats');
  const handleSettingsHover = () => router.prefetch('/settings');

  const handleReflectClick = () => router.push('/mulvi?mode=reflection');
  const handleScheduleClick = () => router.push('/settings?tab=notifications');
  const handleMeditateClick = () => router.push('/mulvi?mode=meditation');

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Main Action Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <Button 
                className={`w-full py-6 text-lg font-medium relative overflow-hidden transition-colors ${
                  prayerCompleted ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
                size="lg"
                onClick={handlePrayerAction}
                disabled={!nextPrayer || prayerCompleted}
              >
                {prayerCompleted ? (
                  <motion.div 
                    className="flex items-center justify-center gap-2"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>{nextPrayer?.name} Prayer Completed</span>
                  </motion.div>
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
            </motion.div>
            
            {/* Journey Progress */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <div className="flex justify-between text-sm">
                <span>Journey Progress</span>
                <span className="text-primary">{journeyProgress}%</span>
              </div>
              <Progress value={journeyProgress} className="h-2" />
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div 
              className="flex justify-between gap-3 mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1"
              >
                <Button 
                  variant="outline" 
                  className="w-full flex flex-col items-center py-5 h-auto" 
                  size="sm"
                  onClick={handleScheduleClick}
                  onMouseEnter={handleSettingsHover}
                >
                  <Calendar className="h-5 w-5 mb-2" />
                  <span className="text-xs font-medium">Schedule</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1"
              >
                <Button 
                  variant="outline" 
                  className="w-full flex flex-col items-center py-5 h-auto" 
                  size="sm"
                  onClick={handleReflectClick}
                  onMouseEnter={handleMulviHover}
                >
                  <MessageSquare className="h-5 w-5 mb-2" />
                  <span className="text-xs font-medium">Reflect</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1"
              >
                <Button 
                  variant="outline" 
                  className="w-full flex flex-col items-center py-5 h-auto" 
                  size="sm"
                  onClick={handleMeditateClick}
                  onMouseEnter={handleMulviHover}
                >
                  <Moon className="h-5 w-5 mb-2" />
                  <span className="text-xs font-medium">Meditate</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
