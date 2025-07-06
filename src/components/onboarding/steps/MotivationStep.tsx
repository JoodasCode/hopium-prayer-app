/**
 * Motivation step for the enhanced onboarding flow
 * Captures user's emotional motivations for prayer journey
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Check, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { MOTIVATION_OPTIONS } from '@/types/onboarding';

// Temporary inline options until we fix the import
const MOTIVATION_OPTIONS = [
  {
    id: 'consistency',
    label: 'Build consistency',
    description: 'Never miss a prayer again',
    icon: '🎯'
  },
  {
    id: 'progress',
    label: 'Track progress', 
    description: 'See your spiritual growth over time',
    icon: '📈'
  },
  {
    id: 'accountability',
    label: 'Stay accountable',
    description: 'Keep yourself motivated with gentle reminders',
    icon: '⏰'
  },
  {
    id: 'growth',
    label: 'Personal growth',
    description: 'Develop a deeper spiritual practice',
    icon: '🌱'
  },
  {
    id: 'other',
    label: 'Something else',
    description: 'Tell us your specific goal',
    icon: '✍️'
  }
];

interface MotivationStepProps {
  onNext: () => void;
  onPrevious?: () => void;
  onDataUpdate?: (data: any) => void;
  data?: any;
  isLoading?: boolean;
}

export default function MotivationStep({ 
  onNext, 
  onPrevious, 
  onDataUpdate,
  data,
  isLoading 
}: MotivationStepProps) {
  const [selected, setSelected] = useState<string[]>(data?.motivations || []);
  const [customMotivation, setCustomMotivation] = useState(data?.customMotivation || '');
  const [showCustomInput, setShowCustomInput] = useState(data?.customMotivation ? true : false);

  const toggleMotivation = (motivation: string) => {
    let newSelected: string[];
    
    if (motivation === 'other') {
      setShowCustomInput(!showCustomInput);
      if (showCustomInput) {
        // Removing custom option
        newSelected = selected.filter(item => item !== 'other');
        setCustomMotivation('');
      } else {
        // Adding custom option
        newSelected = selected.includes('other') ? selected : [...selected, 'other'];
      }
    } else {
      if (selected.includes(motivation)) {
        newSelected = selected.filter(item => item !== motivation);
      } else {
        newSelected = [...selected, motivation];
      }
    }
    
    setSelected(newSelected);
    onDataUpdate?.({ 
      motivations: newSelected,
      customMotivation: motivation === 'other' && !showCustomInput ? '' : customMotivation
    });
  };

  const handleCustomMotivationChange = (value: string) => {
    setCustomMotivation(value);
    onDataUpdate?.({ 
      motivations: selected,
      customMotivation: value
    });
  };

  const handleNext = () => {
    const finalMotivations = selected.filter(m => m !== 'other');
    if (selected.includes('other') && customMotivation.trim()) {
      finalMotivations.push(customMotivation.trim());
    }
    
    onDataUpdate?.({ 
      motivations: finalMotivations,
      customMotivation: customMotivation.trim()
    });
    onNext();
  };

  const canContinue = selected.length > 0 && (!selected.includes('other') || customMotivation.trim());

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            What's your goal?
          </h2>
          <p className="text-muted-foreground">
            Help us personalize your experience by sharing what you want to achieve
          </p>
        </div>

        {/* Motivation Options */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {MOTIVATION_OPTIONS.map((motivation) => {
                const isSelected = selected.includes(motivation.id);
                return (
                  <button
                    key={motivation.id}
                    onClick={() => toggleMotivation(motivation.id)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isSelected 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border bg-background"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{motivation.icon}</span>
                        <div>
                          <p className="font-medium">{motivation.label}</p>
                          {motivation.description && (
                            <p className="text-sm text-muted-foreground">
                              {motivation.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom motivation input */}
            {showCustomInput && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tell us your specific goal:
                </label>
                <Input
                  value={customMotivation}
                  onChange={(e) => handleCustomMotivationChange(e.target.value)}
                  placeholder="e.g., I want to pray with more focus and presence"
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {onPrevious && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={!canContinue || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Helper text */}
        <p className="text-center text-xs text-muted-foreground">
          Select all that apply • This helps us give you relevant tips and challenges
        </p>
      </div>
    </div>
  );
}
