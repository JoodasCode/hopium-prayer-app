'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useUserState } from '@/contexts/UserStateContext';
import { cn } from '@/lib/utils';

type PrayerRecord = {
  id: string;
  prayer_name: string;
  scheduled_time: string;
  completed: boolean;
  completed_time: string | null;
};

type DayPrayerData = {
  date: Date;
  prayers: {
    total: number;
    completed: number;
  };
};

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayPrayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [dayPrayers, setDayPrayers] = useState<PrayerRecord[]>([]);
  
  const supabase = useSupabaseClient();
  const { userState } = useUserState();
  
  // Generate calendar days for the current month
  useEffect(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });
    
    // Initialize calendar days with empty prayer data
    const initialCalendarDays = days.map(day => ({
      date: day,
      prayers: { total: 0, completed: 0 }
    }));
    
    setCalendarDays(initialCalendarDays);
    fetchMonthData(firstDay, lastDay);
  }, [currentMonth]);
  
  // Fetch prayer data for the current month
  const fetchMonthData = async (start: Date, end: Date) => {
    if (!userState.isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const startStr = format(start, 'yyyy-MM-dd');
      const endStr = format(end, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('prayer_records')
        .select('*')
        .eq('user_id', userState.id)
        .gte('scheduled_time', `${startStr}T00:00:00`)
        .lte('scheduled_time', `${endStr}T23:59:59`);
      
      if (error) throw error;
      
      // Process the data to update calendar days
      const updatedCalendarDays = [...calendarDays];
      
      if (data) {
        // Group prayers by date
        const prayersByDate: Record<string, PrayerRecord[]> = {};
        
        data.forEach((prayer: PrayerRecord) => {
          const prayerDate = prayer.scheduled_time.split('T')[0];
          if (!prayersByDate[prayerDate]) {
            prayersByDate[prayerDate] = [];
          }
          prayersByDate[prayerDate].push(prayer);
        });
        
        // Update calendar days with prayer data
        updatedCalendarDays.forEach((day, index) => {
          const dayStr = format(day.date, 'yyyy-MM-dd');
          const dayPrayers = prayersByDate[dayStr] || [];
          
          updatedCalendarDays[index] = {
            date: day.date,
            prayers: {
              total: dayPrayers.length,
              completed: dayPrayers.filter(p => p.completed).length
            }
          };
        });
      }
      
      setCalendarDays(updatedCalendarDays);
      
      // If a day is selected, update its prayers
      if (selectedDay) {
        fetchDayPrayers(selectedDay);
      }
    } catch (error) {
      console.error('Error fetching prayer data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch prayers for a specific day
  const fetchDayPrayers = async (date: Date) => {
    if (!userState.isAuthenticated) return;
    
    try {
      const dayStr = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('prayer_records')
        .select('*')
        .eq('user_id', userState.id)
        .gte('scheduled_time', `${dayStr}T00:00:00`)
        .lte('scheduled_time', `${dayStr}T23:59:59`)
        .order('scheduled_time');
      
      if (error) throw error;
      
      setDayPrayers(data || []);
    } catch (error) {
      console.error('Error fetching day prayers:', error);
    }
  };
  
  // Handle day selection
  const handleDayClick = (day: DayPrayerData) => {
    setSelectedDay(day.date);
    fetchDayPrayers(day.date);
  };
  
  // Navigate to previous month
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Prayer Calendar</h1>
        <p className="text-muted-foreground">Track your prayer consistency and progress.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Monthly View</CardTitle>
              <CardDescription>Your prayer activity for {format(currentMonth, 'MMMM yyyy')}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                
                {/* Fill in empty cells before the first day of the month */}
                {Array.from({ length: calendarDays[0]?.date.getDay() || 0 }).map((_, i) => (
                  <div key={`empty-start-${i}`} className="aspect-square"></div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day) => {
                  const isSelected = selectedDay && isSameDay(day.date, selectedDay);
                  const hasCompletedPrayers = day.prayers.completed > 0;
                  const allPrayersCompleted = day.prayers.completed === day.prayers.total && day.prayers.total > 0;
                  
                  return (
                    <button
                      key={day.date.toISOString()}
                      className={cn(
                        "aspect-square rounded-md flex flex-col items-center justify-center relative",
                        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                        day.prayers.total === 0 ? "opacity-50" : ""
                      )}
                      onClick={() => handleDayClick(day)}
                    >
                      <span className="text-sm">{format(day.date, 'd')}</span>
                      {day.prayers.total > 0 && (
                        <div className="mt-1 flex items-center justify-center">
                          <Badge 
                            variant={allPrayersCompleted ? "default" : hasCompletedPrayers ? "outline" : "secondary"}
                            className="text-[10px] h-4"
                          >
                            {day.prayers.completed}/{day.prayers.total}
                          </Badge>
                        </div>
                      )}
                    </button>
                  );
                })}
                
                {/* Fill in empty cells after the last day of the month */}
                {Array.from({ length: 6 - (calendarDays[calendarDays.length - 1]?.date.getDay() || 0) }).map((_, i) => (
                  <div key={`empty-end-${i}`} className="aspect-square"></div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : 'Select a day'}
            </CardTitle>
            <CardDescription>
              {selectedDay ? 'Prayer details for this day' : 'Click on a day to view prayer details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDay ? (
              dayPrayers.length > 0 ? (
                <div className="space-y-4">
                  {dayPrayers.map((prayer) => (
                    <div key={prayer.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">{prayer.prayer_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(prayer.scheduled_time), 'h:mm a')}
                        </div>
                      </div>
                      <Badge variant={prayer.completed ? "default" : "outline"}>
                        {prayer.completed ? 'Completed' : 'Missed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <CalendarIcon className="mx-auto h-8 w-8 opacity-50 mb-2" />
                  <p>No prayers recorded for this day</p>
                </div>
              )
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <CalendarIcon className="mx-auto h-8 w-8 opacity-50 mb-2" />
                <p>Select a day to view prayer details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
