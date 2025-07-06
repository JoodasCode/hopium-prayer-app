'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, TrendingUp, BarChart3, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValueDiscoveryStepProps {
  onNext: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
}

const slides = [
  {
    id: 'habits',
    icon: TrendingUp,
    title: 'Build unbreakable habits',
    description: 'Track your consistency with visual streaks that motivate you to keep going, just like your favorite productivity apps.',
    preview: (
      <div className="space-y-2">
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div 
              key={i}
              className={cn(
                "w-6 h-6 rounded-sm",
                i < 5 ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">5-day streak</p>
      </div>
    )
  },
  {
    id: 'tracking',
    icon: BarChart3,
    title: 'Track what matters',
    description: 'Get clear insights into your spiritual progress with clean analytics that help you understand your patterns.',
    preview: (
      <div className="space-y-3">
        <div className="flex items-end gap-2 h-16">
          {[60, 80, 45, 90, 75].map((height, i) => (
            <div 
              key={i}
              className="bg-primary rounded-t flex-1"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">Weekly completion</p>
      </div>
    )
  },
  {
    id: 'community',
    icon: Users,
    title: 'Level up together',
    description: 'Join a community of achievers and climb the leaderboards while maintaining your spiritual focus.',
    preview: (
      <div className="space-y-2">
        {[
          { name: 'You', rank: 12, xp: 1250, highlight: true },
          { name: 'Ahmad', rank: 11, xp: 1280, highlight: false },
          { name: 'Sarah', rank: 13, xp: 1220, highlight: false }
        ].map((user, i) => (
          <div 
            key={i}
            className={cn(
              "flex items-center justify-between p-2 rounded text-xs",
              user.highlight ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
            )}
          >
            <span className={cn("font-medium", user.highlight && "text-primary")}>
              #{user.rank} {user.name}
            </span>
            <span className="text-muted-foreground">{user.xp} XP</span>
          </div>
        ))}
      </div>
    )
  }
];

export default function ValueDiscoveryStep({ onNext, onPrevious, isLoading }: ValueDiscoveryStepProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  const nextSlide = () => {
    if (isLastSlide) {
      onNext();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (isFirstSlide && onPrevious) {
      onPrevious();
    } else if (!isFirstSlide) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const currentSlideData = slides[currentSlide];
  const IconComponent = currentSlideData.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Slide Indicators */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentSlide 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Main Content Card */}
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
              <IconComponent className="h-8 w-8 text-primary" />
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                {currentSlideData.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {currentSlideData.description}
              </p>
            </div>

            {/* Preview */}
            <div className="bg-background/50 rounded-lg p-4">
              {currentSlideData.preview}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {(onPrevious || !isFirstSlide) && (
            <Button
              variant="outline"
              onClick={prevSlide}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button
            onClick={nextSlide}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLastSlide ? 'Continue' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Progress text */}
        <p className="text-center text-xs text-muted-foreground">
          {currentSlide + 1} of {slides.length} • Discover what makes Mulvi different
        </p>
      </div>
    </div>
  );
} 