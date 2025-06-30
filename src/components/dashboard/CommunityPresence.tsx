'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Prayer = {
  id: string;
  name: string;
  time: string;
};

export function CommunityPresence({ currentPrayer }: { currentPrayer?: Prayer }) {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [prayerAction, setPrayerAction] = useState<string>('');
  
  // Generate realistic but fake community data
  useEffect(() => {
    // Generate a random number between 80-250 for active users
    const generateCount = () => Math.floor(Math.random() * 170) + 80;
    
    // Determine prayer action based on time of day
    const determineAction = () => {
      const hour = new Date().getHours();
      
      // If we have a current prayer, use that
      if (currentPrayer) {
        // 50% chance of "just prayed" vs "preparing for"
        return Math.random() > 0.5 
          ? `just prayed ${currentPrayer.name}` 
          : `preparing for ${currentPrayer.name}`;
      }
      
      // Fallbacks based on time of day
      if (hour >= 4 && hour < 12) {
        return 'prayed Fajr today';
      } else if (hour >= 12 && hour < 15) {
        return 'prayed Dhuhr today';
      } else if (hour >= 15 && hour < 18) {
        return 'prayed Asr today';
      } else if (hour >= 18 && hour < 20) {
        return 'prayed Maghrib today';
      } else {
        return 'prayed Isha today';
      }
    };
    
    // Set initial values
    setUserCount(generateCount());
    setPrayerAction(determineAction());
    
    // Update values every 30-60 seconds
    const interval = setInterval(() => {
      // 30% chance to update the count
      if (Math.random() < 0.3) {
        setUserCount(generateCount());
      }
      
      // 20% chance to update the action
      if (Math.random() < 0.2) {
        setPrayerAction(determineAction());
      }
    }, Math.floor(Math.random() * 30000) + 30000); // 30-60 seconds
    
    return () => clearInterval(interval);
  }, [currentPrayer]);
  
  if (!userCount) return null;
  
  return (
    <div className="flex items-center justify-center py-2">
      <Badge variant="outline" className="bg-primary/5 text-muted-foreground px-3 py-1 text-xs flex items-center gap-1.5">
        <Users className="h-3 w-3" />
        <span>{userCount} Muslims {prayerAction}</span>
      </Badge>
    </div>
  );
}
