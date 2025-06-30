'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PrayerMode() {
  const [isActive, setIsActive] = useState(false);
  
  const handleActivate = () => {
    if (isActive) {
      // Exit prayer mode
      setIsActive(false);
      return;
    }
    
    // Enter prayer mode
    setIsActive(true);
    
    // In a real implementation, this would:
    // 1. Enable do-not-disturb mode
    // 2. Show breathing/focus overlay
    // 3. Set a timer for prayer duration
    
    // For demo purposes, we'll just show an alert
    alert('Prayer Mode activated. In a real implementation, this would enable focus mode and disable notifications.');
  };
  
  return (
    <Card className="mb-4 shadow-sm border-border">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-2">
          <Button 
            variant="secondary"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleActivate}
          >
            <span className="text-xl">🧘</span>
            <span>PRAYER MODE</span>
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Distraction-free focus for prayer
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
