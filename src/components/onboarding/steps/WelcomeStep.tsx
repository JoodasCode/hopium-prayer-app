/**
 * Welcome step for the enhanced onboarding flow
 * First impression of the Hopium app experience
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Trigger haptic feedback on mount
  useEffect(() => {
    // Check if vibration API is available
    if (navigator.vibrate) {
      // Gentle pulse pattern - subtle heartbeat
      navigator.vibrate([50, 100, 50]);
    }
  }, []);
  
  // Handle press and hold interaction
  const handlePressStart = () => {
    // Start the press timer
    const timer = setTimeout(() => {
      setHasInteracted(true);
      // Provide haptic confirmation
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 800); // Hold for 800ms to proceed
    
    // Store the timer ID for cleanup
    return () => clearTimeout(timer);
  };
  
  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-0">
        {/* Placeholder for custom animation/video */}
        <div className="bg-primary/10 h-48 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-4xl font-arabic text-primary text-center p-6"
          >
            بِسْمِ اللهِ
          </motion.div>
        </div>
        
        <div className="p-6 space-y-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-2xl font-semibold text-center"
          >
            Welcome to Hopium
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center text-muted-foreground"
          >
            This isn't just an app. It's your quiet companion in a noisy world.
          </motion.p>
          
          {!hasInteracted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="flex justify-center"
            >
              <Button 
                variant="outline" 
                size="lg"
                className="w-full mt-4"
                onPointerDown={handlePressStart}
                onPointerUp={() => {}}
                onPointerLeave={() => {}}
              >
                Press and hold to begin your journey
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <Button 
                onClick={onNext}
                size="lg"
                className="w-full mt-4"
              >
                Begin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
