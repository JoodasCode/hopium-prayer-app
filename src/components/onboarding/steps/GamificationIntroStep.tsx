'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Trophy, Star, Zap } from 'lucide-react';

interface GamificationIntroStepProps {
  onNext: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
}

export default function GamificationIntroStep({ onNext, onPrevious, isLoading }: GamificationIntroStepProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Level up your practice</h2>
          <p className="text-muted-foreground">Earn points and unlock achievements</p>
        </div>

        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-medium">Earn XP Points</p>
                  <p className="text-sm text-muted-foreground">25 XP per prayer completed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium">Unlock Badges</p>
                  <p className="text-sm text-muted-foreground">16 achievements to discover</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="font-medium">Climb Leaderboards</p>
                  <p className="text-sm text-muted-foreground">Compete with the community</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious} disabled={isLoading} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button onClick={onNext} disabled={isLoading} className="flex-1">
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