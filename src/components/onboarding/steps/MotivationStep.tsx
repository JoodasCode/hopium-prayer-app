/**
 * Motivation step for the enhanced onboarding flow
 * Captures user's emotional motivations for prayer journey
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface MotivationStepProps {
  onNext: (motivations: string[]) => void;
  onBack?: () => void;
  selectedMotivations?: string[];
}

type Motivation = {
  id: string;
  text: string;
  icon: string;
};

const MOTIVATIONS: Motivation[] = [
  { id: 'reconnect', text: 'I want to reconnect with prayer', icon: '🙏' },
  { id: 'peace', text: 'I need peace from my hectic life', icon: '🧘' },
  { id: 'reminders', text: 'I keep forgetting and missing prayers', icon: '⏱' },
  { id: 'habit', text: 'I want to form a habit', icon: '💭' },
  { id: 'other', text: 'Other reason', icon: '✍️' },
];

export function MotivationStep({ 
  onNext, 
  onBack,
  selectedMotivations = [] 
}: MotivationStepProps) {
  const [selected, setSelected] = useState<string[]>(selectedMotivations);
  const [otherReason, setOtherReason] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(selectedMotivations.includes('other'));
  
  const toggleMotivation = (id: string) => {
    if (id === 'other') {
      setShowOtherInput(!showOtherInput);
    }
    
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
    
    // Provide haptic feedback on selection
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  };
  
  const handleNext = () => {
    const motivations = selected.filter(id => id !== 'other' || otherReason.trim() !== '');
    
    // If 'other' is selected and has content, include the custom reason
    if (selected.includes('other') && otherReason.trim() !== '') {
      onNext([...motivations.filter(id => id !== 'other'), otherReason.trim()]);
    } else {
      onNext(motivations);
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
              <span className="text-3xl">🧠</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center">Why Are You Here?</h2>
          
          <p className="text-center text-muted-foreground mb-4">
            Tap one or more reasons that brought you to Mulvi
          </p>
          
          <div className="space-y-3">
            {MOTIVATIONS.map((motivation, index) => (
              <motion.div
                key={motivation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Button
                  variant={selected.includes(motivation.id) ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-3 ${selected.includes(motivation.id) ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => toggleMotivation(motivation.id)}
                >
                  <span className="mr-3 text-xl">{motivation.icon}</span>
                  <span>{motivation.text}</span>
                  {selected.includes(motivation.id) && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            ))}
            
            {showOtherInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Tell us your reason..."
                  className="w-full p-3 border border-border rounded-md bg-background mt-2"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
        
        <div className="flex justify-between pt-4">
          {onBack && (
            <Button 
              variant="ghost" 
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button 
            onClick={handleNext}
            disabled={selected.length === 0 || (selected.includes('other') && otherReason.trim() === '')}
            className={`${onBack ? '' : 'w-full'}`}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
