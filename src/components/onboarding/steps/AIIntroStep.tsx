'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Bot, MessageCircle, Lightbulb } from 'lucide-react';

interface AIIntroStepProps {
  onNext: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
}

export default function AIIntroStep({ onNext, onPrevious, isLoading }: AIIntroStepProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Meet your spiritual assistant</h2>
          <p className="text-muted-foreground">AI-powered insights for your prayer journey</p>
        </div>

        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium">Personalized Guidance</p>
                  <p className="text-sm text-muted-foreground">Get advice tailored to your practice</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-medium">Smart Insights</p>
                  <p className="text-sm text-muted-foreground">Discover patterns in your spiritual habits</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="font-medium">24/7 Support</p>
                  <p className="text-sm text-muted-foreground">Always here when you need guidance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm italic text-muted-foreground">
                  "Based on your goals, I recommend starting with consistent Fajr prayers to build momentum..."
                </p>
                <p className="text-xs text-right mt-2 text-primary">- Your AI Assistant</p>
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