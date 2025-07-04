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
  LogOut, MapPin, Sun, User, Volume2, Settings, Shield, Palette, Smartphone
} from 'lucide-react';
import PhantomBottomNav from '@/components/shared/PhantomBottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUserStats } from '@/hooks/useUserStats';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { ds, SPACING, TYPOGRAPHY, SIZING, COLORS } from '@/lib/design-system';

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
      <div className="bg-background min-h-screen pb-24">
        {/* Beautiful Loading Header */}
        <header className="w-full bg-background pt-safe-top">
          <div className={cn("bg-gradient-to-br from-primary/10 via-primary/5 to-transparent", SPACING.card.comfortable, "px-4")}>
            <div className="max-w-md mx-auto">
              <div className={cn("flex items-center", SPACING.gap.default)}>
                <div className={ds.iconContainer('lg', 'primary')}>
                  <Settings className={cn(SIZING.icon.default, COLORS.text.primary)} />
                </div>
                <div>
                  <h1 className={TYPOGRAPHY.header.page}>Settings</h1>
                  <p className={TYPOGRAPHY.muted.default}>Customize your experience</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="max-w-md mx-auto px-4">
          <div className={cn("space-y-4", SPACING.margin.lg)}>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className={cn("animate-pulse", COLORS.card.default)}>
                <CardContent className={cn(SPACING.card.default)}>
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
    <div className="bg-background min-h-screen pb-24">
      {/* Beautiful Header with Gradient */}
      <header className="w-full bg-background pt-safe-top">
        <div className={cn("bg-gradient-to-br from-primary/10 via-primary/5 to-transparent", SPACING.card.comfortable, "px-4")}>
          <div className="max-w-md mx-auto">
            <div className={cn("flex items-center", SPACING.gap.default)}>
              <div className={ds.iconContainer('lg', 'primary')}>
                <Settings className={cn(SIZING.icon.default, COLORS.text.primary)} />
              </div>
              <div>
                <h1 className={TYPOGRAPHY.header.page}>Settings</h1>
                <p className={TYPOGRAPHY.muted.default}>Customize your experience</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-md mx-auto px-4">
        {/* Profile Card */}
        <div className={cn(SPACING.margin.lg)}>
          <Card className={cn(COLORS.card.primary, "border-primary/30 bg-gradient-to-r from-primary/10 to-transparent")}>
            <CardContent className={cn(SPACING.card.default)}>
              <div className={cn("flex items-center", SPACING.gap.default)}>
                <Avatar className="h-16 w-16 border-2 border-background">
                  <AvatarImage src="/images/avatar.jpg" alt={safeDisplayName} />
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                    {safeDisplayName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing ? (
                  <div className="flex-1">
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={cn("mb-3", COLORS.card.default)}
                    />
                    <div className={cn("flex items-center justify-end", SPACING.gap.sm)}>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={cn(TYPOGRAPHY.header.card, SPACING.margin.xs)}>{safeDisplayName}</h3>
                        <p className={cn(TYPOGRAPHY.muted.small)}>{session?.user?.email}</p>
                        {stats && (
                          <div className={cn("flex items-center gap-2", SPACING.margin.sm)}>
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              {stats.current_streak} day streak
                            </Badge>
                                                         <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                               {stats.total_prayers_completed} prayers
                             </Badge>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                        <Edit className={cn(SIZING.icon.xs)} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <div className={cn(SPACING.margin.lg)}>
          <Tabs defaultValue="prayer" className="w-full">
            <TabsList className={cn("grid w-full grid-cols-4", COLORS.card.default)}>
              <TabsTrigger value="prayer" className="text-xs">Prayer</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs">Alerts</TabsTrigger>
              <TabsTrigger value="app" className="text-xs">App</TabsTrigger>
              <TabsTrigger value="about" className="text-xs">About</TabsTrigger>
            </TabsList>
            
            {/* Prayer Settings */}
            <TabsContent value="prayer" className={cn("space-y-4", SPACING.margin.default)}>
              <Card className={cn(COLORS.card.default)}>
                <CardHeader className={cn(SPACING.card.compact)}>
                  <div className="flex items-center gap-2">
                    <div className={ds.iconContainer('sm', 'primary')}>
                      <User className={cn(SIZING.icon.xs, COLORS.text.primary)} />
                    </div>
                    <CardTitle className={TYPOGRAPHY.header.section}>Prayer Preferences</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className={cn(SPACING.card.compact, "space-y-4")}>
                  {/* Calculation Method */}
                  <div className="space-y-2">
                    <Label className={TYPOGRAPHY.body.small}>Calculation Method</Label>
                    <Select 
                      value={settings?.calculation_method || 'ISNA'} 
                      onValueChange={(value) => handleSettingUpdate('calculation_method', value)}
                    >
                      <SelectTrigger className={COLORS.card.default}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ISNA">ISNA (Islamic Society of North America)</SelectItem>
                        <SelectItem value="MWL">MWL (Muslim World League)</SelectItem>
                        <SelectItem value="Egyptian">Egyptian General Authority</SelectItem>
                        <SelectItem value="Karachi">University of Karachi</SelectItem>
                        <SelectItem value="UmmAlQura">Umm Al-Qura (Saudi Arabia)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Madhab Selection */}
                  <div className="space-y-2">
                    <Label className={TYPOGRAPHY.body.small}>Madhab (School of Thought)</Label>
                    <Select 
                      value={settings?.madhab || 'Hanafi'} 
                      onValueChange={(value) => handleSettingUpdate('madhab', value)}
                    >
                      <SelectTrigger className={COLORS.card.default}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hanafi">Hanafi</SelectItem>
                        <SelectItem value="Shafi">Shafi'i</SelectItem>
                        <SelectItem value="Maliki">Maliki</SelectItem>
                        <SelectItem value="Hanbali">Hanbali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Period Exemption */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={TYPOGRAPHY.body.default}>Period Exemption</Label>
                      <p className={cn(TYPOGRAPHY.muted.small, SPACING.margin.xs)}>
                        Automatically count exempt days for streaks
                      </p>
                    </div>
                    <Switch
                      checked={settings?.period_exemption || false}
                      onCheckedChange={(checked) => handleSettingUpdate('period_exemption', checked, true)}
                    />
                  </div>

                  {/* Travel Exemption */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={TYPOGRAPHY.body.default}>Travel Exemption</Label>
                      <p className={cn(TYPOGRAPHY.muted.small, SPACING.margin.xs)}>
                        Enable travel mode for modified prayer times
                      </p>
                    </div>
                    <Switch
                      checked={settings?.travel_exemption || false}
                      onCheckedChange={(checked) => handleSettingUpdate('travel_exemption', checked, true)}
                    />
                  </div>

                  {/* Streak Protection */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={TYPOGRAPHY.body.default}>Streak Protection</Label>
                      <p className={cn(TYPOGRAPHY.muted.small, SPACING.margin.xs)}>
                        Protect your streak with freeze options
                      </p>
                    </div>
                                         <Switch
                       checked={settings?.streak_protection || false}
                       onCheckedChange={(checked) => handleSettingUpdate('streak_protection', checked)}
                     />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className={cn("space-y-4", SPACING.margin.default)}>
              <Card className={cn(COLORS.card.default)}>
                <CardHeader className={cn(SPACING.card.compact)}>
                  <div className="flex items-center gap-2">
                    <div className={ds.iconContainer('sm', 'secondary')}>
                      <Bell className={cn(SIZING.icon.xs, "text-chart-2")} />
                    </div>
                    <CardTitle className={TYPOGRAPHY.header.section}>Notification Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className={cn(SPACING.card.compact, "space-y-4")}>
                  {/* Master Notifications Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={TYPOGRAPHY.body.default}>Notifications</Label>
                      <p className={cn(TYPOGRAPHY.muted.small, SPACING.margin.xs)}>
                        Enable all prayer notifications
                      </p>
                    </div>
                                         <Switch
                       checked={settings?.notifications?.enabled || false}
                       onCheckedChange={(checked) => handleSettingUpdate('notifications', { ...settings?.notifications, enabled: checked }, true)}
                     />
                  </div>

                  <Separator />

                  {/* Prayer Reminders */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className={TYPOGRAPHY.body.default}>Prayer Reminders</Label>
                      <Switch
                        checked={settings?.prayer_reminders || false}
                        onCheckedChange={(checked) => handleSettingUpdate('prayer_reminders', checked)}
                      />
                    </div>
                    
                    {settings?.prayer_reminders && (
                      <div className="space-y-2">
                        <Label className={TYPOGRAPHY.body.small}>
                          Remind me {Number(settings?.reminder_time) || 15} minutes before prayer
                        </Label>
                        <Slider
                          value={[Number(settings?.reminder_time) || 15]}
                          onValueChange={([value]) => handleSettingUpdate('reminder_time', value)}
                          max={30}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>5 min</span>
                          <span>30 min</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sound */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={TYPOGRAPHY.body.default}>Sound</Label>
                      <p className={cn(TYPOGRAPHY.muted.small, SPACING.margin.xs)}>
                        Play sound for notifications
                      </p>
                    </div>
                                         <Switch
                       checked={settings?.sound_enabled || false}
                       onCheckedChange={(checked) => handleSettingUpdate('sound_enabled', checked)}
                     />
                  </div>

                  {/* Vibration */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={TYPOGRAPHY.body.default}>Vibration</Label>
                      <p className={cn(TYPOGRAPHY.muted.small, SPACING.margin.xs)}>
                        Vibrate for notifications
                      </p>
                    </div>
                                         <Switch
                       checked={settings?.vibration_enabled || false}
                       onCheckedChange={(checked) => handleSettingUpdate('vibration_enabled', checked)}
                     />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* App Settings */}
            <TabsContent value="app" className={cn("space-y-4", SPACING.margin.default)}>
              <Card className={cn(COLORS.card.default)}>
                <CardHeader className={cn(SPACING.card.compact)}>
                  <div className="flex items-center gap-2">
                    <div className={ds.iconContainer('sm', 'tertiary')}>
                      <Smartphone className={cn(SIZING.icon.xs, "text-chart-3")} />
                    </div>
                    <CardTitle className={TYPOGRAPHY.header.section}>App Preferences</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className={cn(SPACING.card.compact, "space-y-4")}>
                  {/* Text Size */}
                  <div className="space-y-3">
                    <Label className={TYPOGRAPHY.body.default}>
                      Text Size ({((Number(settings?.text_size) || 1) * 100).toFixed(0)}%)
                    </Label>
                    <div className="space-y-2">
                      <Slider
                        value={[Number(settings?.text_size) || 1]}
                        onValueChange={([value]) => {
                          handleSettingUpdate('text_size', value);
                          // Apply immediately for preview
                          document.documentElement.style.fontSize = `${value}rem`;
                        }}
                        max={1.2}
                        min={0.8}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Small</span>
                        <span>Large</span>
                      </div>
                    </div>
                    <p className={cn(TYPOGRAPHY.muted.small, "italic")}>
                      This is how text will look at your selected size.
                    </p>
                  </div>

                  <Separator />

                  {/* Animations */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={TYPOGRAPHY.body.default}>Animations</Label>
                      <p className={cn(TYPOGRAPHY.muted.small, SPACING.margin.xs)}>
                        Enable smooth transitions and animations
                      </p>
                    </div>
                    <Switch
                      checked={settings?.animations !== false} // Default to true
                      onCheckedChange={(checked) => {
                        handleSettingUpdate('animations', checked);
                        // Apply immediately for preview
                        if (checked) {
                          document.documentElement.style.setProperty('--animation-duration', '0.2s');
                        } else {
                          document.documentElement.style.setProperty('--animation-duration', '0s');
                        }
                      }}
                    />
                  </div>

                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className={TYPOGRAPHY.body.default}>Theme</Label>
                      <p className={cn(TYPOGRAPHY.muted.small, SPACING.margin.xs)}>
                        Switch between light and dark mode
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className={cn("space-y-4", SPACING.margin.default)}>
              <Card className={cn(COLORS.card.default)}>
                <CardHeader className={cn(SPACING.card.compact)}>
                  <div className="flex items-center gap-2">
                                         <div className={ds.iconContainer('sm', 'tertiary')}>
                       <Info className={cn(SIZING.icon.xs, "text-chart-3")} />
                     </div>
                    <CardTitle className={TYPOGRAPHY.header.section}>About Lopi</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className={cn(SPACING.card.compact, "space-y-4")}>
                  <div className="text-center space-y-2">
                    <div className={ds.iconContainer('xl', 'primary')}>
                      <User className={cn(SIZING.icon.lg, COLORS.text.primary)} />
                    </div>
                    <h3 className={cn(TYPOGRAPHY.header.card, SPACING.margin.sm)}>Lopi Prayer Tracker</h3>
                    <p className={cn(TYPOGRAPHY.muted.default)}>Version 1.0.0</p>
                    <p className={cn(TYPOGRAPHY.muted.small, SPACING.margin.sm)}>
                      Your personal Islamic prayer companion, designed to help you maintain consistent prayer habits with love and care.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="mailto:support@lopi.app" className="flex items-center gap-2">
                        <Info className={cn(SIZING.icon.xs)} />
                        Contact Support
                      </a>
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="/privacy" className="flex items-center gap-2">
                        <Shield className={cn(SIZING.icon.xs)} />
                        Privacy Policy
                      </a>
                    </Button>
                  </div>

                  <Separator />

                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={handleSignOut}
                  >
                    <LogOut className={cn(SIZING.icon.xs, "mr-2")} />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PhantomBottomNav />
    </div>
  );
}