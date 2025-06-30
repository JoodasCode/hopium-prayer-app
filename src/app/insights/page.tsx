'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, TrendingUp, Heart } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';

// Mock data for insights
const insightsData = {
  focusScore: 76,
  mindfulnessIndex: 82,
  emotionalState: 'Peaceful',
  weeklyTrend: [
    { day: 'Mon', score: 75 },
    { day: 'Tue', score: 82 },
    { day: 'Wed', score: 68 },
    { day: 'Thu', score: 90 },
    { day: 'Fri', score: 95 },
    { day: 'Sat', score: 60 },
    { day: 'Sun', score: 78 },
  ],
  emotionalJourney: [
    { date: '2025-06-22', before: 'Anxious', after: 'Calm' },
    { date: '2025-06-23', before: 'Distracted', after: 'Focused' },
    { date: '2025-06-24', before: 'Tired', after: 'Refreshed' },
    { date: '2025-06-25', before: 'Worried', after: 'Peaceful' },
    { date: '2025-06-26', before: 'Stressed', after: 'Relaxed' },
    { date: '2025-06-27', before: 'Rushed', after: 'Present' },
    { date: '2025-06-28', before: 'Scattered', after: 'Centered' },
  ],
  prayerCorrelations: [
    { prayer: 'Fajr', benefit: 'Mental clarity', score: 85 },
    { prayer: 'Dhuhr', benefit: 'Stress reduction', score: 72 },
    { prayer: 'Asr', benefit: 'Focus improvement', score: 68 },
    { prayer: 'Maghrib', benefit: 'Emotional balance', score: 90 },
    { prayer: 'Isha', benefit: 'Sleep quality', score: 78 },
  ],
  insights: [
    'Your focus is highest during Maghrib prayers',
    'You tend to feel more peaceful after Fajr prayer',
    'Friday prayers show your best mindfulness scores',
    'Consider setting aside more preparation time for Asr',
    'Your emotional state improves most after prayer when you started feeling anxious',
  ]
};

export default function InsightsPage() {
  // Helper function to render bar charts
  const renderBarChart = (data: { day: string; score: number }[]) => {
    return (
      <div className="flex items-end justify-between h-32 mt-4 mb-1">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center w-8">
            <div className="relative w-full mb-1">
              <div 
                className="w-full bg-primary rounded-t"
                style={{ height: `${(item.score / 100) * 80}px` }}
              ></div>
            </div>
            <span className="text-xs text-muted-foreground">{item.day}</span>
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
              <span className="font-medium">{item.prayer}</span>
              <span className="text-sm text-muted-foreground">{item.benefit}</span>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={item.score} className="h-2 flex-1" />
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium">{item.score}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
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
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary">{insightsData.focusScore}</span>
                <span className="text-xs text-muted-foreground mt-1">Focus score</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary">{insightsData.mindfulnessIndex}</span>
                <span className="text-xs text-muted-foreground mt-1">Mindfulness</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Weekly Trend */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Weekly Focus Trend</span>
            </CardTitle>
            <CardDescription>Your prayer focus over time</CardDescription>
          </CardHeader>
          <CardContent>
            {renderBarChart(insightsData.weeklyTrend)}
          </CardContent>
        </Card>
        
        {/* Emotional Journey */}
        <Card className="mb-6">
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
        
        {/* Prayer Correlations */}
        <Card className="mb-6">
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span>Personalized Insights</span>
            </CardTitle>
            <CardDescription>AI-powered observations</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insightsData.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
