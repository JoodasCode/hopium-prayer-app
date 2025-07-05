'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/cn';

type EmotionTrackerProps = {
  currentEmotion: string;
  onEmotionSelect: (emotion: string) => void;
};

type Emotion = {
  name: string;
  color: string;
  label: string;
};

export function EmotionTracker({ currentEmotion, onEmotionSelect }: EmotionTrackerProps) {
  const emotions: Emotion[] = [
    { name: 'peaceful', color: 'bg-chart-1', label: 'Peaceful' },
    { name: 'grateful', color: 'bg-chart-2', label: 'Grateful' },
    { name: 'reflective', color: 'bg-chart-3', label: 'Reflective' },
    { name: 'hopeful', color: 'bg-chart-4', label: 'Hopeful' },
    { name: 'connected', color: 'bg-chart-5', label: 'Connected' },
  ];
  
  const handleEmotionClick = (emotion: string) => {
    onEmotionSelect(emotion);
  };
  
  return (
    <Card className="mb-4 shadow-sm border-0">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">How do you feel today?</h3>
            <span className="text-xs text-muted-foreground">
              {currentEmotion ? emotions.find(e => e.name === currentEmotion)?.label : 'Select'}
            </span>
          </div>
          
          <div className="flex justify-between">
            {emotions.map((emotion) => (
              <button 
                key={emotion.name}
                className="flex flex-col items-center gap-1 group"
                onClick={() => handleEmotionClick(emotion.name)}
              >
                <div 
                  className={cn(
                    'w-8 h-8 rounded-full transition-all duration-200',
                    emotion.color,
                    currentEmotion === emotion.name 
                      ? 'ring-2 ring-primary ring-offset-2 scale-110' 
                      : 'opacity-70 group-hover:opacity-100'
                  )}
                />
                <span className="text-[10px] opacity-80 group-hover:opacity-100">
                  {emotion.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
