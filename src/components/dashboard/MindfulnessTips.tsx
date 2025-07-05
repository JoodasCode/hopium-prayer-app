'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

type TipCategory = 'routine' | 'momentum' | 'stillness' | 'encouragement' | 'mindfulness' | 'emotional';

type Tip = {
  id: number;
  text: string;
  category: TipCategory;
  condition: string; // Description of when this tip should be shown
};

// AI-driven mindfulness tips based on user behavior patterns
const mulviTips: Tip[] = [
  { 
    id: 1, 
    text: "You've been consistent with Fajr this week. Notice how morning prayers set a different tone for your day.", 
    category: 'momentum',
    condition: 'consistent morning prayers'
  },
  { 
    id: 2, 
    text: "You've missed Asr twice this week. Try setting a gentle reminder 15 minutes before the prayer time.", 
    category: 'routine',
    condition: 'missed afternoon prayers'
  },
  { 
    id: 3, 
    text: "Your emotions have been peaceful lately. Try to hold that serenity for a moment after your prayer ends.", 
    category: 'stillness',
    condition: 'peaceful emotion selected multiple times'
  },
  { 
    id: 4, 
    text: "Welcome back to prayer. Remember that consistency builds slowly - each prayer is its own victory.", 
    category: 'encouragement',
    condition: 'first prayer after long absence'
  },
  { 
    id: 5, 
    text: "You often log prayers quickly. Today, try staying on your prayer mat for three extra breaths afterward.", 
    category: 'mindfulness',
    condition: 'quick prayer logging pattern'
  },
  { 
    id: 6, 
    text: "You've selected 'reflective' as your emotion. Use this contemplative state to consider what you're grateful for today.", 
    category: 'emotional',
    condition: 'reflective emotion selected'
  },
  { 
    id: 7, 
    text: "Three day streak! How does this consistency feel in your body? Notice any differences in your daily rhythm.", 
    category: 'momentum',
    condition: '3+ day streak'
  },
  { 
    id: 8, 
    text: "Isha has been challenging lately. Consider a simpler evening routine that leads naturally into prayer time.", 
    category: 'routine',
    condition: 'missed evening prayers'
  },
  { 
    id: 9, 
    text: "Not every day will be perfect. But today is still yours to shape with intention and presence.", 
    category: 'encouragement',
    condition: 'broken streak'
  },
  { 
    id: 10, 
    text: "Try softening your breath before you stand for prayer. This small moment of preparation can deepen your experience.", 
    category: 'mindfulness',
    condition: 'general tip'
  },
];

type MindfulnessTipsProps = {
  prayerName?: string;
  userEmotion?: string;
  streak?: number;
  missedPrayers?: string[];
};

export function MindfulnessTips({ 
  prayerName, 
  userEmotion = '', 
  streak = 0, 
  missedPrayers = [] 
}: MindfulnessTipsProps) {
  const [currentTip, setCurrentTip] = useState<Tip>(mulviTips[9]); // Default to a general tip
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  // Simulate Mulvi AI selecting the most relevant tip based on user behavior
  const getPersonalizedTip = () => {
    // This would eventually be a more sophisticated algorithm
    // For now, we'll use some simple logic based on the props
    
    if (streak >= 3) {
      return mulviTips.find(tip => tip.category === 'momentum' && tip.id === 7) || mulviTips[9];
    }
    
    if (streak === 0 || streak === 1) {
      return mulviTips.find(tip => tip.category === 'encouragement') || mulviTips[9];
    }
    
    if (missedPrayers.includes('asr')) {
      return mulviTips.find(tip => tip.id === 2) || mulviTips[9];
    }
    
    if (missedPrayers.includes('isha')) {
      return mulviTips.find(tip => tip.id === 8) || mulviTips[9];
    }
    
    if (userEmotion === 'reflective') {
      return mulviTips.find(tip => tip.id === 6) || mulviTips[9];
    }
    
    if (userEmotion === 'peaceful') {
      return mulviTips.find(tip => tip.id === 3) || mulviTips[9];
    }
    
    // Default to a random tip if no conditions match
    const randomIndex = Math.floor(Math.random() * mulviTips.length);
    return mulviTips[randomIndex];
  };
  
  const refreshTip = () => {
    setCurrentTip(getPersonalizedTip());
    setFeedbackGiven(false);
  };
  
  const giveFeedback = (helpful: boolean) => {
    // In a real app, this would send feedback to the AI system
    // to improve future recommendations
    setFeedbackGiven(true);
  };
  
  useEffect(() => {
    // Get a personalized tip when component mounts or when key props change
    setCurrentTip(getPersonalizedTip());
  }, [prayerName, userEmotion, streak]);
  
  return (
    <Card className="mb-4 bg-card/80 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-medium">Mulvi Suggests</h3>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                AI-powered
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {currentTip.text}
            </p>
            
            {!feedbackGiven ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => giveFeedback(true)}
                  className="text-xs px-2 py-0 h-7"
                >
                  Helpful
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => giveFeedback(false)}
                  className="text-xs px-2 py-0 h-7"
                >
                  Not for me
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshTip}
                  className="text-xs px-2 py-0 h-7 ml-auto"
                >
                  New Tip
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Thanks for your feedback</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshTip}
                  className="text-xs px-2 py-0 h-7"
                >
                  New Tip
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
