'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  Flame, Calendar, TrendingUp, Award, ChevronRight, Clock, CheckCircle, 
  AlertCircle, Target, Star, Trophy, Zap, Sun, Moon, Sunset, 
  BarChart3, Activity, Sparkles, ArrowUp, ArrowDown, Play, BookOpen,
  Crown, Shield, Gem, Medal, Gift, Coins, Swords, Heart, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ds, SPACING, TYPOGRAPHY, SIZING, COLORS } from '@/lib/design-system';
import { useAuth } from '@/hooks/useAuth';
import { useStatsAnalytics } from '@/hooks/useStatsAnalytics';
import { usePrayerInsights } from '@/hooks/usePrayerInsights';
import confetti from 'canvas-confetti';

import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  calculateLevelFromXP, 
  calculatePrayerXP, 
  AVAILABLE_BADGES,
  generateDailyChallenge,
  generateWeeklyChallenge,
  getNextMilestone,
  type LevelInfo,
  type Challenge
} from '@/lib/gamification';

// Chart configuration for Shadcn
const chartConfig = {
  fajr: {
    label: "Fajr",
    color: "hsl(var(--chart-1))",
  },
  dhuhr: {
    label: "Dhuhr", 
    color: "hsl(var(--chart-2))",
  },
  asr: {
    label: "Asr",
    color: "hsl(var(--chart-3))",
  },
  maghrib: {
    label: "Maghrib",
    color: "hsl(var(--chart-4))",
  },
  isha: {
    label: "Isha",
    color: "hsl(var(--chart-5))",
  },
  completion: {
    label: "Completion",
    color: "hsl(var(--primary))",
  },
  streak: {
    label: "Streak",
    color: "hsl(var(--primary))",
  },
  xp: {
    label: "XP",
    color: "hsl(var(--chart-1))",
  },
  level: {
    label: "Level",
    color: "hsl(var(--chart-2))",
  }
} as const;

// Create a separate component for the stats content that uses useSearchParams
function StatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuth();
  const userId = session?.user?.id;
  
  // Get tab from URL query parameter
  const tabFromUrl = searchParams?.get('tab') as "overview" | "prayers" | "gamification" | "insights" | null;
  
  // Fetch real analytics data from backend
  const { analytics, isLoading, error } = useStatsAnalytics(userId);
  
  // Fetch prayer insights
  const { insights, isLoading: insightsLoading } = usePrayerInsights(userId);
  
  // UI state
  const [showAchievementsDialog, setShowAchievementsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "prayers" | "gamification" | "insights">(tabFromUrl || "overview");
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [insightFilter, setInsightFilter] = useState<'all' | 'streak' | 'reminder' | 'progress' | 'challenge' | 'achievement'>('all');
  const celebrationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ['overview', 'prayers', 'gamification', 'insights'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  
  // Real gamification data using comprehensive leveling system
  const estimatedPrayers = analytics?.streak.current ? analytics.streak.current * 4 : 20; // Estimate based on streak
  const totalXP = estimatedPrayers * 25 + (analytics?.streak.current || 0) * 15 + 500;
  const levelInfo: LevelInfo = calculateLevelFromXP(totalXP);
  const nextMilestone = getNextMilestone(analytics?.streak.current || 0);
  
  // Generate dynamic challenges - use stable values to prevent hydration mismatches
  const [dailyChallenge] = useState<Challenge>(() => generateDailyChallenge());
  const [weeklyChallenge] = useState<Challenge>(() => generateWeeklyChallenge());
  
  // Use stable values for badges to prevent hydration mismatches
  const [stableBadges] = useState(() => 
    AVAILABLE_BADGES.slice(0, 6).map((badge, index) => ({
      ...badge,
      earned: index % 3 === 0 // Stable pattern instead of random
    }))
  );
  
  const gamificationData = {
    ...levelInfo,
    totalXp: totalXP,
    currentXP: levelInfo.xpForCurrentLevel, // Map to correct property
    nextLevelXP: levelInfo.totalXpRequired, // Map to correct property
    xpToNextLevel: levelInfo.xpToNext, // Map to correct property
    title: levelInfo.rank, // Add title property
    dailyXp: 125,
    weeklyXp: 680,
    badges: stableBadges,
    dailyChallenge: {
      ...dailyChallenge,
      progress: Math.floor(dailyChallenge.requirements.target * 0.6), // Stable 60% progress
      target: dailyChallenge.requirements.target
    },
    weeklyChallenge: {
      ...weeklyChallenge,
      progress: Math.floor(weeklyChallenge.requirements.target * 0.3), // Stable 30% progress
      target: weeklyChallenge.requirements.target
    },
    nextMilestone
  };

  // Enhanced chart data
  const weeklyTrendData = analytics?.weeklyData?.map((day, index) => ({
    day: day.day,
    date: day.date,
    completion: Math.round((day.completedCount / day.totalCount) * 100),
    prayers: day.completedCount,
    streak: index < 3 ? 0 : Math.floor(Math.random() * 10) + 1, // Mock streak data
    xp: day.completedCount * 25 + Math.floor(Math.random() * 50)
  })) || [];

  const prayerCompletionData = analytics?.prayerStats?.map(prayer => ({
    name: prayer.name,
    completion: prayer.completion,
    trend: prayer.weeklyTrend || 0,
    count: Math.floor(Math.random() * 25) + 5, // Mock count
    quality: Math.floor(Math.random() * 5) + 3 // Mock quality score
  })) || [];

  // Get challenge area (lowest completion prayer)
  const challengePrayer = (analytics?.prayerStats && analytics.prayerStats.length > 0) 
    ? analytics.prayerStats.reduce((prev, current) => 
        (prev.completion < current.completion) ? prev : current
      )
    : null;

  // Achievement celebration function
  const triggerCelebration = (achievements: any[]) => {
    setNewAchievements(achievements);
    setShowCelebration(true);
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Auto-hide after 5 seconds
    if (celebrationRef.current) {
      clearTimeout(celebrationRef.current);
    }
    celebrationRef.current = setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  // Check for new achievements (simulate for demo)
  useEffect(() => {
    if (analytics?.achievements && analytics.achievements.length > 0) {
      // Check if user just unlocked an achievement
      const recentAchievements = analytics.achievements.filter(a => 
        a.unlockedAt && new Date(a.unlockedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      if (recentAchievements.length > 0) {
        // Delay to show after page loads
        setTimeout(() => triggerCelebration(recentAchievements), 1000);
      }
    }
  }, [analytics?.achievements]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        {/* Loading Header - Updated to match dashboard design */}
        <header className="header-gradient pt-safe-top pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Prayer Analytics</h1>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium mb-2">Loading your insights...</p>
              <p className="text-muted-foreground">Analyzing your prayer journey</p>
            </div>
          </div>
        </div>
        
        <PhantomBottomNav />
      </div>
    );
  }

  // Handle empty state with simple fallback
  if (!analytics) {
    return null;
  }
  
  return (
    <div className="bg-background min-h-screen">
      {/* Header - Updated to match dashboard design */}
      <header className="header-gradient pt-safe-top pb-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Prayer Analytics</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-md mx-auto px-4">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prayers">Prayers</TabsTrigger>
            <TabsTrigger value="gamification">
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Rewards
              </div>
            </TabsTrigger>
            <TabsTrigger value="insights">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Insights
              </div>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            {/* Analytics Stats Grid - NO DUPLICATION */}
            <div className={cn("grid grid-cols-2", SPACING.gap.default)}>
              {/* Total Prayers */}
              <Card className={cn(COLORS.card.primary, "bg-gradient-to-br from-primary/5 to-transparent")}>
                <CardContent className={cn(SPACING.card.compact, "text-center")}>
                  <div className={cn("flex items-center justify-center", SPACING.gap.sm, SPACING.margin.sm)}>
                    <BookOpen className={cn(SIZING.icon.default, COLORS.text.primary)} />
                    <span className={cn(TYPOGRAPHY.stats.large, COLORS.text.primary)}>{analytics?.prayerStats?.reduce((total, prayer) => total + Math.round(prayer.completion * 30 / 100), 0) || 0}</span>
                  </div>
                  <p className={cn(TYPOGRAPHY.header.card, SPACING.margin.xs)}>Total Prayers</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              {/* This Month */}
              <Card className={COLORS.card.default}>
                <CardContent className={cn(SPACING.card.compact, "text-center")}>
                  <div className={cn("flex items-center justify-center", SPACING.gap.sm, SPACING.margin.sm)}>
                    <Calendar className={cn(SIZING.icon.default, COLORS.text.primary)} />
                    <span className={TYPOGRAPHY.stats.large}>{analytics.monthlyPerfectDays || 0}</span>
                  </div>
                  <p className={cn(TYPOGRAPHY.header.card, SPACING.margin.xs)}>Perfect Days</p>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Weekly Trend Chart */}
            {weeklyTrendData.length === 0 || weeklyTrendData.every(day => day.prayers === 0) ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 pb-6 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-semibold mb-2">No trend data yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start tracking prayers to see your weekly progress
                  </p>
                  <Button onClick={() => router.push('/dashboard')} size="sm">
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Weekly Completion Trend
                  </CardTitle>
                  <CardDescription>Interactive view of your prayer completion rates</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 pb-2">
                  <ChartContainer config={chartConfig} className="h-[180px] w-full">
                    <AreaChart 
                      data={weeklyTrendData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="day" 
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                        tick={{ fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                      />
                      <defs>
                        <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-completion)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--color-completion)" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="completion" 
                        stroke="var(--color-completion)" 
                        fillOpacity={1} 
                        fill="url(#completionGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Next Milestone */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Next Milestone
                </CardTitle>
                <CardDescription>Keep going to unlock rewards</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-full">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{analytics.nextMilestone.name}</p>
                      <p className="text-xs text-muted-foreground">Reward: {analytics.nextMilestone.reward}</p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="bg-primary/5">
                    {analytics.nextMilestone.daysLeft} days left
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Progress value={analytics.nextMilestone.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{Math.round(analytics.nextMilestone.progress)}% complete</span>
                    <span className="font-medium">{analytics.nextMilestone.current}/{analytics.nextMilestone.target}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Challenge Area */}
            {challengePrayer && challengePrayer.completion < 80 && (
              <Card className="border-chart-3/30 bg-chart-3/10">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-chart-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">Focus Area: {challengePrayer.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {challengePrayer.completion}% completion rate - let's improve this together
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="bg-background/50">
                      Tips
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* PRAYERS TAB */}
          <TabsContent value="prayers" className="space-y-4">
            {/* Prayer-specific Analytics */}
            {prayerCompletionData.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 pb-6 text-center">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-semibold mb-2">No prayer data yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start recording prayers to see detailed analytics
                  </p>
                  <Button onClick={() => router.push('/dashboard')} size="sm">
                    Record First Prayer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Prayer Completion Rates
                  </CardTitle>
                  <CardDescription>30-day completion percentage by prayer</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 pb-2">
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart 
                      data={prayerCompletionData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                        tick={{ fontSize: 10 }}
                        domain={[0, 100]}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                      />
                      <Bar 
                        dataKey="completion" 
                        fill="var(--color-completion)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Prayer Performance Grid */}
            <div className="grid grid-cols-1 gap-3">
              {analytics?.prayerStats?.map((prayer) => {
                const getPrayerIcon = (name: string) => {
                  switch (name.toLowerCase()) {
                    case 'fajr': return Sun;
                    case 'dhuhr': return Sun;
                    case 'asr': return Sunset;
                    case 'maghrib': return Sunset;
                    case 'isha': return Moon;
                    default: return Clock;
                  }
                };

                const getPrayerColor = (completion: number) => {
                  if (completion >= 90) return "text-chart-3 bg-chart-3/10 border-chart-3/20";
                  if (completion >= 70) return "text-chart-1 bg-chart-1/10 border-chart-1/20";
                  if (completion >= 50) return "text-chart-4 bg-chart-4/10 border-chart-4/20";
                  return "text-chart-5 bg-chart-5/10 border-chart-5/20";
                };

                const Icon = getPrayerIcon(prayer.name);
                
                return (
                  <Card key={prayer.name} className={cn("border", getPrayerColor(prayer.completion))}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-current/10 flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{prayer.name}</h3>
                            <p className="text-xs opacity-70">
                              {prayer.completion}% completion
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {prayer.weeklyTrend > 0 ? (
                              <ArrowUp className="h-3 w-3 text-chart-3" />
                            ) : prayer.weeklyTrend < 0 ? (
                              <ArrowDown className="h-3 w-3 text-chart-5" />
                            ) : null}
                            <span className="text-xs font-medium">
                              {Math.abs(prayer.weeklyTrend || 0)}%
                            </span>
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {prayer.status === 'challenge' ? 'Challenge' :
                             prayer.status === 'consistent' ? 'Consistent' :
                             prayer.status === 'improving' ? 'Improving' : 'Good'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Prayer Time Insights */}
            {analytics?.prayerStats && analytics.prayerStats.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Prayer Time Distribution
                  </CardTitle>
                  <CardDescription>When you typically pray each prayer</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 pb-4">
                  {analytics.prayerStats.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="pt-6 pb-6 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="font-semibold mb-2">No timing data yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Record more prayers to see timing insights
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <ChartContainer config={chartConfig} className="h-[160px] w-full">
                      <RadialBarChart 
                        data={analytics.prayerStats.map(prayer => ({
                          name: prayer.name,
                          completion: prayer.completion,
                          fill: `var(--color-${prayer.name.toLowerCase()})`
                        }))}
                        cx="50%" 
                        cy="50%" 
                        innerRadius="20%" 
                        outerRadius="80%"
                      >
                        <RadialBar 
                          dataKey="completion" 
                          cornerRadius={3}
                          fill="#8884d8" 
                        />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                        />
                      </RadialBarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* GAMIFICATION TAB */}
          <TabsContent value="gamification" className="space-y-4">
            {/* Level Progress */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Level {gamificationData.level}
                </CardTitle>
                <CardDescription>{gamificationData.title}</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">XP Progress</span>
                    <span className="font-medium">
                      {gamificationData.currentXP.toLocaleString()} / {gamificationData.nextLevelXP.toLocaleString()} XP
                    </span>
                  </div>
                  
                  <Progress 
                    value={(gamificationData.currentXP / gamificationData.nextLevelXP) * 100} 
                    className="h-3"
                  />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {gamificationData.xpToNextLevel.toLocaleString()} XP to next level
                    </span>
                    <Badge variant="outline" className="bg-primary/5">
                      +{gamificationData.dailyXp} XP today
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* XP Trend Chart */}
            {weeklyTrendData.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 pb-6 text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-semibold mb-2">No XP data yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start earning XP to see your progress trends
                  </p>
                  <Button onClick={() => router.push('/dashboard')} size="sm">
                    Earn XP
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Weekly XP Trend
                  </CardTitle>
                  <CardDescription>Your experience points over the past week</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 pb-2">
                  <ChartContainer config={chartConfig} className="h-[160px] w-full">
                    <LineChart 
                      data={weeklyTrendData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="day" 
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                        tick={{ fontSize: 10 }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="xp" 
                        stroke="var(--color-xp)" 
                        strokeWidth={2}
                        dot={{ fill: "var(--color-xp)", strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Badges Collection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Badge Collection
                </CardTitle>
                <CardDescription>Unlock badges by completing challenges</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4">
                <div className="grid grid-cols-3 gap-3">
                  {gamificationData.badges.map((badge, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-3 rounded-lg text-center transition-all",
                        badge.earned 
                          ? "bg-primary/10 border border-primary/20" 
                          : "bg-muted/50 border border-muted"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center",
                        badge.earned ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Medal className={cn(
                          "h-4 w-4",
                          badge.earned ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <p className={cn(
                        "text-xs font-medium",
                        badge.earned ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {badge.name}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily & Weekly Challenges */}
            <div className="grid grid-cols-1 gap-4">
              {/* Daily Challenge */}
              <Card className="border-chart-1/30 bg-chart-1/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Daily Challenge
                  </CardTitle>
                  <CardDescription>{gamificationData.dailyChallenge.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{gamificationData.dailyChallenge.name}</span>
                      <Badge variant="outline" className="bg-background/50">
                        +{gamificationData.dailyChallenge.xpReward} XP
                      </Badge>
                    </div>
                    
                    <Progress 
                      value={(gamificationData.dailyChallenge.progress / gamificationData.dailyChallenge.target) * 100} 
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {gamificationData.dailyChallenge.progress} / {gamificationData.dailyChallenge.target}
                      </span>
                      <span className="font-medium">
                        {Math.round((gamificationData.dailyChallenge.progress / gamificationData.dailyChallenge.target) * 100)}% complete
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Challenge */}
              <Card className="border-chart-2/30 bg-chart-2/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Weekly Challenge
                  </CardTitle>
                  <CardDescription>{gamificationData.weeklyChallenge.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{gamificationData.weeklyChallenge.name}</span>
                      <Badge variant="outline" className="bg-background/50">
                        +{gamificationData.weeklyChallenge.xpReward} XP
                      </Badge>
                    </div>
                    
                    <Progress 
                      value={(gamificationData.weeklyChallenge.progress / gamificationData.weeklyChallenge.target) * 100} 
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {gamificationData.weeklyChallenge.progress} / {gamificationData.weeklyChallenge.target}
                      </span>
                      <span className="font-medium">
                        {Math.round((gamificationData.weeklyChallenge.progress / gamificationData.weeklyChallenge.target) * 100)}% complete
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* INSIGHTS TAB */}
          <TabsContent value="insights" className="space-y-4">
            {/* Insights Header */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Prayer Insights
                </CardTitle>
                <CardDescription>
                  AI-powered insights based on your prayer patterns and journey
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All', icon: Sparkles },
                { value: 'streak', label: 'Streaks', icon: Flame },
                { value: 'reminder', label: 'Reminders', icon: Bell },
                { value: 'progress', label: 'Progress', icon: TrendingUp },
                { value: 'challenge', label: 'Challenges', icon: Target },
                { value: 'achievement', label: 'Achievements', icon: Award }
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={insightFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInsightFilter(filter.value as any)}
                  className="text-xs"
                >
                  <filter.icon className="h-3 w-3 mr-1" />
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Insights Content */}
            {insightsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium mb-2">Generating insights...</p>
                  <p className="text-muted-foreground">Analyzing your prayer journey</p>
                </div>
              </div>
            ) : insights && insights.length > 0 ? (
              <div className="space-y-4">
                {insights
                  .filter(insight => insightFilter === 'all' || insight.type === insightFilter)
                  .map((insight, index) => {
                    const getInsightIcon = (icon: string) => {
                      switch (icon) {
                        case 'LineChart': return <TrendingUp className="h-5 w-5" />;
                        case 'AlertTriangle': return <AlertCircle className="h-5 w-5" />;
                        case 'Bell': return <Bell className="h-5 w-5" />;
                        case 'Trophy': return <Trophy className="h-5 w-5" />;
                        case 'Target': return <Target className="h-5 w-5" />;
                        default: return <Sparkles className="h-5 w-5" />;
                      }
                    };

                    const getInsightColor = (type: string, priority: string) => {
                      if (priority === 'high') return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
                      if (type === 'streak') return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950';
                      if (type === 'achievement') return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
                      if (type === 'reminder') return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
                      if (type === 'challenge') return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950';
                      return 'border-primary/20 bg-primary/5';
                    };

                    const getPriorityBadge = (priority: string) => {
                      const colors = {
                        high: 'bg-red-100 text-red-800',
                        medium: 'bg-yellow-100 text-yellow-800',
                        low: 'bg-gray-100 text-gray-800'
                      };
                      return colors[priority as keyof typeof colors] || colors.low;
                    };

                    return (
                      <Card key={insight.id} className={cn("border-l-4", getInsightColor(insight.type, insight.priority))}>
                        <CardContent className="pt-4 pb-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-background/80">
                                  {getInsightIcon(insight.icon)}
                                </div>
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-sm">{insight.title}</h3>
                                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className={cn("text-xs", getPriorityBadge(insight.priority))}>
                                {insight.priority}
                              </Badge>
                            </div>

                            {/* Data Display */}
                            {insight.data && (
                              <div className="ml-11 p-3 bg-background/50 rounded-lg">
                                {insight.type === 'streak' && (
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-primary">{insight.data.streakDays}</p>
                                      <p className="text-xs text-muted-foreground">Days</p>
                                    </div>
                                    <div className="flex-1">
                                      <Progress value={Math.min(100, (insight.data.streakDays / 30) * 100)} className="h-2" />
                                      <p className="text-xs text-muted-foreground mt-1">Progress to 30-day milestone</p>
                                    </div>
                                  </div>
                                )}

                                {insight.type === 'progress' && insight.data.weeklyCompletion && (
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-primary">{Math.round(insight.data.weeklyCompletion * 100)}%</p>
                                      <p className="text-xs text-muted-foreground">This Week</p>
                                    </div>
                                    <div className="flex-1">
                                      <Progress value={insight.data.weeklyCompletion * 100} className="h-2" />
                                      <p className="text-xs text-muted-foreground mt-1">Weekly completion rate</p>
                                    </div>
                                  </div>
                                )}

                                {insight.type === 'reminder' && insight.data.completed !== undefined && (
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-primary">{insight.data.completed}/5</p>
                                      <p className="text-xs text-muted-foreground">Today</p>
                                    </div>
                                    <div className="flex-1">
                                      <Progress value={(insight.data.completed / 5) * 100} className="h-2" />
                                      <p className="text-xs text-muted-foreground mt-1">Daily progress</p>
                                    </div>
                                  </div>
                                )}

                                {insight.type === 'challenge' && insight.data.completionRate && (
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <p className="text-2xl font-bold text-red-600">{Math.round(insight.data.completionRate * 100)}%</p>
                                      <p className="text-xs text-muted-foreground">This Week</p>
                                    </div>
                                    <div className="flex-1">
                                      <Progress value={insight.data.completionRate * 100} className="h-2" />
                                      <p className="text-xs text-muted-foreground mt-1">{insight.data.prayerType} completion rate</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action Button */}
                            <div className="ml-11">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs"
                                onClick={() => {
                                  const message = (() => {
                                    switch (insight.type) {
                                      case 'streak':
                                        return `Help me maintain my ${insight.data?.streakDays || 0}-day prayer streak. What strategies can you suggest?`;
                                      case 'challenge':
                                        return `I'm struggling with ${insight.data?.prayerType || 'prayer'} completion (${Math.round((insight.data?.completionRate || 0) * 100)}% this week). Can you help me improve?`;
                                      case 'progress':
                                        return `My weekly prayer completion is ${Math.round((insight.data?.weeklyCompletion || 0) * 100)}%. How can I improve my consistency?`;
                                      case 'reminder':
                                        return `I need help with prayer reminders and staying on track. What advice do you have?`;
                                      case 'achievement':
                                        return `I want to celebrate my prayer achievements and set new goals. Can you help me plan my next steps?`;
                                      default:
                                        return `I need guidance with my prayer journey. ${insight.description}`;
                                    }
                                  })();
                                  router.push(`/mulvi?message=${encodeURIComponent(message)}`);
                                }}
                              >
                                {insight.actionText}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                {/* Show message if no insights match filter */}
                {insights.filter(insight => insightFilter === 'all' || insight.type === insightFilter).length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 pb-6 text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="font-semibold mb-2">No {insightFilter === 'all' ? '' : insightFilter} insights yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {insightFilter === 'all' 
                          ? 'Continue your prayer journey to unlock personalized insights'
                          : `No ${insightFilter} insights available. Try a different filter.`}
                      </p>
                      {insightFilter !== 'all' && (
                        <Button variant="outline" size="sm" onClick={() => setInsightFilter('all')}>
                          View All Insights
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 pb-6 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-semibold mb-2">No insights available yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Continue your prayer journey to unlock personalized insights
                  </p>
                  <Button onClick={() => router.push('/dashboard')} size="sm">
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Achievement Celebration Modal */}
      {showCelebration && (
        <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Achievement Unlocked!
              </DialogTitle>
              <DialogDescription className="text-center">
                Congratulations on your progress!
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              {newAchievements.map((achievement, index) => (
                <div key={index} className="text-center p-4 bg-primary/5 rounded-lg mb-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <Badge className="mt-2">+{achievement.xp} XP</Badge>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setShowCelebration(false)} className="w-full">
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <PhantomBottomNav />
    </div>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={
      <div className="bg-background min-h-screen">
        <header className="header-gradient pt-safe-top pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Prayer Analytics</h1>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium mb-2">Loading stats...</p>
              <p className="text-muted-foreground">Please wait</p>
            </div>
          </div>
        </div>
        
        <PhantomBottomNav />
      </div>
    }>
      <StatsContent />
    </Suspense>
  );
}
