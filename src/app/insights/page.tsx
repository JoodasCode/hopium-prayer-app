'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BarChart3, TrendingUp, Heart, Calendar, Clock, ArrowUpRight, Sparkles, Target, Award } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { cn } from '@/lib/utils';

// Mock data for insights
const insightsData = {
  focusScore: 87,
  mindfulnessIndex: 92,
  consistencyScore: 84,
  streakDays: 12,
  totalPrayers: 158,
  completionRate: 92,
  emotionalState: "Balanced",
  timeDistribution: {
    onTime: 65,
    early: 20,
    late: 15
  },
  weeklyTrend: [
    { day: 'Mon', score: 85, prayers: 5 },
    { day: 'Tue', score: 78, prayers: 4 },
    { day: 'Wed', score: 92, prayers: 5 },
    { day: 'Thu', score: 88, prayers: 5 },
    { day: 'Fri', score: 76, prayers: 3 },
    { day: 'Sat', score: 82, prayers: 4 },
    { day: 'Sun', score: 87, prayers: 5 }
  ],
  monthlyProgress: [
    { day: 'W1', score: 82, prayers: 32 },
    { day: 'W2', score: 85, prayers: 33 },
    { day: 'W3', score: 79, prayers: 30 },
    { day: 'W4', score: 88, prayers: 34 }
  ],
  emotionalJourney: [
    { date: '2023-06-12', before: 'Anxious', after: 'Calm', prayer: 'Fajr' },
    { date: '2023-06-13', before: 'Tired', after: 'Refreshed', prayer: 'Dhuhr' },
    { date: '2023-06-14', before: 'Distracted', after: 'Focused', prayer: 'Asr' },
    { date: '2023-06-15', before: 'Stressed', after: 'Peaceful', prayer: 'Maghrib' },
    { date: '2023-06-16', before: 'Worried', after: 'Hopeful', prayer: 'Isha' }
  ],
  prayerCorrelations: [
    { prayer: 'Fajr', benefit: 'Morning focus', score: 92, improvement: '+8%' },
    { prayer: 'Dhuhr', benefit: 'Midday calm', score: 78, improvement: '+5%' },
    { prayer: 'Asr', benefit: 'Afternoon energy', score: 85, improvement: '+12%' },
    { prayer: 'Maghrib', benefit: 'Evening reflection', score: 89, improvement: '+7%' },
    { prayer: 'Isha', benefit: 'Night peace', score: 94, improvement: '+9%' }
  ],
  prayerTimings: [
    { prayer: 'Fajr', avgTime: '5:23 AM', consistency: 88 },
    { prayer: 'Dhuhr', avgTime: '1:15 PM', consistency: 76 },
    { prayer: 'Asr', avgTime: '4:45 PM', consistency: 82 },
    { prayer: 'Maghrib', avgTime: '7:32 PM', consistency: 94 },
    { prayer: 'Isha', avgTime: '9:18 PM', consistency: 79 }
  ],
  insights: [
    'Your Fajr prayers correlate with 23% higher focus throughout the day',
    'You experience the most emotional improvement after Maghrib prayers',
    'Your prayer consistency has improved by 18% this month',
    'Prayers performed with longer duration show 27% higher mindfulness scores',
    'Days with all five prayers show 34% better emotional balance'
  ],
  goals: [
    { name: 'Consistent Fajr', progress: 78 },
    { name: 'Mindful prayers', progress: 62 },
    { name: 'Learn 5 surahs', progress: 40 },
    { name: 'Daily Dhikr', progress: 85 }
  ]
};

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<string>('week');
  const [selectedPrayer, setSelectedPrayer] = useState<string>('all');
  const [hasData, setHasData] = useState<boolean>(true); // Start with true to show data by default
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = useSupabaseClient();

  // Check if user has prayer data
  useEffect(() => {
    checkUserData();
  }, []);

  const checkUserData = async () => {
    try {
      setLoading(true);
      // For now, simulate checking user data
      // In real implementation, check if user has any prayer records
      const { count } = await supabase
        .from('prayer_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', 'mock-user-id');
      
      // For demo purposes, let's say if count is 0 or null, show empty state
      // You can change this logic based on your needs
      setHasData(count ? count > 0 : true); // Default to true for demo
    } catch (error) {
      console.error('Error checking user data:', error);
      setHasData(true); // Default to showing data on error
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render bar charts
  const renderBarChart = (data: { day: string; score: number; prayers?: number }[]) => {
    return (
      <div className="flex items-end justify-between h-32 mt-4 mb-1">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center w-8">
            <div className="relative w-full mb-1">
              <div 
                className="w-full bg-primary rounded-t transition-all duration-300 ease-in-out"
                style={{ height: `${(item.score / 100) * 80}px` }}
              ></div>
            </div>
            <span className="text-xs text-muted-foreground">{item.day}</span>
            {item.prayers !== undefined && (
              <span className="text-[10px] text-muted-foreground mt-0.5">{item.prayers}/5</span>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Helper function to render emotion transitions
  const renderEmotionTransitions = () => {
    return (
      <div className="space-y-3 mt-4">
        {insightsData.emotionalJourney.map((day, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm">{day.date.split('-')[2]} June</span>
              <Badge variant="outline" className="text-[10px]">{day.prayer}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{day.before}</Badge>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              <Badge variant="default" className="text-xs">{day.after}</Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Helper function to render prayer correlations
  const renderPrayerCorrelations = () => {
    return (
      <div className="space-y-4 mt-4">
        {insightsData.prayerCorrelations.map((item) => (
          <div key={item.prayer} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.prayer}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{item.benefit}</span>
                <span className="text-xs text-emerald-500 font-medium">{item.improvement}</span>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${item.score}%` }}
              ></div>
            </div>
            <div className="flex justify-end">
              <span className="text-xs font-medium">{item.score}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render prayer timings
  const renderPrayerTimings = () => {
    return (
      <div className="space-y-4 mt-4">
        {insightsData.prayerTimings.map((item) => (
          <div key={item.prayer} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.prayer}</span>
              <span className="text-xs text-muted-foreground">Avg: {item.avgTime}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${item.consistency}%` }}
              ></div>
            </div>
            <div className="flex justify-end">
              <span className="text-xs font-medium">{item.consistency}% consistent</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render time distribution
  const renderTimeDistribution = () => {
    const { onTime, early, late } = insightsData.timeDistribution;
    return (
      <div className="mt-4">
        <div className="flex w-full h-8 rounded-md overflow-hidden">
          <div 
            className="bg-emerald-500 flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${onTime}%` }}
          >
            {onTime}%
          </div>
          <div 
            className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${early}%` }}
          >
            {early}%
          </div>
          <div 
            className="bg-amber-500 flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${late}%` }}
          >
            {late}%
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>On time</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Early</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span>Late</span>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to render goals
  const renderGoals = () => {
    return (
      <div className="space-y-4 mt-4">
        {insightsData.goals.map((goal, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{goal.name}</span>
              <span className="text-xs font-medium">{goal.progress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Prayer Insights</h1>
            </div>
          </div>
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <PhantomBottomNav />
      </div>
    );
  }

  // Show empty state for new users
  if (!hasData) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Prayer Insights</h1>
            </div>
          </div>
          <EmptyState
            title="Start Your Prayer Journey"
            description="Log your first prayer to unlock personalized insights and track your spiritual growth."
            icon={<BarChart3 className="h-6 w-6" />}
            actionLabel="Log First Prayer"
            onAction={() => window.location.href = '/dashboard'}
            secondaryLabel="View Calendar"
            onSecondaryAction={() => window.location.href = '/calendar'}
          />
        </div>
        <PhantomBottomNav />
      </div>
    );
  }

  // Show insights with data
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Prayer Insights</h1>
          </div>
          <Select defaultValue="week" onValueChange={(value) => setTimeRange(value)}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">{insightsData.focusScore}</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Focus</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">{insightsData.mindfulnessIndex}</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Mindfulness</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-primary">{insightsData.consistencyScore}</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Consistency</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prayer Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{insightsData.streakDays}</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Day Streak</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{insightsData.totalPrayers}</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Total Prayers</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold">{insightsData.completionRate}%</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Completion</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="trends" className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="trends" className="text-xs">
              <TrendingUp className="h-4 w-4 mr-1" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="emotions" className="text-xs">
              <Heart className="h-4 w-4 mr-1" />
              Emotions
            </TabsTrigger>
            <TabsTrigger value="timing" className="text-xs">
              <Clock className="h-4 w-4 mr-1" />
              Timing
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs">
              <Target className="h-4 w-4 mr-1" />
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            {/* Weekly Trend */}
            <Card className="mb-6 border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Focus Trend</span>
                </CardTitle>
                <CardDescription>Your prayer focus over time</CardDescription>
              </CardHeader>
              <CardContent>
                {timeRange === 'week' && renderBarChart(insightsData.weeklyTrend)}
                {timeRange === 'month' && renderBarChart(insightsData.monthlyProgress)}
                {timeRange === 'year' && renderBarChart(insightsData.monthlyProgress)}
              </CardContent>
            </Card>
            
            {/* Prayer Correlations */}
            <Card className="mb-6 border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Prayer Benefits</span>
                </CardTitle>
                <CardDescription>How each prayer affects your wellbeing</CardDescription>
              </CardHeader>
              <CardContent>
                {renderPrayerCorrelations()}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Personalized Insights</span>
                </CardTitle>
                <CardDescription>AI-powered observations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insightsData.insights.slice(0, 4).map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emotions">
            {/* Emotional Journey */}
            <Card className="mb-6 border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span>Emotional Journey</span>
                </CardTitle>
                <CardDescription>How prayer affects your state of mind</CardDescription>
              </CardHeader>
              <CardContent>
                {renderEmotionTransitions()}
              </CardContent>
            </Card>

            {/* Current Emotional State */}
            <Card className="border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Current State</span>
                </CardTitle>
                <CardDescription>Your emotional wellbeing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  <Badge className="mb-2 px-4 py-1 text-base">{insightsData.emotionalState}</Badge>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Your prayers have helped you maintain a balanced emotional state this week.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timing">
            {/* Prayer Timing Distribution */}
            <Card className="mb-6 border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Prayer Timing</span>
                </CardTitle>
                <CardDescription>When you complete your prayers</CardDescription>
              </CardHeader>
              <CardContent>
                {renderTimeDistribution()}
              </CardContent>
            </Card>

            {/* Prayer Consistency */}
            <Card className="border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Prayer Consistency</span>
                </CardTitle>
                <CardDescription>Your prayer timing patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {renderPrayerTimings()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            {/* Goals */}
            <Card className="mb-6 border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span>Your Goals</span>
                </CardTitle>
                <CardDescription>Track your spiritual journey</CardDescription>
              </CardHeader>
              <CardContent>
                {renderGoals()}
                <Button variant="outline" className="w-full mt-6 text-sm">
                  <Target className="h-4 w-4 mr-2" /> Add New Goal
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span>Achievements</span>
                </CardTitle>
                <CardDescription>Your spiritual milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-1">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-xs text-center">7 Day Streak</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Navigation */}
      <PhantomBottomNav />
    </div>
  );
}
