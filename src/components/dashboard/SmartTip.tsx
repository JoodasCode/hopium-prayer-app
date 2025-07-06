'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { tips } from './data';

export function SmartTip() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showInsight, setShowInsight] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [direction, setDirection] = useState(0);
  const [dailyTipIndex, setDailyTipIndex] = useState(0);
  
  // Calculate daily tip based on date
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const calculatedDailyIndex = dayOfYear % tips.length;
    setDailyTipIndex(calculatedDailyIndex);
    setCurrentTipIndex(calculatedDailyIndex);
  }, []);
  
  // Simulate loading delay for the insight
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInsight(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleNextTip = () => {
    setDirection(1);
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    setShowActionMenu(false);
  };

  const handlePrevTip = () => {
    setDirection(-1);
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
    setShowActionMenu(false);
  };
  
  const toggleActionMenu = () => {
    setShowActionMenu(!showActionMenu);
  };
  
  const currentTip = tips[currentTipIndex];
  const isDailyTip = currentTipIndex === dailyTipIndex;

  // Slide animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  // Get personalized content based on current tip
  const getPersonalizedContent = () => {
    switch (currentTip.id) {
      case 'timing_improvement':
        return {
          title: "Perfect Timing Streak! 🎯",
          description: "You've been consistently praying Asr on time this week. Your punctuality has improved 2x!",
          actionText: "Set reminder for Asr at 3:45 PM?",
          actionIcon: Clock
        };
      case 'mindfulness_growth':
        return {
          title: "Mindfulness Milestone 🧘",
          description: "Your reflection quality scores show 40% deeper engagement compared to last month.",
          actionText: "Start guided reflection session?",
          actionIcon: Calendar
        };
      case 'community_impact':
        return {
          title: "Community Leader 👥",
          description: "You're in the top 15% of consistent prayers in your area. Others are inspired by your dedication!",
          actionText: "Share your milestone?",
          actionIcon: Calendar
        };
      case 'streak_protection':
        return {
          title: "Streak Guardian 🛡️",
          description: "Your 12-day streak is strong! Consider setting a reminder for tomorrow's Fajr to maintain momentum.",
          actionText: "Set Fajr reminder for 5:30 AM?",
          actionIcon: Clock
        };
      case 'emotional_pattern':
        return {
          title: "Emotional Insight 💝",
          description: "You feel most peaceful during Maghrib prayers. This timing aligns perfectly with your natural rhythm.",
          actionText: "Optimize Maghrib routine?",
          actionIcon: Calendar
        };
      case 'milestone_approaching':
        return {
          title: "Badge Incoming! 🎖️",
          description: "Just 3 more consistent days to unlock your 'Two Weeks Strong' achievement badge.",
          actionText: "View achievement progress?",
          actionIcon: Calendar
        };
      default:
        return {
          title: currentTip.title,
          description: currentTip.content,
          actionText: "Set reminder for next prayer?",
          actionIcon: Clock
        };
    }
  };

  const personalizedContent = getPersonalizedContent();
  
  return (
    <Card className="mb-4 overflow-hidden relative bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:from-gray-900/80 dark:to-gray-800/40 dark:border-gray-700/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
        <div className="flex items-center space-x-2">
          <motion.div 
            className="flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm rounded-lg p-2 border border-primary/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <div>
            <span className="font-semibold text-sm bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">MULVI</span>
            {isDailyTip && (
              <div className="text-xs text-primary/60 font-medium">Today's Insight</div>
            )}
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevTip}
            className="h-7 w-7 p-0 rounded-lg bg-white/50 hover:bg-white/70 border border-white/30 backdrop-blur-sm dark:bg-gray-800/50 dark:hover:bg-gray-700/70"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <div className="flex gap-1 mx-2">
            {tips.map((_, index) => (
              <motion.div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentTipIndex 
                    ? 'bg-primary shadow-sm' 
                    : index === dailyTipIndex
                    ? 'bg-primary/50 ring-1 ring-primary/30'
                    : 'bg-white/40 dark:bg-gray-600/40'
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextTip}
            className="h-7 w-7 p-0 rounded-lg bg-white/50 hover:bg-white/70 border border-white/30 backdrop-blur-sm dark:bg-gray-800/50 dark:hover:bg-gray-700/70"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-5 pb-5">
        {showInsight ? (
          <div className="relative h-32 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentTipIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0 space-y-4"
              >
                <p className="text-sm text-foreground/90 font-normal leading-relaxed px-1">
                  {personalizedContent.description}
                </p>
                
                {/* Actionable suggestion */}
                <motion.div 
                  className="bg-gradient-to-r from-white/60 to-white/30 backdrop-blur-sm rounded-lg p-3 text-xs flex items-center justify-between border border-white/20 shadow-sm dark:from-gray-800/60 dark:to-gray-700/30"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <personalizedContent.actionIcon size={14} className="text-primary shrink-0" />
                    <span className="font-normal text-xs truncate">{personalizedContent.actionText}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs bg-white/70 hover:bg-white/90 border-white/40 backdrop-blur-sm shadow-sm dark:bg-gray-800/70 dark:hover:bg-gray-700/90 shrink-0 ml-2"
                    onClick={toggleActionMenu}
                  >
                    Add
                  </Button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
            
            {/* Action menu */}
            <AnimatePresence>
              {showActionMenu && (
                <motion.div 
                  className="absolute top-20 left-0 right-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md shadow-lg rounded-lg p-3 text-xs space-y-2 border border-white/30 z-10 dark:from-gray-900/90 dark:to-gray-800/70"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <motion.button 
                    className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/50 flex items-center gap-2 transition-all duration-200 font-normal dark:hover:bg-gray-700/50"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar size={14} className="text-primary" />
                    <span>Add to Google Calendar</span>
                  </motion.button>
                  <motion.button 
                    className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/50 flex items-center gap-2 transition-all duration-200 font-normal dark:hover:bg-gray-700/50"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar size={14} className="text-primary" />
                    <span>Add to Apple Calendar</span>
                  </motion.button>
                  <motion.button 
                    className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/50 flex items-center gap-2 transition-all duration-200 font-normal dark:hover:bg-gray-700/50"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Clock size={14} className="text-primary" />
                    <span>Set app reminder</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <motion.div 
              className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}
        
        {showInsight && !showActionMenu && (
          <motion.div 
            className="flex items-center justify-between pt-3 mt-3 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/insights'}
              className="text-xs text-primary/80 hover:text-primary p-0 h-auto font-medium"
            >
              View all insights →
            </Button>
            {isDailyTip && (
              <span className="text-xs text-primary/60 font-medium">
                Updates daily
              </span>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
