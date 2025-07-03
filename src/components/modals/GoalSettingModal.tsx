'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Target, X, Calendar, Flag, Award, CheckCircle2 } from "lucide-react";

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  value: number;
}

interface GoalSettingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetGoal: (goalType: string, value: number) => void;
  currentStreak: number;
  onDismiss: () => void;
}

export function GoalSettingModal({
  open,
  onOpenChange,
  onSetGoal,
  currentStreak,
  onDismiss,
}: GoalSettingModalProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [customValue, setCustomValue] = useState(7);
  const [loading, setLoading] = useState(false);

  // Goal options
  const goalOptions: GoalOption[] = [
    {
      id: "consistent_7",
      title: "7-Day Consistency",
      description: "Complete all daily prayers for 7 consecutive days",
      icon: <Calendar className="h-4 w-4 text-primary" />,
      value: 7
    },
    {
      id: "consistent_30",
      title: "Monthly Devotion",
      description: "Complete all daily prayers for 30 consecutive days",
      icon: <Flag className="h-4 w-4 text-indigo-500" />,
      value: 30
    },
    {
      id: "streak_milestone",
      title: `${Math.max(30, Math.ceil((currentStreak + 10) / 10) * 10)}-Day Milestone`,
      description: `Reach a ${Math.max(30, Math.ceil((currentStreak + 10) / 10) * 10)}-day prayer streak`,
      icon: <Award className="h-4 w-4 text-amber-500" />,
      value: Math.max(30, Math.ceil((currentStreak + 10) / 10) * 10)
    },
    {
      id: "custom_streak",
      title: "Custom Goal",
      description: "Set your own prayer streak goal",
      icon: <Target className="h-4 w-4 text-emerald-500" />,
      value: customValue
    }
  ];

  const handleSetGoal = async () => {
    if (!selectedGoalId) return;
    
    setLoading(true);
    try {
      const selectedGoal = goalOptions.find(goal => goal.id === selectedGoalId);
      if (selectedGoal) {
        const value = selectedGoal.id === "custom_streak" ? customValue : selectedGoal.value;
        await onSetGoal(selectedGoalId, value);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error setting goal:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get suggested goal based on current streak
  const getSuggestedGoalId = () => {
    if (currentStreak < 5) return "consistent_7";
    if (currentStreak < 25) return "consistent_30";
    return "streak_milestone";
  };

  // Calculate progress towards goal if already in progress
  const calculateProgress = (goalValue: number) => {
    return Math.min(100, (currentStreak / goalValue) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Set Prayer Goal
          </DialogTitle>
          <DialogDescription>
            Setting goals helps you build a consistent prayer habit
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Current Streak */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current streak</p>
                <p className="font-medium">{currentStreak} days</p>
              </div>
            </div>
          </div>
          
          {/* Goal Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Choose a goal</h4>
            <div className="space-y-3">
              {goalOptions.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-start space-x-3 border rounded-lg p-3 cursor-pointer transition-colors ${selectedGoalId === goal.id ? 'border-primary/70 bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  onClick={() => setSelectedGoalId(goal.id)}
                >
                  <Checkbox 
                    checked={selectedGoalId === goal.id}
                    onCheckedChange={() => setSelectedGoalId(goal.id)}
                    className="mt-1"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center">
                      {goal.icon}
                      <h5 className="ml-2 font-medium text-sm">{goal.title}</h5>
                    </div>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                    
                    {/* Custom goal slider */}
                    {goal.id === "custom_streak" && selectedGoalId === "custom_streak" && (
                      <div className="pt-3">
                        <Slider
                          value={[customValue]}
                          min={1}
                          max={100}
                          step={1}
                          className="w-full"
                          onValueChange={(values) => setCustomValue(values[0])}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-muted-foreground">1 day</span>
                          <span className="text-xs font-medium">{customValue} days</span>
                          <span className="text-xs text-muted-foreground">100 days</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Progress indicator if current streak exists */}
                    {currentStreak > 0 && goal.id !== "custom_streak" && (
                      <div className="pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Progress: {Math.min(100, Math.floor(calculateProgress(goal.value)))}%
                          </span>
                          <span>
                            {currentStreak}/{goal.value} days
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full mt-1.5">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${calculateProgress(goal.value)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-primary/5 rounded-lg p-3 text-sm">
            <p>"Setting clear goals and celebrating milestones keeps you motivated on your spiritual journey."</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            onClick={handleSetGoal} 
            className="w-full" 
            disabled={!selectedGoalId || loading}
          >
            Set This Goal
          </Button>
          <Button
            variant="ghost"
            onClick={onDismiss}
            className="w-full"
          >
            Remind Me Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
