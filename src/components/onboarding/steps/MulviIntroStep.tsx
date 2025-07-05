/**
 * Mulvi Introduction Step for the enhanced onboarding flow
 * Introduces the Mulvi AI assistant and gets opt-in
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface MulviIntroStepProps {
  onNext: (enableMulvi: boolean) => void;
  onBack: () => void;
  initialEnabled?: boolean;
}

export function MulviIntroStep({ 
  onNext, 
  onBack,
  initialEnabled = true
}: MulviIntroStepProps) {
  const [enableMulvi, setEnableMulvi] = useState<boolean>(initialEnabled);
  const [showingExample, setShowingExample] = useState<boolean>(false);
  
  const handleToggle = (checked: boolean) => {
    setEnableMulvi(checked);
    
    // Provide haptic feedback on toggle
    if (navigator.vibrate) {
      navigator.vibrate(checked ? [40, 30, 40] : 40);
    }
  };
  
  const handleShowExample = () => {
    setShowingExample(true);
    
    // Provide haptic feedback when showing example
    if (navigator.vibrate) {
      navigator.vibrate(30);
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
              <span className="text-3xl">🦙</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center">Meet Mulvi</h2>
          
          <p className="text-center text-muted-foreground mb-4">
            Your personal spiritual companion on this journey
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <span className="text-xl">🦙</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Mulvi</p>
                <motion.div 
                  className="text-sm mt-1 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {!showingExample ? (
                    <p>Hello! I'm Mulvi, your AI spiritual companion. I'm here to support your prayer journey with personalized guidance.</p>
                  ) : (
                    <>
                      <p>I notice you're working on praying Maghrib consistently this week. Would you like me to share a short reflection about the significance of sunset prayers?</p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Yes, please
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Maybe later
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
            
            {!showingExample && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={handleShowExample}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                See an example
              </Button>
            )}
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mulvi-enabled" className="text-base font-medium">
                  Enable Mulvi
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get personalized spiritual guidance
                </p>
              </div>
              <Switch 
                id="mulvi-enabled" 
                checked={enableMulvi} 
                onCheckedChange={handleToggle} 
              />
            </div>
            
            {enableMulvi && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 pl-6">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Mulvi will learn from your prayer patterns
                  </p>
                </div>
                <div className="flex items-center space-x-2 pl-6">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Personalized reflections based on your journey
                  </p>
                </div>
              </motion.div>
            )}
          </div>
          
          <motion.div 
            className="text-center text-sm text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            You can always adjust Mulvi's settings later in your profile
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
          
          <Button onClick={() => onNext(enableMulvi)}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
