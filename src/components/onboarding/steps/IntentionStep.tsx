/**
 * Intention Step for the enhanced onboarding flow
 * Sets a spiritual intention for the week
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Check, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface IntentionStepProps {
  onNext: (intentions: string[]) => void;
  onBack: () => void;
  selectedIntentions?: string[];
}

type IntentionOption = {
  id: string;
  text: string;
  description: string;
};

const INTENTION_OPTIONS: IntentionOption[] = [
  { 
    id: 'pray3', 
    text: 'Pray 3 out of 5 daily prayers', 
    description: 'A great starting goal'
  },
  { 
    id: 'maghrib', 
    text: 'Never miss Maghrib this week', 
    description: 'Focus on consistency with one prayer'
  },
  { 
    id: 'feel', 
    text: 'Feel better after each prayer', 
    description: 'Focus on quality over quantity'
  },
  { 
    id: 'custom', 
    text: 'Set my own intention', 
    description: 'Create a personalized goal'
  },
];

export function IntentionStep({ 
  onNext, 
  onBack,
  selectedIntentions = []
}: IntentionStepProps) {
  const [selectedOption, setSelectedOption] = useState<string>(
    selectedIntentions.length > 0 ? 
    INTENTION_OPTIONS.some(opt => opt.text === selectedIntentions[0]) ? 
      INTENTION_OPTIONS.find(opt => opt.text === selectedIntentions[0])?.id || 'pray3' : 
      'custom' : 
    'pray3'
  );
  
  const [customIntention, setCustomIntention] = useState<string>(
    selectedIntentions.length > 0 && !INTENTION_OPTIONS.some(opt => opt.text === selectedIntentions[0]) ? 
      selectedIntentions[0] : 
      ''
  );
  
  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    
    // Provide haptic feedback on selection
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };
  
  const handleNext = () => {
    let intention: string;
    
    if (selectedOption === 'custom' && customIntention.trim()) {
      intention = customIntention.trim();
    } else {
      const selected = INTENTION_OPTIONS.find(opt => opt.id === selectedOption);
      intention = selected ? selected.text : '';
    }
    
    if (intention) {
      onNext([intention]);
    }
  };
  
  // Determine if we can proceed
  const canProceed = selectedOption !== 'custom' || (selectedOption === 'custom' && customIntention.trim() !== '');
  
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
              <span className="text-3xl">🎯</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center">Set Your Intention</h2>
          
          <p className="text-center text-muted-foreground mb-4">
            What's your spiritual intention for this week?
          </p>
          
          <div className="space-y-4 mt-2">
            <RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
              {INTENTION_OPTIONS.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent transition-colors">
                    <RadioGroupItem value={option.id} id={`intention-${option.id}`} />
                    <Label 
                      htmlFor={`intention-${option.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{option.text}</div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </Label>
                  </div>
                </motion.div>
              ))}
            </RadioGroup>
            
            {/* Custom intention input */}
            {selectedOption === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-3"
              >
                <Input
                  value={customIntention}
                  onChange={(e) => setCustomIntention(e.target.value)}
                  placeholder="Enter your intention..."
                  className="w-full"
                />
              </motion.div>
            )}
          </div>
          
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: canProceed ? 1 : 0.5, scale: canProceed ? 1 : 0.95 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-primary font-medium text-lg">
              You've set your intention.
            </div>
            <div className="text-sm text-muted-foreground">
              Mulvi will help you hold it.
            </div>
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
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
