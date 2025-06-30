'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowRight, Moon, Sun, User, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to dashboard
      router.push('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Hopium</h1>
          <p className="text-muted-foreground">Let's set up your prayer experience</p>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div 
                key={step}
                className={`w-3 h-3 rounded-full ${currentStep >= step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>
        
        {/* Step content */}
        <Card className="mb-6">
          <CardContent className="pt-6 pb-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-center">What should we call you?</h2>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-3 border border-border rounded-md bg-background"
                />
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Sun className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-center">Choose your theme</h2>
                <p className="text-center text-muted-foreground mb-4">Select light or dark mode for your prayer journey</p>
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-center">Prayer notifications</h2>
                <p className="text-center text-muted-foreground mb-4">Would you like to receive prayer time reminders?</p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={handleNext}>No thanks</Button>
                  <Button onClick={handleNext}>Yes, remind me</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Navigation */}
        {currentStep < 3 && (
          <Button 
            className="w-full" 
            onClick={handleNext}
            disabled={currentStep === 1 && !name.trim()}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
