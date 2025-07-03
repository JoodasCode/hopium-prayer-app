'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell, CalendarRange, CheckCircle2, Clock, Edit, Info, 
  LogOut, MapPin, Moon, Shield, Sun, User, Volume2
} from 'lucide-react';
import Link from 'next/link';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  // State for user profile
  const [displayName, setDisplayName] = useState('Ahmed Hassan');
  const [email, setEmail] = useState('ahmed@example.com');
  const [isEditing, setIsEditing] = useState(false);
  
  // Prayer Notification Settings
  const [notifications, setNotifications] = useState(true);
  const [prayerReminders, setPrayerReminders] = useState(true);
  const [reminderTime, setReminderTime] = useState(15); // minutes before prayer
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  // Location Settings
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [calculationMethod, setCalculationMethod] = useState('hanafi');
  
  // Period Exemption Settings
  const [periodExemptionEnabled, setPeriodExemptionEnabled] = useState(false);
  const [menstruationTracking, setMenstruationTracking] = useState(false);
  const [travelExemption, setTravelExemption] = useState(false);
  const [illnessExemption, setIllnessExemption] = useState(false);
  
  // Habit & Accountability Settings
  const [streakProtection, setStreakProtection] = useState(true);
  const [qadaTracking, setQadaTracking] = useState(true);
  const [communityPresence, setCommunityPresence] = useState(true);
  const [dailyGoals, setDailyGoals] = useState(true);
  
  // Privacy Settings
  const [dataCollection, setDataCollection] = useState(true);
  const [shareInsights, setShareInsights] = useState(false);
  
  // App preferences
  const [themePreference, setThemePreference] = useState('system');
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [textSize, setTextSize] = useState(1);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      toast({
        title: "Profile updated successfully",
        variant: "default"
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Settings & Profile</h1>
        </div>
        
        {/* Profile Card */}
        <Card className="mb-6 border border-primary/20 w-full overflow-hidden bg-gradient-to-r from-primary/30 to-primary/10">
          <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 border-2 border-background">
                  <AvatarImage src="/images/avatar.jpg" alt={displayName} />
                  <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                {isEditing ? (
                  <div className="flex-1">
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mb-1"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveProfile}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{displayName}</h3>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{email}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">12 day streak</Badge>
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    </div>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>
        
        {/* Settings Tabs */}
        <Tabs defaultValue="prayer" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="prayer">Prayer</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="app">App</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          {/* Prayer Settings Tab */}
          <TabsContent value="prayer" className="space-y-4">
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Prayer Settings
                </CardTitle>
                <CardDescription>Customize your prayer experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Calculation Method */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Calculation Method</Label>
                  <Select
                    value={calculationMethod}
                    onValueChange={setCalculationMethod}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hanafi">Hanafi</SelectItem>
                      <SelectItem value="shafi">Shafi'i</SelectItem>
                      <SelectItem value="north_america">North America (ISNA)</SelectItem>
                      <SelectItem value="mecca">Umm al-Qura (Mecca)</SelectItem>
                      <SelectItem value="karachi">University of Islamic Sciences (Karachi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Period Exemption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="period-exemption" className="text-sm font-medium">Period Exemption</Label>
                    <Switch 
                      id="period-exemption" 
                      checked={periodExemptionEnabled}
                      onCheckedChange={setPeriodExemptionEnabled}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Track menstruation periods for prayer exemption</p>
                  
                  {periodExemptionEnabled && (
                    <div className="pt-2 pl-2 border-l-2 border-primary/20 mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="menstruation-tracking" className="text-sm">Menstruation Tracking</Label>
                        <Switch 
                          id="menstruation-tracking" 
                          checked={menstruationTracking}
                          onCheckedChange={setMenstruationTracking}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Travel Exemption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="travel-exemption" className="text-sm font-medium">Travel Exemption</Label>
                    <Switch 
                      id="travel-exemption" 
                      checked={travelExemption}
                      onCheckedChange={setTravelExemption}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Track travel status for prayer modifications</p>
                </div>
                
                {/* Illness Exemption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="illness-exemption" className="text-sm font-medium">Illness Exemption</Label>
                    <Switch 
                      id="illness-exemption" 
                      checked={illnessExemption}
                      onCheckedChange={setIllnessExemption}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Track illness for prayer modifications</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Notifications Settings */}
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Prayer reminders and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm font-medium">Enable Notifications</Label>
                  <Switch 
                    id="notifications" 
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                {notifications && (
                  <div className="space-y-4 pt-2 pl-2 border-l-2 border-primary/20">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prayer-reminders" className="text-sm">Prayer Reminders</Label>
                      <Switch 
                        id="prayer-reminders" 
                        checked={prayerReminders}
                        onCheckedChange={setPrayerReminders}
                      />
                    </div>
                    
                    {prayerReminders && (
                      <div className="space-y-2">
                        <Label className="text-sm">Reminder Time (minutes before prayer)</Label>
                        <div className="flex items-center gap-2">
                          <Slider 
                            value={[reminderTime]} 
                            min={5} 
                            max={30} 
                            step={5} 
                            className="flex-1"
                            onValueChange={(vals) => setReminderTime(vals[0])} 
                          />
                          <span className="text-sm font-medium w-8 text-center">{reminderTime}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound-enabled" className="text-sm">Sound</Label>
                      <Switch 
                        id="sound-enabled" 
                        checked={soundEnabled}
                        onCheckedChange={setSoundEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="vibration-enabled" className="text-sm">Vibration</Label>
                      <Switch 
                        id="vibration-enabled" 
                        checked={vibrationEnabled}
                        onCheckedChange={setVibrationEnabled}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Habits & Accountability Tab */}
          <TabsContent value="habits" className="space-y-4">
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Habit Building
                </CardTitle>
                <CardDescription>Strengthen your prayer habits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="streak-protection" className="text-sm font-medium">
                    Streak Protection
                  </Label>
                  <Switch 
                    id="streak-protection" 
                    checked={streakProtection}
                    onCheckedChange={setStreakProtection}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Get reminders to protect your streak</p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="qada-tracking" className="text-sm font-medium">
                    Qada Tracking
                  </Label>
                  <Switch 
                    id="qada-tracking" 
                    checked={qadaTracking}
                    onCheckedChange={setQadaTracking}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Track and complete missed prayers</p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-goals" className="text-sm font-medium">
                    Daily Goals
                  </Label>
                  <Switch 
                    id="daily-goals" 
                    checked={dailyGoals}
                    onCheckedChange={setDailyGoals}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Set and track personal prayer goals</p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="community-presence" className="text-sm font-medium">
                    Community Presence
                  </Label>
                  <Switch 
                    id="community-presence" 
                    checked={communityPresence}
                    onCheckedChange={setCommunityPresence}
                  />
                </div>
                <p className="text-xs text-muted-foreground">See when others in your community are praying</p>
              </CardContent>
            </Card>
            
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy
                </CardTitle>
                <CardDescription>Control your data and privacy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-collection" className="text-sm font-medium">
                    Data Collection
                  </Label>
                  <Switch 
                    id="data-collection" 
                    checked={dataCollection}
                    onCheckedChange={setDataCollection}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Allow anonymous data collection to improve the app</p>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="share-insights" className="text-sm font-medium">
                    Share Insights
                  </Label>
                  <Switch 
                    id="share-insights" 
                    checked={shareInsights}
                    onCheckedChange={setShareInsights}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Share anonymized prayer patterns with researchers</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* App Settings Tab */}
          <TabsContent value="app" className="space-y-4">
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize app appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Theme</Label>
                    <ThemeToggle />
                  </div>
                  <p className="text-xs text-muted-foreground">Choose light, dark, or system theme</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Text Size</Label>
                  <div className="flex items-center gap-2">
                    <Slider 
                      value={[textSize]} 
                      min={0.8} 
                      max={1.2} 
                      step={0.1} 
                      className="flex-1"
                      onValueChange={(vals) => setTextSize(vals[0])} 
                    />
                    <span className="text-sm font-medium w-8 text-center">{textSize.toFixed(1)}x</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-animations" className="text-sm font-medium">
                    Reduce Animations
                  </Label>
                  <Switch 
                    id="reduce-animations" 
                    checked={reduceAnimations}
                    onCheckedChange={setReduceAnimations}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimize motion for accessibility</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About Mulvi
                </CardTitle>
                <CardDescription>App information and support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Version</h3>
                  <p className="text-xs text-muted-foreground">1.0.0 (Build 145)</p>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Developer</h3>
                  <p className="text-xs text-muted-foreground">Mulvi Technologies</p>
                </div>
                
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-medium">Support</h3>
                  <div className="grid gap-2">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <User className="mr-2 h-4 w-4" /> Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Info className="mr-2 h-4 w-4" /> FAQ & Help Center
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <Button onClick={handleSignOut} variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
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