'use client';

import { cn } from '@/components/ui/cn';
import { Badge } from '@/components/ui/badge';
import { type Prayer } from './data';
import { Check, Moon, Sun, Sunset, Sunrise, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

type PrayerJourneyProps = {
  prayers: Prayer[];
  selectedPrayer: string;
  onSelectPrayer: (id: string) => void;
};

// Prayer icons mapping
const prayerIcons = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: Sunset,
  maghrib: Moon,
  isha: Star
};

// Emoji status mapping
const statusEmoji = {
  completed: '✅',
  upcoming: '⏳',
  next: '⏰',
  missed: '❗'
};

export function PrayerJourney({ prayers, selectedPrayer, onSelectPrayer }: PrayerJourneyProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Sort prayers by their time
  const sortedPrayers = [...prayers].sort((a, b) => {
    // Extract hours and minutes from time strings like "5:30 AM"
    const getTimeValue = (timeStr: string) => {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    
    return getTimeValue(a.time) - getTimeValue(b.time);
  });
  
  // Handle scroll arrows visibility
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };
  
  // Scroll handlers
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };
  
  // Set up scroll event listener and initial scroll position
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      
      // Check initial state
      handleScroll();
      
      // Find the next upcoming prayer and scroll to it
      const nextPrayerIndex = sortedPrayers.findIndex(prayer => 
        prayer.status !== 'completed' && 
        sortedPrayers.slice(0, sortedPrayers.indexOf(prayer)).every(p => p.status === 'completed')
      );
      
      if (nextPrayerIndex !== -1) {
        // Delay slightly to ensure the DOM is fully rendered
        setTimeout(() => {
          const cardWidth = 140; // Width of each card
          const margin = 16; // Right margin of each card
          const scrollPosition = (cardWidth + margin) * nextPrayerIndex;
          
          // Center the next prayer card
          const containerWidth = scrollContainer.clientWidth;
          const centerOffset = (containerWidth - cardWidth) / 2;
          
          scrollContainer.scrollTo({
            left: Math.max(0, scrollPosition - centerOffset),
            behavior: 'smooth'
          });
        }, 100);
      }
      
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [sortedPrayers]);
  
  return (
    <div className="relative w-full mb-4 bg-background/30 rounded-xl border border-border/30 py-4">
      {/* Connecting line */}
      <div className="absolute top-[42px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-border to-transparent opacity-30 z-0"></div>
      
      {/* Scroll arrows */}
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      
      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
      
      {/* Horizontal scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-4 px-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sortedPrayers.map((prayer, index) => {
          const isSelected = selectedPrayer === prayer.id;
          const isCompleted = prayer.status === 'completed';
          const IconComponent = prayerIcons[prayer.id as keyof typeof prayerIcons] || Sun;
          
          // Determine if this is the next upcoming prayer
          const isNextUpcoming = !isCompleted && sortedPrayers.slice(0, index).every(p => p.status === 'completed');
          
          // Determine status for emoji
          let status = isCompleted ? 'completed' : isNextUpcoming ? 'next' : 'upcoming';
          
          return (
            <div 
              key={prayer.id} 
              className="flex-shrink-0 snap-center mr-4 last:mr-0 w-[140px]"
            >
              <div 
                className={cn(
                  'relative flex flex-col items-center p-3 rounded-xl border transition-all duration-300 cursor-pointer',
                  isSelected ? 'border-primary/50 bg-primary/5 shadow-md' : 'border-border/50',
                  isNextUpcoming ? 'animate-pulse-subtle' : ''
                )}
                onClick={() => onSelectPrayer(prayer.id)}
              >
                {/* Prayer orb with icon */}
                <div 
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center shadow-md border mb-2',
                    isCompleted ? 'bg-primary text-primary-foreground border-primary/70' : 
                    isNextUpcoming ? 'bg-gradient-to-br from-primary/80 to-primary/90 text-primary-foreground border-primary/50' :
                    isSelected ? 'bg-primary/80 text-primary-foreground border-primary' : 
                    'bg-background hover:bg-muted/20 border-border/50 text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <IconComponent className="w-6 h-6" />
                  )}
                </div>
                
                {/* Prayer details */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-medium">{prayer.name}</span>
                    <span className="text-xs">{statusEmoji[status as keyof typeof statusEmoji]}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{prayer.time}</div>
                </div>
                
                {/* Status badge */}
                <Badge 
                  variant={isCompleted ? 'default' : 'outline'}
                  className={cn(
                    "mt-2 text-[10px] py-0.5 px-2 font-medium",
                    isCompleted ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary/70' : '',
                    !isCompleted ? 'bg-background border border-border/50' : ''
                  )}
                >
                  {isCompleted ? 'Done' : isNextUpcoming ? 'Next' : 'Upcoming'}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
