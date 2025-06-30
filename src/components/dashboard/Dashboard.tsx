'use client';

import { useState } from 'react';
import { NextPrayerCard } from './NextPrayerCard';
import { TodaysPrayers } from './TodaysPrayers';
import { SmartTip } from './SmartTip';
import { StreakOverview } from './StreakOverview';
import { prayers, getNextPrayer, type Prayer } from './data';

export function Dashboard() {
  // Core state for prayer tracking
  const [completedPrayers, setCompletedPrayers] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(3); // User's current prayer streak
  const [bestStreak, setBestStreak] = useState(7); // User's best prayer streak
  
  // Mock data for streak visualization - 5 prayers per day (all true or all false)
  const [recentDays] = useState<boolean[]>([
    true, true, true, true, true, true, true, // Week 1 - all completed
    true, true, true, true, true, true, true  // Week 2 - all completed
  ]);
  
  const handlePrayerComplete = (prayerId: string) => {
    if (!completedPrayers.includes(prayerId)) {
      const newCompletedPrayers = [...completedPrayers, prayerId];
      setCompletedPrayers(newCompletedPrayers);
      
      // Update streak if this completes today's prayers
      if (newCompletedPrayers.length === prayers.length) {
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
      }
    }
  };
  
  const nextPrayer = getNextPrayer(prayers);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 container max-w-md mx-auto px-4 pb-20">
        <div className="py-4 space-y-6">
          {/* 1. Next Prayer Card - The main focus */}
          <NextPrayerCard 
            nextPrayer={nextPrayer as Prayer | null}
            onPrayerComplete={handlePrayerComplete}
          />
          
          {/* 2. Today's Prayers - Horizontal scrollable list */}
          <TodaysPrayers 
            prayers={prayers} 
            completedPrayers={completedPrayers} 
            nextPrayerId={nextPrayer?.id} 
          />
          
          {/* 3. Smart Tip - Helpful advice */}
          <SmartTip />
          
          {/* 4. Streak Overview - Calendar heatmap */}
          <StreakOverview 
            currentStreak={currentStreak} 
            bestStreak={bestStreak} 
            recentDays={recentDays} 
          />
        </div>
      </div>
    </div>
  );
}
