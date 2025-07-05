/**
 * Completion Step for the enhanced onboarding flow
 * Celebrates completion and transitions to main app
 */

'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompletionStepProps {
  onComplete: () => void;
  userName: string;
}

export function CompletionStep({ 
  onComplete,
  userName = 'friend'
}: CompletionStepProps) {
  // Provide celebratory haptic feedback on mount
  useEffect(() => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  }, []);
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6 pb-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 text-center"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              className="p-4 bg-primary/20 rounded-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1.1 }}
              transition={{ 
                duration: 0.6, 
                repeat: 1, 
                repeatType: "reverse",
                ease: "easeOut" 
              }}
            >
              <CheckCircle className="h-12 w-12 text-primary" />
            </motion.div>
          </div>
          
          <motion.h2 
            className="text-2xl font-semibold text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Your Journey Begins
          </motion.h2>
          
          <motion.p 
            className="text-center text-muted-foreground"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Thank you, {userName}! Your spiritual path is set.
          </motion.p>
          
          <motion.div
            className="py-8 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <p>Your preferences have been saved</p>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <p>Your intention has been set</p>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <p>Mulvi is ready to support you</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Button 
              size="lg"
              onClick={onComplete}
              className="px-8"
            >
              <Home className="mr-2 h-4 w-4" />
              Enter Mulvi
            </Button>
          </motion.div>
          
          <motion.p 
            className="text-xs text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            You can adjust all settings in your profile anytime
          </motion.p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
