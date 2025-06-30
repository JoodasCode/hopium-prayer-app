'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PrayerJourney } from './PrayerJourney';
import { EmotionalContext } from './EmotionalContext';
import { ActionZone } from './ActionZone';
import { AmbientInfo } from './AmbientInfo';
import { EmotionTracker } from './EmotionTracker';
import { MindfulnessTips } from './MindfulnessTips';
import { GestureControl } from './GestureControl';
import { prayers, emotions, getNextPrayer, type Prayer } from './data';

export function Dashboard() {
  const [selectedPrayer, setSelectedPrayer] = useState(prayers[0].id);
  const [currentEmotion, setCurrentEmotion] = useState(emotions[0]);
  const [journeyProgress, setJourneyProgress] = useState(35);
  const [activeUsers, setActiveUsers] = useState(124);
  const [showTips, setShowTips] = useState(true);
  const [streak, setStreak] = useState(7); // User's prayer streak
  const [missedPrayers, setMissedPrayers] = useState(['isha']); // Example: user missed Isha prayer
  const [completedPrayers, setCompletedPrayers] = useState<string[]>([]);
  
  // Simulate progress updates
  useEffect(() => {
    const timer = setInterval(() => {
      setJourneyProgress(prev => {
        const newProgress = prev + 1;
        return newProgress > 100 ? 35 : newProgress;
      });
    }, 15000); // Update every 15 seconds
    
    return () => clearInterval(timer);
  }, []);
  
  // Simulate active users fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      const fluctuation = Math.floor(Math.random() * 10) - 4; // -4 to +5
      setActiveUsers(prev => Math.max(50, prev + fluctuation));
    }, 8000); // Update every 8 seconds
    
    return () => clearInterval(timer);
  }, []);
  
  const handlePrayerSelect = (prayerId: string) => {
    setSelectedPrayer(prayerId);
  };
  
  const handlePrayerComplete = (prayerId: string) => {
    if (!completedPrayers.includes(prayerId)) {
      const newCompletedPrayers = [...completedPrayers, prayerId];
      setCompletedPrayers(newCompletedPrayers);
      
      // Update journey progress based on completed prayers
      const newProgress = Math.min(100, Math.round((newCompletedPrayers.length / prayers.length) * 100));
      setJourneyProgress(newProgress);
      
      // Update streak if this completes today's prayers
      if (newCompletedPrayers.length === prayers.length) {
        setStreak(prev => prev + 1);
      }
    }
  };
  
  const handleEmotionChange = (emotion: string) => {
    setCurrentEmotion(emotion);
  };
  
  const handleSwipeLeft = () => {
    // Find current prayer index
    const currentIndex = prayers.findIndex(p => p.id === selectedPrayer);
    const nextIndex = (currentIndex + 1) % prayers.length;
    setSelectedPrayer(prayers[nextIndex].id);
  };
  
  const handleSwipeRight = () => {
    // Find current prayer index
    const currentIndex = prayers.findIndex(p => p.id === selectedPrayer);
    const prevIndex = (currentIndex - 1 + prayers.length) % prayers.length;
    setSelectedPrayer(prayers[prevIndex].id);
  };
  
  const handleSwipeUp = () => {
    // Toggle mindfulness tips visibility
    setShowTips(prev => !prev);
  };
  
  const nextPrayer = getNextPrayer(prayers);
  const selectedPrayerObj = prayers.find(p => p.id === selectedPrayer);
  
  return (
    <GestureControl
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      onSwipeUp={handleSwipeUp}
      className="min-h-screen flex flex-col bg-background"
    >
      <div className="flex-1 container max-w-md mx-auto px-4 pb-6">
        <div className="py-4 space-y-4">
          {/* Header with app name */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">Hopium</span>
            </div>
            <div className="text-xs text-muted-foreground">
              360px × 984px
            </div>
          </div>
          
          <PrayerJourney 
            prayers={prayers.map(prayer => ({
              ...prayer,
              status: completedPrayers.includes(prayer.id) ? 'completed' : prayer.status
            }))} 
            selectedPrayer={selectedPrayer}
            onSelectPrayer={handlePrayerSelect}
          />
          
          <EmotionTracker
            currentEmotion={currentEmotion}
            onEmotionSelect={handleEmotionChange}
          />
          
          <EmotionalContext 
            currentEmotion={currentEmotion}
          />
          
          {showTips && (
            <MindfulnessTips 
              prayerName={selectedPrayerObj?.name}
              userEmotion={currentEmotion}
              streak={streak}
              missedPrayers={missedPrayers}
            />
          )}
          
          <ActionZone 
            journeyProgress={journeyProgress}
            nextPrayer={nextPrayer}
            onPrayerComplete={() => nextPrayer && handlePrayerComplete(nextPrayer.id)}
          />
          
          <AmbientInfo 
            activeUsers={activeUsers}
            streakDays={7}
          />
          
          {/* Navigation tabs */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
            <div className="container max-w-md mx-auto">
              <div className="flex justify-around py-4">
                <div className="flex flex-col items-center text-primary w-16">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <span className="text-xs mt-1.5">Home</span>
                </div>
                <div className="flex flex-col items-center text-muted-foreground w-16">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  <span className="text-xs mt-1.5">Calendar</span>
                </div>
                <div className="flex flex-col items-center text-muted-foreground w-16">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span className="text-xs mt-1.5">Lopi AI</span>
                </div>
                <div className="flex flex-col items-center text-muted-foreground w-16">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
                  <span className="text-xs mt-1.5">Profile</span>
                </div>
                <Link href="/settings" className="block w-16">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span className="text-xs mt-1.5">Settings</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-8 mb-20">
            <p>Swipe left/right to navigate prayers</p>
            <p>Swipe up to toggle mindfulness tips</p>
          </div>
        </div>
      </div>
    </GestureControl>
  );
}
