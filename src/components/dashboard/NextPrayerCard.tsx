'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Prayer } from './data';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, Bell, Sunrise, Sun, Sunset, Moon, Star } from 'lucide-react';

interface NextPrayerCardProps {
  nextPrayer: Prayer | null;
  onPrayerComplete: (prayerId: string) => void;
}

// Prayer icons mapping
const prayerIcons = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Sunset,
  isha: Moon
};

// Emotional states for check-in
type EmotionType = string;

const beforePrayerEmotions: EmotionType[] = [
  'Anxious', 'Distracted', 'Tired', 'Worried', 'Stressed',
  'Grateful', 'Hopeful', 'Joyful', 'Content', 'Inspired'
];

const afterPrayerEmotions: EmotionType[] = [
  'Calm', 'Focused', 'Refreshed', 'Peaceful', 'Relaxed',
  'Present', 'Centered', 'Grateful', 'Blessed', 'Motivated'
];

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
  const [streakCount, setStreakCount] = useState(2);
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
    
    const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
    
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
  
  const handlePrayerComplete = (prayerId: string) => {
    setPrayerToComplete(prayerId);
    setEmotionStep('before');
    setShowEmotionCheckIn(true);
  };
  
  const handleEmotionCheckInComplete = () => {
    if (emotionStep === 'before') {
      setEmotionStep('after');
    } else {
      setShowEmotionCheckIn(false);
      
      if (prayerToComplete) {
        console.log('Emotional journey:', {
          prayer: prayerToComplete,
          before: selectedBeforeEmotion,
          after: selectedAfterEmotion,
          date: new Date().toISOString()
        });
        
        setShowCelebration(true);
        setCelebrationMessage(`Alhamdulillah! That's ${streakCount + 1} in a row 💪`);
        setStreakCount(prev => prev + 1);
        createConfetti();
        
        const hasMilestone = checkForMilestone(streakCount);
        
        setTimeout(() => {
          if (hasMilestone) {
            setShowVerse(true);
            setTimeout(() => {
              setShowVerse(false);
              setShowCelebration(false);
            }, 5000);
          } else {
            setShowCelebration(false);
          }
        }, 3000);
        
        setTimeout(() => {
          onPrayerComplete(prayerToComplete);
          setSelectedBeforeEmotion(null);
          setSelectedAfterEmotion(null);
          setPrayerToComplete(null);
        }, 3000);
      }
    }
  };
  
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
    const calculateTimeRemaining = () => {
      if (!nextPrayer) return "--:--:--";
      
      const now = new Date();
      const prayerTime = new Date();
      const [hours, minutes] = nextPrayer.time.split(':').map(Number);
      
      prayerTime.setHours(hours, minutes, 0, 0);
      
      if (prayerTime <= now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }
      
      const timeDiff = prayerTime.getTime() - now.getTime();
      const hoursRemaining = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hoursRemaining}h ${minutesRemaining}m`;
    };
    
    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining());
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    
    return () => clearInterval(interval);
  }, [nextPrayer]);

  if (!nextPrayer) {
    return (
      <Card className="card-mobile bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <Star className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-mobile-xl font-medium text-muted-foreground">No upcoming prayer</h3>
              <p className="text-sm text-muted-foreground mt-2">All prayers completed for today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const PrayerIcon = prayerIcons[nextPrayer.name.toLowerCase() as keyof typeof prayerIcons] || Sun;

  return (
    <>
      <Card className="card-mobile bg-gradient-to-br from-background via-background to-primary/5 border-primary/10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
        
        <CardContent className="p-8 relative">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Next Prayer</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <PrayerIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-mobile-3xl font-bold text-foreground capitalize">
                {nextPrayer.name}
              </h2>
            </div>
          </div>

          {/* Time Display */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-3xl font-bold text-foreground">{nextPrayer.time}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                {timeRemaining}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handlePrayerComplete(nextPrayer.id)}
              className="touch-target h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-2xl shadow-sm"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Mark Complete
            </Button>
            <Button
              variant="outline"
              className="touch-target h-14 border-2 border-border hover:bg-muted/50 font-medium rounded-2xl"
            >
              <Bell className="h-5 w-5 mr-2" />
              Remind Me
            </Button>
          </div>
        </CardContent>

        {/* Confetti container */}
        <div ref={confettiRef} className="absolute inset-0 pointer-events-none" />
      </Card>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Prayer Completed!</h3>
                <p className="text-muted-foreground">{celebrationMessage}</p>
              </div>
              {showVerse && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm italic text-center">{currentVerse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emotion Check-in Dialog */}
      <Dialog open={showEmotionCheckIn} onOpenChange={setShowEmotionCheckIn}>
        <DialogContent className="w-[90vw] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {emotionStep === 'before' 
                ? 'How are you feeling before prayer?' 
                : 'How do you feel after prayer?'
              }
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 py-4">
            {(emotionStep === 'before' ? beforePrayerEmotions : afterPrayerEmotions).map((emotion) => (
              <Button
                key={emotion}
                variant={
                  (emotionStep === 'before' ? selectedBeforeEmotion : selectedAfterEmotion) === emotion 
                    ? "default" 
                    : "outline"
                }
                onClick={() => selectEmotion(emotion)}
                className="h-12 text-sm"
              >
                {emotion}
              </Button>
            ))}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleEmotionCheckInComplete}
              disabled={
                (emotionStep === 'before' && !selectedBeforeEmotion) ||
                (emotionStep === 'after' && !selectedAfterEmotion)
              }
              className="w-full"
            >
              {emotionStep === 'before' ? 'Continue' : 'Complete Prayer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
