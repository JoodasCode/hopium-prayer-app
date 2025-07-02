'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { tips } from './data';

export function SmartTip() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showInsight, setShowInsight] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  
  // Simulate loading delay for the insight
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInsight(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    setShowActionMenu(false);
  };
  
  const toggleActionMenu = () => {
    setShowActionMenu(!showActionMenu);
  };
  
  const currentTip = tips[currentTipIndex];
  
  return (
    <Card className="mb-4 shadow-sm border-border bg-gradient-to-br from-card to-card/80 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center bg-primary/10 rounded-md p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-semibold text-sm">LOPI</span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {showInsight ? (
          <div className="space-y-3">
            <p className="text-sm">Lopi noticed your Asr prayer timing improved 2x this week 👀</p>
            
            {/* Actionable suggestion */}
            <div className="bg-secondary/30 rounded-lg p-2 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>Set reminder for Asr at 3:45 PM?</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-xs bg-background/50 hover:bg-background"
                onClick={toggleActionMenu}
              >
                Add
              </Button>
            </div>
            
            {/* Action menu */}
            {showActionMenu && (
              <div className="bg-card shadow-md rounded-lg p-3 text-xs space-y-2 border border-border animate-fadeIn">
                <button className="w-full text-left py-1.5 px-2 rounded hover:bg-secondary/30 flex items-center gap-2 transition-colors">
                  <Calendar size={14} />
                  <span>Add to Google Calendar</span>
                </button>
                <button className="w-full text-left py-1.5 px-2 rounded hover:bg-secondary/30 flex items-center gap-2 transition-colors">
                  <Calendar size={14} />
                  <span>Add to Apple Calendar</span>
                </button>
                <button className="w-full text-left py-1.5 px-2 rounded hover:bg-secondary/30 flex items-center gap-2 transition-colors">
                  <Clock size={14} />
                  <span>Set app reminder</span>
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-1">
              <Button variant="outline" size="sm" onClick={handleNextTip} className="h-7 text-xs">
                Next insight
              </Button>
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs p-0 h-auto"
                onClick={() => window.location.href = '/insights'}
              >
                View prayer insights
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-[72px] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
