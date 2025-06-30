'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Award, BarChart3, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';

// Mock data for user profile
const userData = {
  name: 'Ahmed Hassan',
  joinDate: '2025-03-15',
  streak: 14,
  totalPrayers: 421,
  completionRate: 87,
  focusScore: 76,
  mindfulnessIndex: 82,
  emotionalState: 'Peaceful',
  badges: [
    { id: 1, name: 'Early Riser', description: 'Completed Fajr prayer 7 days in a row', icon: '🌅', unlocked: true },
    { id: 2, name: 'Consistency Master', description: 'Completed all prayers for 14 days', icon: '🔄', unlocked: true },
    { id: 3, name: 'Deep Focus', description: 'Achieved 90% focus score for 5 prayers', icon: '🧠', unlocked: true },
    { id: 4, name: 'Spiritual Explorer', description: 'Used Lopi AI for spiritual guidance 10 times', icon: '🔍', unlocked: true },
    { id: 5, name: 'Mindfulness Guru', description: 'Maintained 80% mindfulness index for 30 days', icon: '🧘', unlocked: false },
    { id: 6, name: 'Prayer Scholar', description: 'Learned all prayer variations and supplications', icon: '📚', unlocked: false },
  ],
  prayerStats: {
    fajr: { completed: 78, missed: 12, avgFocus: 72 },
    dhuhr: { completed: 82, missed: 8, avgFocus: 68 },
    asr: { completed: 76, missed: 14, avgFocus: 65 },
    maghrib: { completed: 89, missed: 1, avgFocus: 84 },
    isha: { completed: 75, missed: 15, avgFocus: 71 },
  },
  emotionalJourney: [
    { date: '2025-06-22', before: 'Anxious', after: 'Calm' },
    { date: '2025-06-23', before: 'Distracted', after: 'Focused' },
    { date: '2025-06-24', before: 'Tired', after: 'Refreshed' },
    { date: '2025-06-25', before: 'Worried', after: 'Peaceful' },
    { date: '2025-06-26', before: 'Stressed', after: 'Relaxed' },
    { date: '2025-06-27', before: 'Rushed', after: 'Present' },
    { date: '2025-06-28', before: 'Scattered', after: 'Centered' },
  ],
  weeklyProgress: [
    { day: 'Mon', completed: 5, focus: 75 },
    { day: 'Tue', completed: 5, focus: 82 },
    { day: 'Wed', completed: 4, focus: 68 },
    { day: 'Thu', completed: 5, focus: 90 },
    { day: 'Fri', completed: 5, focus: 95 },
    { day: 'Sat', completed: 3, focus: 60 },
    { day: 'Sun', completed: 4, focus: 78 },
  ],
  insights: [
    'Your focus is highest during Maghrib prayers',
    'You tend to feel more peaceful after Fajr prayer',
    'Friday prayers show your best mindfulness scores',
    'Consider setting aside more preparation time for Asr',
    'Your emotional state improves most after prayer when you started feeling anxious',
  ]
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  
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
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
        </div>
        
        {/* User Info Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{userData.name}</h2>
                <p className="text-sm text-muted-foreground">Member since {userData.joinDate}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {userData.streak} day streak
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {userData.completionRate}% completion
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs */}
        <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {/* Focus Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Prayer Focus</CardTitle>
                <CardDescription>Your mindfulness during prayers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Focus Score</span>
                      <span className="text-sm">{userData.focusScore}%</span>
                    </div>
                    <Progress value={userData.focusScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Mindfulness Index</span>
                      <span className="text-sm">{userData.mindfulnessIndex}%</span>
                    </div>
                    <Progress value={userData.mindfulnessIndex} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Insights */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Personalized Insights</CardTitle>
                <CardDescription>Based on your prayer patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {userData.insights.slice(0, 3).map((insight, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            {/* Prayer Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Prayer Statistics</CardTitle>
                <CardDescription>Your prayer completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(userData.prayerStats).map(([prayer, stats]) => (
                    <div key={prayer} className="border-b border-border pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{prayer}</span>
                        <span className="text-xs text-muted-foreground">
                          {stats.completed} completed, {stats.missed} missed
                        </span>
                      </div>
                      <Progress 
                        value={(stats.completed / (stats.completed + stats.missed)) * 100} 
                        className="h-1.5" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="badges" className="space-y-4">
            {/* Badges */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Your Achievements</CardTitle>
                <CardDescription>Badges earned through consistent prayer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {userData.badges.map((badge) => (
                    <div 
                      key={badge.id} 
                      className={`border rounded-lg p-3 ${badge.unlocked ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border text-muted-foreground'}`}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <h3 className="text-sm font-medium">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                      {!badge.unlocked && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Locked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
