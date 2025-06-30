'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Prayer } from './data';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface NextPrayerCardProps {
  nextPrayer: Prayer | null;
  onPrayerComplete: (prayerId: string) => void;
}

// Emotional states for check-in
type EmotionType = string;

const beforePrayerEmotions: EmotionType[] = [
  // Challenging emotions
  'Anxious', 'Distracted', 'Tired', 'Worried', 'Stressed',
  // Positive emotions
  'Grateful', 'Hopeful', 'Joyful', 'Content', 'Inspired'
];

const afterPrayerEmotions: EmotionType[] = [
  'Calm', 'Focused', 'Refreshed', 'Peaceful', 'Relaxed',
  'Present', 'Centered', 'Grateful', 'Blessed', 'Motivated'
];

// Spiritual verses and feedback
const spiritualFeedback = [
  {
    milestone: 5,
    message: "'Indeed, prayer restrains from shameful and unjust deeds.' — Quran 29:45"
  },
  {
    milestone: 10,
    message: "'Successful indeed are the believers who are humble in their prayers.' — Quran 23:1-2"
  },
  {
    milestone: 15,
    message: "'And seek help through patience and prayer.' — Quran 2:153"
  },
  {
    milestone: 20,
    message: "'Verily, in the remembrance of Allah do hearts find rest.' — Quran 13:28"
  }
];

export function NextPrayerCard({ nextPrayer, onPrayerComplete }: NextPrayerCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("--:--:--");
  const [showCelebration, setShowCelebration] = useState(false);
  const [streakCount, setStreakCount] = useState(2); // Simulating a streak count
  const [showVerse, setShowVerse] = useState(false);
  const [currentVerse, setCurrentVerse] = useState("");
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const confettiRef = useRef<HTMLDivElement>(null);
  
  // Emotional check-in states
  const [showEmotionCheckIn, setShowEmotionCheckIn] = useState(false);
  const [selectedBeforeEmotion, setSelectedBeforeEmotion] = useState<EmotionType | null>(null);
  const [selectedAfterEmotion, setSelectedAfterEmotion] = useState<EmotionType | null>(null);
  const [emotionStep, setEmotionStep] = useState<'before' | 'after'>('before');
  const [prayerToComplete, setPrayerToComplete] = useState<string | null>(null);
  
  // Create confetti elements
  const createConfetti = () => {
    if (!confettiRef.current) return;
    
    const container = confettiRef.current;
    container.innerHTML = '';
    
    const colors = ['#FFC700', '#FF0058', '#2E7DAF', '#17B978', '#9C27B0'];
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      const size = Math.random() * 10 + 5;
      
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.position = 'absolute';
      confetti.style.top = '50%';
      confetti.style.left = '50%';
      confetti.style.opacity = '0';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.transform = `translate(-50%, -50%)`;
      confetti.style.zIndex = '10';
      
      const angle = Math.random() * 360;
      const distance = Math.random() * 100 + 50;
      const delay = Math.random() * 0.5;
      
      confetti.animate([
        { 
          transform: 'translate(-50%, -50%)',
          opacity: 1
        },
        { 
          transform: `translate(calc(-50% + ${distance * Math.cos(angle)}px), calc(-50% + ${distance * Math.sin(angle)}px))`,
          opacity: 0
        }
      ], {
        duration: 1000 + Math.random() * 1000,
        delay: delay * 1000,
        easing: 'cubic-bezier(0,.9,.57,1)',
        fill: 'forwards'
      });
      
      container.appendChild(confetti);
    }
  };
  
  // Start the prayer completion process with emotional check-in
  const handlePrayerComplete = (prayerId: string) => {
    // Show emotional check-in dialog first
    setPrayerToComplete(prayerId);
    setEmotionStep('before');
    setShowEmotionCheckIn(true);
  };
  
  // Handle the emotional check-in completion
  const handleEmotionCheckInComplete = () => {
    if (emotionStep === 'before') {
      // After selecting 'before' emotion, move to 'after' emotion
      setEmotionStep('after');
    } else {
      // Both emotions selected, complete the prayer
      setShowEmotionCheckIn(false);
      
      if (prayerToComplete) {
        // Save the emotional state data (in a real app, you'd send this to your backend)
        console.log('Emotional journey:', {
          prayer: prayerToComplete,
          before: selectedBeforeEmotion,
          after: selectedAfterEmotion,
          date: new Date().toISOString()
        });
        
        // Show celebration animation
        setShowCelebration(true);
        setCelebrationMessage(`Alhamdulillah! That's ${streakCount + 1} in a row 💪`);
        setStreakCount(prev => prev + 1);
        createConfetti();
        
        // Check if we've hit a milestone for spiritual feedback
        const hasMilestone = checkForMilestone(streakCount);
        
        // Show verse after celebration if milestone reached
        setTimeout(() => {
          if (hasMilestone) {
            setShowVerse(true);
            // Reset verse after a longer delay
            setTimeout(() => {
              setShowVerse(false);
              setShowCelebration(false);
            }, 5000);
          } else {
            setShowCelebration(false);
          }
        }, 3000);
        
        // Hide celebration after a delay
        setTimeout(() => {
          onPrayerComplete(prayerToComplete);
          
          // Reset emotional state for next prayer
          setSelectedBeforeEmotion(null);
          setSelectedAfterEmotion(null);
          setPrayerToComplete(null);
        }, 3000);
      }
    }
  };
  
  // Handle emotion selection
  const selectEmotion = (emotion: EmotionType) => {
    if (emotionStep === 'before') {
      setSelectedBeforeEmotion(emotion);
    } else {
      setSelectedAfterEmotion(emotion);
    }
  };
  
  const checkForMilestone = (streak: number) => {
    const milestone = spiritualFeedback.find(item => item.milestone === streak);
    if (milestone) {
      setCurrentVerse(milestone.message);
      return true;
    }
    return false;
  };
  
  useEffect(() => {
    // Function to calculate time remaining until the prayer
    const calculateTimeRemaining = () => {
      if (!nextPrayer) return "--:--:--";
      
      try {
        // Parse the prayer time (assuming format like "5:30 AM" or "12:30 PM")
        const timeParts = nextPrayer.time.split(' ');
        const [hourMin, period] = [timeParts[0], timeParts[1] || ''];
        const [hours, minutes] = hourMin.split(':').map(Number);
        
        if (isNaN(hours) || isNaN(minutes)) {
          console.error("Invalid time format", nextPrayer.time);
          return "--:--:--";
        }
        
        const now = new Date();
        const prayerTime = new Date();
        
        // Convert to 24-hour format if needed
        let hour24 = hours;
        if (period && period.toUpperCase() === 'PM' && hours < 12) {
          hour24 = hours + 12;
        } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
          hour24 = 0;
        }
        
        prayerTime.setHours(hour24, minutes, 0, 0);
        
        // If prayer time has passed for today, set it for tomorrow
        if (prayerTime < now) {
          prayerTime.setDate(prayerTime.getDate() + 1);
        }
        
        // Calculate difference in milliseconds
        const diff = prayerTime.getTime() - now.getTime();
        
        // Convert to hours, minutes, seconds
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Format as HH:MM:SS
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      } catch (error) {
        console.error("Error calculating time remaining:", error);
        return "--:--:--";
      }
    };
    
    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());
    
    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [nextPrayer]);
  
  if (!nextPrayer) {
    return (
      <Card className="mb-4 shadow-sm border-border overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">All Prayers Completed!</h3>
            <p className="text-muted-foreground mb-4">Great job! You've completed all prayers for today.</p>
            <Button 
              variant="outline" 
              className="w-full py-2 mt-2"
              onClick={() => {/* View prayer history */}}
            >
              View Prayer History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      {/* Emotional Check-in Dialog */}
      <Dialog open={showEmotionCheckIn} onOpenChange={setShowEmotionCheckIn}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {emotionStep === 'before' ? 'How are you feeling before prayer?' : 'How do you feel after prayer?'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 py-4 max-h-[300px] overflow-y-auto">
            {(emotionStep === 'before' ? beforePrayerEmotions : afterPrayerEmotions).map((emotion) => (
              <Button
                key={emotion}
                variant={emotionStep === 'before' ? 
                  (selectedBeforeEmotion === emotion ? 'default' : 'outline') : 
                  (selectedAfterEmotion === emotion ? 'default' : 'outline')
                }
                className={cn(
                  "h-auto py-3 transition-all",
                  emotionStep === 'before' ? 
                    (selectedBeforeEmotion === emotion ? 'bg-primary text-primary-foreground' : '') : 
                    (selectedAfterEmotion === emotion ? 'bg-primary text-primary-foreground' : '')
                )}
                onClick={() => selectEmotion(emotion)}
              >
                {emotion}
              </Button>
            ))}
          </div>
          
          <DialogFooter className="sm:justify-center">
            <Button 
              type="button" 
              disabled={emotionStep === 'before' ? !selectedBeforeEmotion : !selectedAfterEmotion}
              onClick={handleEmotionCheckInComplete}
              className="w-full sm:w-auto"
            >
              {emotionStep === 'before' ? 'Next' : 'Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card className="mb-4 shadow-sm border-border overflow-hidden relative">
        {/* Confetti container */}
        <div 
          ref={confettiRef} 
          className="absolute inset-0 overflow-hidden pointer-events-none z-10"
        />
        
        {/* Celebration overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/5 flex flex-col items-center justify-center z-20 transition-opacity duration-300",
            showCelebration ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="bg-background/90 p-5 rounded-xl shadow-lg text-center max-w-xs animate-bounce-slow">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-primary mb-1">Prayer Completed!</h3>
            <p className="text-sm">{celebrationMessage}</p>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold uppercase mb-2">NEXT PRAYER: <span className="text-primary">{nextPrayer.name}</span></h3>
            <div className="text-5xl font-bold text-primary my-6 tracking-wider">
              {timeRemaining}
            </div>
            <div className="flex gap-3 mt-4">
              <Button 
                className="flex-1 py-6 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md transition-all hover:scale-105 active:scale-95" 
                onClick={() => handlePrayerComplete(nextPrayer.id)}
                disabled={showCelebration}
              >
                <span className="mr-2">✓</span> I PRAYED
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 py-6 text-base font-medium border-2 hover:bg-secondary/30 transition-all hover:scale-105 active:scale-95"
                onClick={() => alert(`We'll remind you before ${nextPrayer.name}`)}
                disabled={showCelebration}
              >
                REMIND ME <span className="ml-2">⏰</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
