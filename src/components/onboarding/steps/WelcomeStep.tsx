/**
 * Welcome step for the enhanced onboarding flow
 * First impression of the Mulvi app experience
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
  isLoading?: boolean;
}

export default function WelcomeStep({ onNext, isLoading }: WelcomeStepProps) {
  return (
    <div className="w-full space-y-6 p-4">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          {/* App Icon/Logo placeholder */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-10 w-10 text-primary-foreground" />
          </div>
          
          {/* Welcome Message */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Welcome to Mulvi
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Build unbreakable habits, track what matters, and level up your spiritual journey.
            </p>
          </div>
        </div>

        {/* Visual Preview Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Streak Preview */}
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium">Current Streak</span>
                </div>
                <span className="text-sm font-bold text-primary">0 days</span>
              </div>
              
              {/* Progress Preview */}
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm font-medium">Today's Progress</span>
                </div>
                <span className="text-sm font-bold text-muted-foreground">0/5</span>
              </div>
              
              {/* XP Preview */}
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <span className="text-sm font-medium">Experience Points</span>
                </div>
                <span className="text-sm font-bold text-muted-foreground">0 XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        <div className="space-y-4">
          <Button 
            onClick={onNext}
            disabled={isLoading}
            size="lg"
            className="w-full h-12 text-base font-medium"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Takes less than 3 minutes to set up
          </p>
        </div>
    </div>
  );
}
