'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Sun, Moon, Star, Clock, CheckCircle, RefreshCw, MapPin, 
  Heart, Calendar, Award, ArrowRight, ChevronRight, Bell, X, CalendarCheck
} from 'lucide-react';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { PrayerReflectionModal } from '@/components/modals/PrayerReflectionModal';
import { StreakOverview } from '@/components/dashboard/StreakOverview';

// Define prayer status type for type safety
type PrayerStatus = 'completed' | 'upcoming' | 'missed';

// Define prayer type for better type checking
type Prayer = {
  id: string;
  name: string;
  time: Date;
  status: PrayerStatus;
  timeAgo?: string;
  timeRemaining?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<'today' | 'qibla' | 'insights'>('today');
  const [showReminderCard, setShowReminderCard] = useState(true);
  const [animateStreak, setAnimateStreak] = useState(false);
  
  // Modal states
  const [showDialog, setShowDialog] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [dialogContent, setDialogContent] = useState({
    title: "Coming Soon",
    description: "This feature will be available in the next update.",
    actionLabel: "Close"
  });
  
  // Example prayer state - would come from a hook in production
  const [prayers, setPrayers] = useState<Prayer[]>([
    { id: '1', name: 'Fajr', time: new Date(2025, 6, 3, 4, 30), status: 'completed', timeAgo: '4h ago' },
    { id: '2', name: 'Dhuhr', time: new Date(2025, 6, 3, 12, 30), status: 'upcoming', timeRemaining: '1h 12m' },
    { id: '3', name: 'Asr', time: new Date(2025, 6, 3, 16, 0), status: 'upcoming', timeRemaining: '4h 42m' },
    { id: '4', name: 'Maghrib', time: new Date(2025, 6, 3, 20, 0), status: 'upcoming', timeRemaining: '8h 42m' },
    { id: '5', name: 'Isha', time: new Date(2025, 6, 3, 21, 30), status: 'upcoming', timeRemaining: '10h 12m' },
  ]);
  
  const [streak, setStreak] = useState({ current: 7, best: 14 });
  const [location, setLocation] = useState('London, UK');
  const [nextAction, setNextAction] = useState({ name: 'Dhuhr', timeRemaining: '1h 12m' });
  
  // Trigger streak animation periodically for demo purposes
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimateStreak(true);
      setTimeout(() => setAnimateStreak(false), 2000);
    }, 10000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Helper function to format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Contextual Header - adapts to time of day */}
      <header className="w-full bg-background pt-safe-top">
        <div className="bg-gradient-to-b from-primary/5 to-transparent py-4 px-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Sun className="h-4 w-4 text-primary" />
                </div>
                <h1 className="text-base font-semibold">Good morning, Ahmed</h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-10">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-muted active:bg-muted/80">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-md mx-auto px-4 space-y-4">
        {/* Location-aware banner */}
        {showReminderCard && (
          <div className="bg-primary/10 rounded-xl p-3 mt-3 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{location}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setShowReminderCard(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Next Prayer Focus - the centerpiece of the dashboard */}
        <div className="mt-2">
          <Card className="border-primary/20 overflow-hidden bg-gradient-to-b from-primary/5 to-transparent">
            <div className="p-5">
              <CardTitle className="text-md font-medium text-center mb-1">
                Next Prayer
              </CardTitle>
              <div className="text-center">
                <h2 className="text-4xl font-bold text-primary mb-1">{nextAction.name}</h2>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">
                    {nextAction.timeRemaining} remaining
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button 
                  className="rounded-lg h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  onClick={() => {
                    // Find the next upcoming prayer to complete
                    const nextPrayer = prayers.find(p => p.status === 'upcoming');
                    if (nextPrayer) {
                      setSelectedPrayer(nextPrayer);
                      setShowReflectionModal(true);
                    }
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
                </Button>
                
                <Button 
                  variant="outline" 
                  className="rounded-lg h-12 border-primary/20 hover:bg-primary/5"
                  onClick={() => alert('Reminder set')}
                >
                  <Bell className="mr-2 h-4 w-4" /> Remind Me
                </Button>
              </div>
            </div>
            
            {/* Daily Progress */}
            <div className="px-5 pb-4 pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground font-medium">Today's progress</span>
                <span className="text-xs font-medium">1/5 prayers</span>
              </div>
              <Progress value={20} className="h-1.5 bg-secondary/40" />
            </div>
          </Card>
        </div>
        
        {/* Enhanced Gamified Streak Card */}
        <StreakOverview
          currentStreak={streak.current}
          bestStreak={streak.best}
          recentDays={Array(14).fill(0).map((_, i) => i < 7 || Math.random() > 0.3)}
          streakShields={2}
          streakAtRisk={true}
          nextMilestone={10}
          percentToMilestone={70}
        />
        
        {/* Prayer Status Cards */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Prayers</h2>
            <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
              <Calendar className="h-3.5 w-3.5" /> View Calendar
            </Button>
          </div>
          
          <div className="grid gap-3">
            {prayers.map((prayer, index) => {
              // Determine if this is the next prayer (first non-completed prayer)
              const isNextPrayer = prayer.status === 'upcoming' && 
                prayers.findIndex(p => p.status === 'upcoming') === index;
                
              return (
                <div 
                  key={prayer.id}
                  onClick={() => {
                    setSelectedPrayer(prayer);
                    setShowReflectionModal(true);
                  }}
                  className={cn(
                    "p-3 rounded-lg flex items-center justify-between border transition-all cursor-pointer hover:scale-[1.01] active:scale-100",
                    prayer.status === 'completed' ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200 dark:bg-gradient-to-r dark:from-green-950/20 dark:to-green-900/30 dark:border-green-800/30" :
                    prayer.status === 'missed' ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200 dark:bg-gradient-to-r dark:from-red-950/20 dark:to-red-900/30 dark:border-red-800/30 animate-pulse" :
                    isNextPrayer ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 dark:bg-gradient-to-r dark:from-orange-950/20 dark:to-orange-900/30 dark:border-orange-800/30 animate-pulse" :
                    "bg-secondary/20 border-secondary/30"
                  )}
                >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "rounded-full p-2 h-9 w-9 flex items-center justify-center",
                    prayer.status === 'completed' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                    prayer.status === 'missed' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-secondary/30 text-foreground"
                  )}>
                    {prayer.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : prayer.status === 'missed' ? (
                      <X 
                        className="h-4 w-4 cursor-pointer" 
                        onClick={() => {
                          setSelectedPrayer(prayer);
                          setShowReflectionModal(true);
                        }} 
                      />
                    ) : (
                      <Clock 
                        className="h-4 w-4 cursor-pointer" 
                        onClick={() => {
                          setSelectedPrayer(prayer);
                          setShowReflectionModal(true);
                        }} 
                      />
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">{prayer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(prayer.time)}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs font-medium">
                  {prayer.status === 'completed' ? (
                    <span className="text-green-600 dark:text-green-400">{prayer.timeAgo}</span>
                  ) : (
                    <span className="text-muted-foreground">{prayer.timeRemaining}</span>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        </div>
        
        {/* Community Insights */}
        <div className="mt-6">
          <Card className="border-primary/20 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Community Insights</CardTitle>
            </CardHeader>
            
            <CardContent className="px-4 pb-4 pt-0">
              <div className="flex flex-col gap-3">
                <div 
                  className="bg-secondary/20 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setShowDialog(true)}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary/30 rounded-full p-1.5">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">3,240 community members praying</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div 
                  className="bg-secondary/20 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setShowDialog(true)}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary/30 rounded-full p-1.5">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">You're in the top 12% this week</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="py-4">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button 
              variant="outline" 
              className="rounded-lg border-primary/20 px-4 py-2 h-auto whitespace-nowrap flex-shrink-0"
              onClick={() => router.push('/qibla')}
            >
              <MapPin className="mr-2 h-4 w-4" /> Find Qibla
            </Button>
            
            <Button 
              variant="outline" 
              className="rounded-lg border-primary/20 px-4 py-2 h-auto whitespace-nowrap flex-shrink-0"
              onClick={() => router.push('/stats')}
            >
              <Calendar className="mr-2 h-4 w-4" /> Prayer Times
            </Button>
            
            <Button 
              variant="outline" 
              className="rounded-lg border-primary/20 px-4 py-2 h-auto whitespace-nowrap flex-shrink-0"
              onClick={() => {
                // Find the most recent missed prayer
                const missedPrayer = prayers.find(p => p.status !== 'completed' && new Date(p.time) < new Date());
                if (missedPrayer) {
                  setSelectedPrayer(missedPrayer);
                  setShowReflectionModal(true);
                } else {
                  // Show dialog explaining there are no prayers to recover
                  setShowDialog(true);
                  setDialogContent({
                    title: "No Missed Prayers",
                    description: "Great job! You don't have any missed prayers to recover. All your prayers are either completed or still upcoming.",
                    actionLabel: "Alhamdulillah"
                  });
                }
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Recover Prayer
            </Button>
            
            <Button 
              variant="outline" 
              className="rounded-lg border-primary/20 px-4 py-2 h-auto whitespace-nowrap flex-shrink-0"
              onClick={() => {
                setShowDialog(true);
                setDialogContent({
                  title: "Set Prayer Goals",
                  description: "Set daily and weekly prayer goals to build consistency in your spiritual practice. Track your progress and celebrate achievements.",
                  actionLabel: "Coming Soon"
                });
              }}
            >
              <Calendar className="mr-2 h-4 w-4" /> Set Goal
            </Button>
            
            <Button 
              variant="outline" 
              className="rounded-lg border-primary/20 px-4 py-2 h-auto whitespace-nowrap flex-shrink-0 hover:bg-primary/5"
              onClick={() => {
                // Instead of showing a basic dialog, we now rely on the StreakOverview component's
                // built-in Shield dialog functionality that's triggered when clicking on the Shield button
                // within the component itself
                setShowDialog(true);
                setDialogContent({
                  title: "Streak Shield Protection",
                  description: "Tap the Shield icon in your streak card to activate protection. Shields guard your streak during travel, illness, or other exceptional circumstances.",
                  actionLabel: "Got it"
                });
              }}
            >
              <Calendar className="mr-2 h-4 w-4" /> Streak Info
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <PhantomBottomNav />
      
      {/* Dialog for feature previews */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowDialog(false)}>{dialogContent.actionLabel}</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Prayer Reflection Modal */}
      {selectedPrayer && (
        <PrayerReflectionModal
          open={showReflectionModal}
          onOpenChange={setShowReflectionModal}
          prayerName={selectedPrayer.name}
          onComplete={(data) => {
            // Update prayer status
            if (selectedPrayer) {
              const updatedPrayers = prayers.map(p => 
                p.id === selectedPrayer.id 
                  ? { 
                      ...p, 
                      status: 'completed' as const, 
                      timeAgo: 'just now',
                      // If it had timeRemaining before, we'll keep it but make it optional
                      ...(p.timeRemaining ? {} : { timeRemaining: undefined })
                    } 
                  : p
              );
              setPrayers(updatedPrayers);
              
              // Log the completion data
              console.log('Prayer completed:', {
                prayer: selectedPrayer.name,
                ...data
              });
              
              // Update streak if needed
              const completedCount = updatedPrayers.filter(p => p.status === 'completed').length;
              if (completedCount > prayers.filter(p => p.status === 'completed').length) {
                setAnimateStreak(true);
                setTimeout(() => setAnimateStreak(false), 2000);
              }
            }
            
            // Close modal
            setShowReflectionModal(false);
            setSelectedPrayer(null);
          }}
        />
      )}
    </div>
  );
}

