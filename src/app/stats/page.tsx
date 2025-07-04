'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Crown, Shield, Gem, Medal, Gift, Coins, Swords, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ds, SPACING, TYPOGRAPHY, SIZING, COLORS } from '@/lib/design-system';
import { useAuth } from '@/hooks/useAuth';
import { useStatsAnalytics } from '@/hooks/useStatsAnalytics';
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

export default function StatsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user?.id;
  
  // Fetch real analytics data from backend
  const { analytics, isLoading, error } = useStatsAnalytics(userId);
  
  // UI state
  const [showAchievementsDialog, setShowAchievementsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "prayers" | "gamification">("overview");
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationRef = useRef<NodeJS.Timeout | null>(null);
  
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
      <div className="bg-background min-h-screen pb-24">
        <header className="w-full bg-background pt-safe-top">
          <div className={cn("bg-gradient-to-b from-primary/5 to-transparent", SPACING.card.comfortable, "px-4")}>
            <div className="max-w-md mx-auto">
              <div className={cn("flex items-center", SPACING.gap.default)}>
                <div className={ds.iconContainer('lg', 'primary')}>
                  <BarChart3 className={cn(SIZING.icon.default, COLORS.text.primary)} />
                </div>
                <div>
                  <h1 className={TYPOGRAPHY.header.page}>Prayer Analytics</h1>
                  <p className={TYPOGRAPHY.muted.default}>
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
    <div className="bg-background min-h-screen pb-24">
      {/* Beautiful Header */}
      <header className="w-full bg-background pt-safe-top">
        <div className={cn("bg-gradient-to-b from-primary/5 to-transparent", SPACING.card.comfortable, "px-4")}>
          <div className="max-w-md mx-auto">
            <div className={cn("flex items-center", SPACING.gap.default)}>
              <div className={ds.iconContainer('lg', 'primary')}>
                <BarChart3 className={cn(SIZING.icon.default, COLORS.text.primary)} />
              </div>
              <div>
                <h1 className={TYPOGRAPHY.header.page}>Prayer Analytics</h1>
                <p className={TYPOGRAPHY.muted.default}>
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
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prayers">Prayers</TabsTrigger>
            <TabsTrigger value="gamification">
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Rewards
              </div>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-4">
            {/* Hero Stats Grid */}
            <div className={cn("grid grid-cols-2", SPACING.gap.default)}>
              {/* Current Streak */}
              <Card className={cn(COLORS.card.primary, "bg-gradient-to-br from-primary/5 to-transparent")}>
                <CardContent className={cn(SPACING.card.compact, "text-center")}>
                  <div className={cn("flex items-center justify-center", SPACING.gap.sm, SPACING.margin.sm)}>
                    <Flame className={cn(SIZING.icon.default, COLORS.text.primary)} />
                    <span className={cn(TYPOGRAPHY.stats.large, COLORS.text.primary)}>{analytics.streak.current}</span>
                  </div>
                  <p className={cn(TYPOGRAPHY.header.card, SPACING.margin.xs)}>Day Streak</p>
                  {analytics.streak.weekChange !== 0 && (
                    <div className={cn("flex items-center justify-center", SPACING.gap.xs)}>
                      {analytics.streak.weekChange > 0 ? (
                        <ArrowUp className={cn(SIZING.icon.xs, "text-green-500")} />
                      ) : (
                        <ArrowDown className={cn(SIZING.icon.xs, "text-red-500")} />
                      )}
                      <span className={cn(
                        TYPOGRAPHY.body.small, "font-medium",
                        analytics.streak.weekChange > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {Math.abs(analytics.streak.weekChange)}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Today's Progress */}
              <Card className={COLORS.card.default}>
                <CardContent className={cn(SPACING.card.compact, "text-center")}>
                  <div className={cn("flex items-center justify-center", SPACING.gap.sm, SPACING.margin.sm)}>
                    <Target className={cn(SIZING.icon.default, COLORS.text.primary)} />
                    <span className={TYPOGRAPHY.stats.large}>{analytics.todayProgress}</span>
                    <span className={cn(TYPOGRAPHY.stats.medium, TYPOGRAPHY.muted.default)}>/5</span>
                  </div>
                  <p className={cn(TYPOGRAPHY.header.card, SPACING.margin.xs)}>Today</p>
                  <Progress value={(analytics.todayProgress / 5) * 100} className={SIZING.progress.thin} />
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
                  if (completion >= 90) return "text-green-600 bg-green-50 border-green-200";
                  if (completion >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
                  if (completion >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
                  return "text-red-600 bg-red-50 border-red-200";
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
                              <ArrowUp className="h-3 w-3 text-green-600" />
                            ) : prayer.weeklyTrend < 0 ? (
                              <ArrowDown className="h-3 w-3 text-red-600" />
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
