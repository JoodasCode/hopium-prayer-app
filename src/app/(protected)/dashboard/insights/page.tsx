'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
// Removed UserStateContext dependency
import { EmptyState } from '@/components/ui/empty-state';
import { SampleInsights } from '@/components/ui/sample-data';
import { BarChart, Calendar, TrendingUp } from 'lucide-react';

type PrayerStats = {
  total: number;
  completed: number;
  streak: number;
  mostConsistentPrayer: string;
  weeklyCompletion: Record<string, number>;
  monthlyTrend: Record<string, number>;
};

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PrayerStats | null>(null);
  
  const supabase = useSupabaseClient();
  // Simplified insights page
  
  useEffect(() => {
    if (userState.isAuthenticated) {
      fetchPrayerStats();
    } else {
      setLoading(false);
    }
  }, [userState.isAuthenticated]);
  
  const fetchPrayerStats = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, we would fetch actual stats from the backend
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user has prayer data
      const { count, error } = await supabase
        .from('prayer_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userState.id);
      
      if (error) throw error;
      
      if (count && count > 0) {
        // Mock data for demonstration
        setStats({
          total: 35,
          completed: 28,
          streak: 5,
          mostConsistentPrayer: 'Fajr',
          weeklyCompletion: {
            'Monday': 80,
            'Tuesday': 100,
            'Wednesday': 60,
            'Thursday': 100,
            'Friday': 100,
            'Saturday': 40,
            'Sunday': 60
          },
          monthlyTrend: {
            'Week 1': 65,
            'Week 2': 70,
            'Week 3': 85,
            'Week 4': 80
          }
        });
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching prayer stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="container max-w-4xl py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Prayer Insights</h1>
          <p className="text-muted-foreground">Analyze your prayer patterns and consistency.</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  // Render empty state if no data
  if (!stats) {
    return (
      <div className="container max-w-4xl py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Prayer Insights</h1>
          <p className="text-muted-foreground">Analyze your prayer patterns and consistency.</p>
        </div>
        <EmptyState
          title="No prayer data yet"
          description="Start tracking your prayers to see insights and analytics."
          icon={BarChart}
          actions={[
            { label: 'Track Prayers', href: '/dashboard' },
            { label: 'View Calendar', href: '/dashboard/calendar' }
          ]}
          sampleComponent={<SampleInsights />}
        />
      </div>
    );
  }
  
  // Render insights with data
  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Prayer Insights</h1>
        <p className="text-muted-foreground">Analyze your prayer patterns and consistency.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((stats.completed / stats.total) * 100)}%</div>
            <p className="text-xs text-muted-foreground">{stats.completed} of {stats.total} prayers completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Consistent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mostConsistentPrayer}</div>
            <p className="text-xs text-muted-foreground">Your most reliable prayer</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="weekly">Weekly Analysis</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trend</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Prayer Completion</CardTitle>
              <CardDescription>Your prayer consistency throughout the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between gap-2">
                {Object.entries(stats.weeklyCompletion).map(([day, percentage]) => (
                  <div key={day} className="flex flex-col items-center gap-2 w-full">
                    <div 
                      className="bg-primary rounded-t-md w-full" 
                      style={{ height: `${percentage * 2}px` }}
                    />
                    <span className="text-xs font-medium">{day.substring(0, 3)}</span>
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
              <CardDescription>Your prayer consistency over the past month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between gap-2">
                {Object.entries(stats.monthlyTrend).map(([week, percentage]) => (
                  <div key={week} className="flex flex-col items-center gap-2 w-full">
                    <div 
                      className="bg-primary rounded-t-md w-full" 
                      style={{ height: `${percentage * 2}px` }}
                    />
                    <span className="text-xs font-medium">{week}</span>
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
