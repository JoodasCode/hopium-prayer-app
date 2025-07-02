'use client';

import { useState } from 'react';
import { NextPrayerCard } from './NextPrayerCard';
import { TodaysPrayers } from './TodaysPrayers';
import { SmartTip } from './SmartTip';
import { StreakOverview } from './StreakOverview';
import { CommunityPresence } from './CommunityPresence';
import { KnowledgeSearchCard } from './KnowledgeSearchCard';
import { prayers, getNextPrayer, type Prayer } from './data';
import BottomNav from '@/components/shared/BottomNav';

export function Dashboard() {
  // Core state for prayer tracking
  const [completedPrayers, setCompletedPrayers] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(3);
  const [bestStreak, setBestStreak] = useState<number>(7);
  
  // Mock data for streak visualization
  const [recentDays] = useState<boolean[]>([
    true, true, true, true, true, true, true, // Week 1
    true, true, true, true, true, true, true  // Week 2
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
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome back, Yaler</h1>
          <p className="text-muted-foreground mt-2">
            Today is a new opportunity for connection and growth.
          </p>
        </div>
        
        {/* Dashboard Content */}
        <div className="space-y-6">
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
          
          {/* 4. Community Presence - Subtle social proof */}
          <CommunityPresence currentPrayer={nextPrayer as Prayer | undefined} />
          
          {/* 5. Streak Overview - Calendar heatmap */}
          <StreakOverview 
            currentStreak={currentStreak} 
            bestStreak={bestStreak} 
            recentDays={recentDays} 
          />
          
          {/* 6. Knowledge Search - Collapsible search interface */}
          <KnowledgeSearchCard />
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
