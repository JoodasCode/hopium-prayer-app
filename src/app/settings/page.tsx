'use client';

import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell, CheckCircle2, Edit, Info, 
  LogOut, MapPin, Sun, User, Volume2
} from 'lucide-react';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUserStats } from '@/hooks/useUserStats';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { session, signOut, authLoading } = useAuth();
  const { toast } = useToast();
  const userId = session?.user?.id;
  
  // Backend hooks
  const { settings, isLoading: settingsLoading, updateSettings } = useUserSettings(userId);
  const { userStats: stats } = useUserStats(userId);
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize display name from session
  useEffect(() => {
    if (session?.user?.user_metadata?.display_name) {
      setDisplayName(session.user.user_metadata.display_name);
    } else if (session?.user?.email) {
      // Use email prefix as fallback
      setDisplayName(session.user.email.split('@')[0]);
    }
  }, [session]);

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
    if (!session?.user?.id) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      
      if (error) throw error;
      
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
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle setting updates with toast feedback for important settings
  const handleSettingUpdate = async (key: string, value: any, showToast = false) => {
    try {
      const success = await updateSettings({
        [key]: value
      });
      
      if (!success) {
        throw new Error('Failed to update setting');
      }
      
      if (showToast) {
        toast({
          title: "Setting updated",
          description: `Your ${key.replace('_', ' ')} preference has been saved`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Setting update error:', error);
      if (showToast) {
        toast({
          title: "Setting not saved",
          description: "Please check your connection and try again",
          variant: "destructive"
        });
      }
    }
  };

  // Safe fallback for displayName
  const safeDisplayName = displayName || 'User';

  // Show loading state while auth or settings are loading
  const isLoading = authLoading || settingsLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="container max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">Settings & Profile</h1>
          </div>
          
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, redirect to login
  if (!authLoading && !session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }
  
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
                  <AvatarImage src="/images/avatar.jpg" alt={safeDisplayName} />
                  <AvatarFallback>{safeDisplayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                {isEditing ? (
                  <div className="flex-1">
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mb-1"
                    />
                    <div className="mt-6 flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{safeDisplayName}</h3>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {stats?.current_streak || 0} day streak
                      </Badge>
                      <Badge variant="outline" className="text-xs">Premium</Badge>
                    </div>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>
        
        {/* Settings Tabs */}
        <Tabs defaultValue="prayer" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="prayer">Prayer</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
            <TabsTrigger value="app">App</TabsTrigger>
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
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Method</Label>
                  <Select 
                    value={settings?.calculation_method || 'ISNA'} 
                    onValueChange={(value) => handleSettingUpdate('calculation_method', value, true)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ISNA">ISNA</SelectItem>
                      <SelectItem value="MWL">Muslim World League</SelectItem>
                      <SelectItem value="Egypt">Egyptian General Authority</SelectItem>
                      <SelectItem value="Makkah">Umm Al-Qura University</SelectItem>
                      <SelectItem value="Karachi">University of Islamic Sciences</SelectItem>
                      <SelectItem value="Tehran">Institute of Geophysics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Madhab */}
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Madhab</Label>
                  <Select 
                    value={settings?.madhab || 'hanafi'} 
                    onValueChange={(value) => handleSettingUpdate('madhab', value, true)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select madhab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hanafi">Hanafi</SelectItem>
                      <SelectItem value="shafi">Shafi'i</SelectItem>
                      <SelectItem value="maliki">Maliki</SelectItem>
                      <SelectItem value="hanbali">Hanbali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Period Exemption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="period-exemption" className="text-sm font-medium">Period Exemption</Label>
                    <Switch 
                      id="period-exemption" 
                      checked={settings?.period_exemption || false}
                      onCheckedChange={(checked) => handleSettingUpdate('period_exemption', checked)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Track menstruation periods for prayer exemption</p>
                </div>
                
                {/* Travel Exemption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="travel-exemption" className="text-sm font-medium">Travel Exemption</Label>
                    <Switch 
                      id="travel-exemption" 
                      checked={settings?.travel_exemption || false}
                      onCheckedChange={(checked) => handleSettingUpdate('travel_exemption', checked)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Track travel status for prayer modifications</p>
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
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    All Notifications
                  </Label>
                  <Switch 
                    id="notifications" 
                    checked={settings?.notifications?.enabled !== false} // Default to true
                    onCheckedChange={(checked) => handleSettingUpdate('notifications', { 
                      ...(settings?.notifications || {}), 
                      enabled: checked 
                    })}
                  />
                </div>
                
                {settings?.notifications?.enabled !== false && (
                  <div className="space-y-4 pt-2 pl-2 border-l-2 border-primary/20">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prayer-reminders" className="text-sm font-medium">
                        Prayer Reminders
                      </Label>
                      <Switch 
                        id="prayer-reminders" 
                        checked={settings?.prayer_reminders !== false} // Default to true
                        onCheckedChange={(checked) => handleSettingUpdate('prayer_reminders', checked)}
                      />
                    </div>
                    
                    {settings?.prayer_reminders !== false && (
                      <div className="space-y-2">
                        <Label className="text-sm">Reminder Time (minutes before prayer)</Label>
                        <div className="flex items-center gap-2">
                          <Slider 
                            value={[Number(settings?.reminder_time) || 15]} 
                            min={5} 
                            max={30} 
                            step={5} 
                            className="flex-1"
                            onValueChange={(vals) => handleSettingUpdate('reminder_time', vals[0])} 
                          />
                          <span className="text-sm font-medium w-8 text-center">{Number(settings?.reminder_time) || 15}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound-enabled" className="text-sm font-medium">
                        Sound
                      </Label>
                      <Switch 
                        id="sound-enabled" 
                        checked={settings?.sound_enabled !== false} // Default to true
                        onCheckedChange={(checked) => handleSettingUpdate('sound_enabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="vibration-enabled" className="text-sm font-medium">
                        Vibration
                      </Label>
                      <Switch 
                        id="vibration-enabled" 
                        checked={settings?.vibration_enabled !== false} // Default to true
                        onCheckedChange={(checked) => handleSettingUpdate('vibration_enabled', checked)}
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
                    checked={settings?.streak_protection !== false} // Default to true
                    onCheckedChange={(checked) => handleSettingUpdate('streak_protection', checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Get reminders to protect your streak</p>
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
                      value={[Number(settings?.text_size) || 1]} 
                      min={0.8} 
                      max={1.2} 
                      step={0.1} 
                      className="flex-1"
                      onValueChange={(vals) => {
                        const size = vals[0];
                        // Apply text size to document root for live preview
                        if (typeof document !== 'undefined') {
                          document.documentElement.style.fontSize = `${size}rem`;
                        }
                        // Save setting after a short delay to prevent excessive API calls
                        setTimeout(() => handleSettingUpdate('text_size', size), 500);
                      }} 
                    />
                    <span className="text-sm font-medium w-8 text-center">{(Number(settings?.text_size) || 1).toFixed(1)}x</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-animations" className="text-sm font-medium">
                    Reduce Animations
                  </Label>
                  <Switch 
                    id="reduce-animations" 
                    checked={settings?.reduce_animations || false}
                    onCheckedChange={(checked) => {
                      handleSettingUpdate('reduce_animations', checked);
                      // Apply animation setting to body for live preview
                      if (typeof document !== 'undefined') {
                        if (checked) {
                          document.body.classList.add('reduce-motion');
                        } else {
                          document.body.classList.remove('reduce-motion');
                        }
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimize motion for accessibility</p>
              </CardContent>
            </Card>
            
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About Lopi
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
                  <p className="text-xs text-muted-foreground">Lopi Technologies</p>
                </div>
                
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-medium">Support</h3>
                  <div className="grid gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.open('mailto:support@lopi.app', '_blank');
                        }
                      }}
                    >
                      <User className="mr-2 h-4 w-4" /> Contact Support
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="sm"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.location.href = '/help';
                        }
                      }}
                    >
                      <Info className="mr-2 h-4 w-4" /> FAQ & Help Center
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <Button 
                  onClick={handleSignOut} 
                  variant="destructive" 
                  className="w-full"
                  disabled={isSaving}
                >
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