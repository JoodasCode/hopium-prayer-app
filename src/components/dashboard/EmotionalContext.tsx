'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

type EmotionalContextProps = {
  currentEmotion: string;
};

export function EmotionalContext({ currentEmotion }: EmotionalContextProps) {
  const [showAIMessage, setShowAIMessage] = useState(false);
  
  // Get color based on emotion
  const getEmotionColor = () => {
    switch (currentEmotion) {
      case 'peaceful': return 'text-blue-500';
      case 'grateful': return 'text-green-500';
      case 'reflective': return 'text-purple-500';
      case 'hopeful': return 'text-amber-500';
      case 'connected': return 'text-red-500';
      default: return '';
    }
  };
  
  // AI message based on emotion
  const getAIMessage = () => {
    switch (currentEmotion) {
      case 'peaceful':
        return "Finding peace in prayer brings clarity to your day. Remember to breathe deeply and embrace this moment of tranquility.";
      case 'grateful':
        return "Gratitude opens the heart to receive more blessings. Reflect on the gifts in your life as you prepare for prayer.";
      case 'reflective':
        return "Reflection leads to growth. Use this prayer time to contemplate your journey and set intentions for your path forward.";
      case 'hopeful':
        return "Hope is the light that guides us through challenges. Let your prayers be filled with optimism for what lies ahead.";
      case 'connected':
        return "You are part of something greater. Feel the connection to your faith community as you engage in this sacred practice.";
      default:
        return "Your emotions are valid and important. Bring your authentic self to your prayers today.";
    }
  };
  
  return (
    <div className="mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentEmotion && (
                  <div className={`w-3 h-3 rounded-full ${getEmotionColor().replace('text-', 'bg-')}`}></div>
                )}
                <div>
                  <h3 className="text-sm font-medium">Emotional State</h3>
                  <p className={`text-sm capitalize ${getEmotionColor()}`}>{currentEmotion || 'Select an emotion'}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAIMessage(!showAIMessage)}
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-3 w-3" />
                <span>{showAIMessage ? 'Hide' : 'Show'} Insight</span>
              </Button>
            </div>
            
            {showAIMessage && (
              <div className="bg-primary/5 p-4 rounded-md text-sm animate-fadeIn border border-primary/10">
                <p className="text-muted-foreground">{getAIMessage()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
