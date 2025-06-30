'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';

// Mock data for prayer completion
const generateMockPrayerData = (date: Date) => {
  // Generate some random prayer completion data
  const day = date.getDate();
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  // Create more consistent patterns for demo purposes
  const completedPrayers = prayers.filter(() => {
    // Higher chance of completion for more recent days
    const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24));
    const baseChance = daysAgo > 14 ? 0.5 : 0.8;
    return Math.random() < baseChance;
  });
  
  return {
    date,
    completedPrayers,
    totalPrayers: prayers.length,
    completionRate: (completedPrayers.length / prayers.length) * 100,
    streak: day % 7 === 0 ? 0 : (day % 7), // Reset streak every 7 days for demo
  };
};

// Generate mock data for the last 60 days
const generateCalendarData = () => {
  const today = new Date();
  const startDate = subDays(today, 59);
  const dateRange = eachDayOfInterval({ start: startDate, end: today });
  
  return dateRange.map(date => generateMockPrayerData(date));
};

const mockCalendarData = generateCalendarData();

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Find data for the selected date
  const selectedDateData = selectedDate ? 
    mockCalendarData.find(item => isSameDay(item.date, selectedDate)) : 
    undefined;
  
  // Function to determine the day's completion status for calendar highlighting
  const getDayCompletionStatus = (date: Date) => {
    const dayData = mockCalendarData.find(item => isSameDay(item.date, date));
    if (!dayData) return 'none';
    
    const completionRate = dayData.completionRate;
    if (completionRate === 100) return 'full';
    if (completionRate >= 60) return 'high';
    if (completionRate >= 20) return 'partial';
    return 'low';
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setCurrentMonth(previousMonth);
  };
  
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // Prayer names for display
  const prayerNames = {
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha'
  };
  
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Prayer Calendar</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Calendar */}
        <Card className="mb-6">
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border w-full"
              modifiers={{
                full: (date) => getDayCompletionStatus(date) === 'full',
                high: (date) => getDayCompletionStatus(date) === 'high',
                partial: (date) => getDayCompletionStatus(date) === 'partial',
                low: (date) => getDayCompletionStatus(date) === 'low',
              }}
              modifiersClassNames={{
                full: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                high: 'bg-primary/70 text-primary-foreground hover:bg-primary/70 hover:text-primary-foreground focus:bg-primary/70 focus:text-primary-foreground',
                partial: 'bg-primary/40 text-primary-foreground hover:bg-primary/40 hover:text-primary-foreground focus:bg-primary/40 focus:text-primary-foreground',
                low: 'bg-primary/20 text-foreground hover:bg-primary/20 hover:text-foreground focus:bg-primary/20 focus:text-foreground',
              }}
            />
          </CardContent>
        </Card>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-between items-center mb-6 px-1 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-xs">All prayers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/70"></div>
            <span className="text-xs">Most prayers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/40"></div>
            <span className="text-xs">Some prayers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/20"></div>
            <span className="text-xs">Few prayers</span>
          </div>
        </div>
        
        {/* Selected Day Details */}
        {selectedDateData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{format(selectedDateData.date, 'EEEE, MMMM d')}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <Progress value={selectedDateData.completionRate} className="h-2" />
                  <span className="text-xs font-medium">{Math.round(selectedDateData.completionRate)}%</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((prayer) => {
                  const isCompleted = selectedDateData.completedPrayers.includes(prayer);
                  return (
                    <div key={prayer} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={`${isCompleted ? 'font-medium' : 'text-muted-foreground'}`}>
                          {prayerNames[prayer as keyof typeof prayerNames]}
                        </span>
                      </div>
                      <Badge variant={isCompleted ? "default" : "outline"} className="text-[10px]">
                        {isCompleted ? "Completed" : "Missed"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              
              {/* Streak information */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current streak</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{selectedDateData.streak}</span>
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
