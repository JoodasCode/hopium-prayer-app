/**
 * Prayer Baseline Step for the enhanced onboarding flow
 * Captures which prayers the user currently observes regularly
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PrayerBaselineStepProps {
  onNext: (prayerBaseline: Record<string, boolean>) => void;
  onBack: () => void;
  selectedBaseline?: Record<string, boolean>;
}

type Prayer = {
  id: string;
  name: string;
  arabicName: string;
  time: string;
};

const PRAYERS: Prayer[] = [
  { id: 'fajr', name: 'Fajr', arabicName: 'الفجر', time: 'Dawn' },
  { id: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', time: 'Noon' },
  { id: 'asr', name: 'Asr', arabicName: 'العصر', time: 'Afternoon' },
  { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', time: 'Sunset' },
  { id: 'isha', name: 'Isha', arabicName: 'العشاء', time: 'Night' },
];

export function PrayerBaselineStep({ 
  onNext, 
  onBack,
  selectedBaseline = {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
  }
}: PrayerBaselineStepProps) {
  const [baseline, setBaseline] = useState<Record<string, boolean>>(selectedBaseline);
  
  const togglePrayer = (prayerId: string) => {
    setBaseline(prev => ({
      ...prev,
      [prayerId]: !prev[prayerId]
    }));
    
    // Provide haptic feedback on toggle
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };
  
  // Count how many prayers are selected
  const selectedCount = Object.values(baseline).filter(Boolean).length;
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6 pb-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <span className="text-3xl">🙏</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center">Prayer Baseline</h2>
          
          <p className="text-center text-muted-foreground mb-4">
            Which prayers do you currently observe regularly?
          </p>
          
          <div className="space-y-4 mt-2">
            {PRAYERS.map((prayer, index) => (
              <motion.div
                key={prayer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent transition-colors"
                onClick={() => togglePrayer(prayer.id)}
              >
                <Checkbox 
                  id={`prayer-${prayer.id}`} 
                  checked={baseline[prayer.id]} 
                  onCheckedChange={() => togglePrayer(prayer.id)}
                />
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <Label 
                      htmlFor={`prayer-${prayer.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {prayer.name}
                    </Label>
                    <span className="text-sm text-muted-foreground">{prayer.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-arabic">{prayer.arabicName}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center text-sm text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {selectedCount === 0 ? (
              "It's okay if you don't regularly pray yet - we're here to help you start"
            ) : selectedCount === 5 ? (
              "MashaAllah! You're already praying all five daily prayers"
            ) : (
              `You've selected ${selectedCount} ${selectedCount === 1 ? 'prayer' : 'prayers'} - we'll help you build on this foundation`
            )}
          </motion.div>
        </motion.div>
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button onClick={() => onNext(baseline)}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
