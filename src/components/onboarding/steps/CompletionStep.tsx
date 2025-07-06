/**
 * Completion Step for the enhanced onboarding flow
 * Celebrates completion and transitions to main app
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompletionStepProps {
  onNext: () => void;
  data?: any;
  isLoading?: boolean;
}

export default function CompletionStep({ onNext, data, isLoading }: CompletionStepProps) {
  
  useEffect(() => {
    // Trigger celebration animation
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Success Animation */}
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome to Mulvi! 🎉
            </h1>
            <p className="text-lg text-muted-foreground">
              Your spiritual journey starts now
            </p>
          </div>
        </div>

        {/* Achievement Summary */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-center mb-4">
              You've already achieved so much:
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">First prayer logged</span>
                <span className="ml-auto text-xs text-primary">+25 XP</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">1-day streak started</span>
                <span className="ml-auto text-xs text-primary">🔥</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium">"First Steps" badge earned</span>
                <span className="ml-auto text-xs text-primary">🏆</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Onboarding completed</span>
                <span className="ml-auto text-xs text-primary">+50 XP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Preview */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">What's next?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Set up your next prayer reminder</p>
              <p>• Explore your personalized dashboard</p>
              <p>• Check out your analytics and insights</p>
              <p>• Join the community leaderboard</p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
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
              Enter Dashboard
              <Sparkles className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Encouragement */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Your spiritual journey is unique and personal
          </p>
          <p className="text-xs text-muted-foreground">
            Take it one prayer at a time 🤲
          </p>
        </div>
      </div>
    </div>
  );
}
