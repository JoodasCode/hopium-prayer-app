'use client';

import { useState } from 'react';
import { NextPrayerCard } from './NextPrayerCard';
import { TodaysPrayers } from './TodaysPrayers';
import { SmartTip } from './SmartTip';
import { StreakOverview } from './StreakOverview';
import { CommunityPresence } from './CommunityPresence';
import { KnowledgeSearchCard } from './KnowledgeSearchCard';
import { prayers, getNextPrayer, type Prayer } from './data';
// Removed UserStateContext dependency for cleaner auth flow
import { EmptyState } from '@/components/ui/empty-state';
import { SamplePrayerSchedule, SampleInsights } from '@/components/ui/sample-data';
import { BookOpen, Calendar, BarChart3 } from 'lucide-react';

export function Dashboard() {
  // Core state for prayer tracking
  const [completedPrayers, setCompletedPrayers] = useState<string[]>([]);
  // Simplified dashboard without complex user state management
  const welcomeMessage = 'Welcome back, Yaler';
  const showEmptyState = false; // Always show full dashboard
  
  // Use mock data for now, will be replaced with actual user data from Supabase
  const [currentStreak, setCurrentStreak] = useState<number>(3);
  const [bestStreak, setBestStreak] = useState<number>(7);
  
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
  
  // Welcome message component
  const renderWelcomeMessage = () => {
    return (
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
        <p className="text-muted-foreground mt-2">
          Today is a new opportunity for connection and growth.
        </p>
      </div>
    );
  };
  
  const nextPrayer = getNextPrayer(prayers);
  
  // Show empty state for new users who have completed onboarding
  if (showEmptyState) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 container max-w-md mx-auto px-4 pb-20">
          <div className="py-4 space-y-6">
            {renderWelcomeMessage()}
            
            <EmptyState
              title="Start Your Prayer Journey"
              description="Track your prayers, build consistency, and deepen your spiritual connection."
              icon={<BookOpen className="h-6 w-6 text-primary" />}
              actionLabel="Mark Your First Prayer"
              onAction={() => {
                // This would open the prayer tracking interface
                // For now, we'll just simulate completing a prayer
                handlePrayerComplete(prayers[0].id);
              }}
              showSampleData={true}
              sampleDataComponent={<SamplePrayerSchedule />}
            />
            
            <EmptyState
              title="Insights Coming Soon"
              description="Complete prayers to see analytics about your spiritual journey."
              icon={<BarChart3 className="h-6 w-6 text-primary" />}
              secondaryLabel="Learn More"
              onSecondaryAction={() => {}}
              showSampleData={true}
              sampleDataComponent={<SampleInsights />}
            />
          </div>
        </div>
      </div>
    );
  }
  
  // Show minimal experience for users with limited data
  if (false) { // Disabled for now
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 container max-w-md mx-auto px-4 pb-20">
          <div className="py-4 space-y-6">
            {renderWelcomeMessage()}
            
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
            
            {/* Encouragement card for new users */}
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <h3 className="font-medium text-primary">Building Your Prayer Journey</h3>
              <p className="text-sm mt-2">Continue tracking your prayers to unlock insights and analytics about your spiritual journey.</p>
              <div className="mt-3 bg-background rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${Math.min((completedPrayers.length / 10) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1 text-muted-foreground">{completedPrayers.length}/10 prayers tracked</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Regular dashboard for users with data
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 container max-w-md mx-auto px-4 pb-20">
        <div className="py-4 space-y-6">
          {renderWelcomeMessage()}
          
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
    </div>
  );
}
