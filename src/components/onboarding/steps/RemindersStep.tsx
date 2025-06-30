/**
 * Reminders Step for the enhanced onboarding flow
 * Sets up prayer reminder preferences
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Bell, Clock, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface RemindersStepProps {
  onNext: () => void;
  onBack: () => void;
}

type ReminderTiming = 'before' | 'after' | 'end';
type ReminderStyle = 'soft' | 'lopi' | 'none';

export function RemindersStep({ onNext, onBack }: RemindersStepProps) {
  const [reminderTiming, setReminderTiming] = useState<ReminderTiming>('before');
  const [reminderStyle, setReminderStyle] = useState<ReminderStyle>('soft');
  
  const handleTimingChange = (value: ReminderTiming) => {
    setReminderTiming(value);
    
    // Provide haptic feedback on selection
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };
  
  const handleStyleChange = (value: ReminderStyle) => {
    setReminderStyle(value);
    
    // Provide haptic feedback on selection with different patterns based on style
    if (navigator.vibrate) {
      if (value === 'soft') {
        navigator.vibrate(40);
      } else if (value === 'lopi') {
        navigator.vibrate([40, 30, 40]);
      } else {
        navigator.vibrate(20);
      }
    }
  };
  
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
              <span className="text-3xl">⏰</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center">Reminders That Work For You</h2>
          
          <p className="text-center text-muted-foreground mb-4">
            When and how should we nudge you for prayers?
          </p>
          
          <div className="space-y-6 mt-2">
            {/* Reminder timing */}
            <div className="space-y-3">
              <Label className="text-base font-medium">When should we remind you?</Label>
              
              <RadioGroup value={reminderTiming} onValueChange={handleTimingChange as any}>
                <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent transition-colors">
                  <RadioGroupItem value="before" id="timing-before" />
                  <Label htmlFor="timing-before" className="flex items-center cursor-pointer">
                    <Clock className="mr-2 h-4 w-4" />
                    <div>
                      <span className="font-medium">Before prayer time</span>
                      <p className="text-sm text-muted-foreground">Get ready in advance</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent transition-colors">
                  <RadioGroupItem value="after" id="timing-after" />
                  <Label htmlFor="timing-after" className="flex items-center cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    <div>
                      <span className="font-medium">After adhan</span>
                      <p className="text-sm text-muted-foreground">When prayer time begins</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent transition-colors">
                  <RadioGroupItem value="end" id="timing-end" />
                  <Label htmlFor="timing-end" className="flex items-center cursor-pointer">
                    <Clock className="mr-2 h-4 w-4" />
                    <div>
                      <span className="font-medium">Before time ends</span>
                      <p className="text-sm text-muted-foreground">Last chance reminder</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Reminder style */}
            <div className="space-y-3">
              <Label className="text-base font-medium">How should we remind you?</Label>
              
              <RadioGroup value={reminderStyle} onValueChange={handleStyleChange as any}>
                <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent transition-colors">
                  <RadioGroupItem value="soft" id="style-soft" />
                  <Label htmlFor="style-soft" className="flex items-center cursor-pointer">
                    <Volume2 className="mr-2 h-4 w-4" />
                    <div>
                      <span className="font-medium">Soft reminder</span>
                      <p className="text-sm text-muted-foreground">Gentle notification</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent transition-colors">
                  <RadioGroupItem value="lopi" id="style-lopi" />
                  <Label htmlFor="style-lopi" className="flex items-center cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    <div>
                      <span className="font-medium">Lopi's spiritual nudge</span>
                      <p className="text-sm text-muted-foreground">Personalized message</p>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent transition-colors">
                  <RadioGroupItem value="none" id="style-none" />
                  <Label htmlFor="style-none" className="flex items-center cursor-pointer">
                    <VolumeX className="mr-2 h-4 w-4" />
                    <div>
                      <span className="font-medium">No reminder</span>
                      <p className="text-sm text-muted-foreground">I'll check manually</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <motion.div 
            className="text-center text-sm text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Tiny nudges make big habits. You can always adjust these settings later.
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
          
          <Button onClick={onNext}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
