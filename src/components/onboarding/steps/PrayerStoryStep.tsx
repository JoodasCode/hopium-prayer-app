/**
 * Prayer Story Step for the enhanced onboarding flow
 * Captures user's prayer journey background
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrayerStoryStepProps {
  onNext: (prayerStory: string) => void;
  onBack: () => void;
  selectedStory?: string;
}

type StoryOption = {
  id: string;
  text: string;
  description: string;
};

const STORY_OPTIONS: StoryOption[] = [
  { 
    id: 'returning', 
    text: 'Returning after a break', 
    description: 'Coming back to prayer after time away'
  },
  { 
    id: 'beginning', 
    text: 'Just starting my journey', 
    description: 'New to consistent prayer practice'
  },
  { 
    id: 'maintaining', 
    text: 'Maintaining my practice', 
    description: 'Already pray regularly'
  },
  { 
    id: 'deepening', 
    text: 'Seeking deeper connection', 
    description: 'Looking to enhance spiritual experience'
  },
];

export function PrayerStoryStep({ 
  onNext, 
  onBack,
  selectedStory = ''
}: PrayerStoryStepProps) {
  const [selected, setSelected] = useState<string>(selectedStory);
  
  const handleSelect = (storyId: string) => {
    setSelected(storyId);
    
    // Provide haptic feedback on selection
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };
  
  const handleNext = () => {
    // Find the text of the selected story
    const storyText = STORY_OPTIONS.find(option => option.id === selected)?.text || selected;
    onNext(storyText);
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
              <span className="text-3xl">📖</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center">Your Prayer Story</h2>
          
          <p className="text-center text-muted-foreground mb-4">
            Understanding where you are in your journey helps us personalize your experience
          </p>
          
          <div className="space-y-3">
            {STORY_OPTIONS.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Button
                  variant={selected === option.id ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-3 ${selected === option.id ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => handleSelect(option.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{option.text}</span>
                    <span className="text-sm opacity-80">{option.description}</span>
                  </div>
                  {selected === option.id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
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
            disabled={!selected}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
