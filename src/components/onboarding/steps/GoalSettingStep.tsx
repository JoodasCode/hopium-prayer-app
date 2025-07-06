'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GOAL_OPTIONS } from '@/types/onboarding';

interface GoalSettingStepProps {
  onNext: () => void;
  onPrevious?: () => void;
  onDataUpdate?: (data: any) => void;
  data?: any;
  isLoading?: boolean;
}

export default function GoalSettingStep({ 
  onNext, 
  onPrevious, 
  onDataUpdate, 
  data, 
  isLoading 
}: GoalSettingStepProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(data?.spiritualGoals || []);

  const toggleGoal = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId];
    
    setSelectedGoals(newGoals);
    onDataUpdate?.({ spiritualGoals: newGoals });
  };

  const handleNext = () => {
    onDataUpdate?.({ spiritualGoals: selectedGoals });
    onNext();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Set your goals</h2>
          <p className="text-muted-foreground">What would you like to achieve?</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {GOAL_OPTIONS.map((goal) => {
              const isSelected = selectedGoals.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isSelected 
                      ? "border-primary bg-primary/10" 
                      : "border-border bg-background"
                  )}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{goal.label}</p>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious} disabled={isLoading} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button onClick={handleNext} disabled={isLoading} className="flex-1">
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
      </div>
    </div>
  );
} 