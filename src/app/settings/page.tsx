'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Bell, Moon, Sun, User, Shield, Info, Clock, Volume2, UserCircle } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/shared/BottomNav';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  // State for various settings
  const [notifications, setNotifications] = useState(true);
  const [prayerReminders, setPrayerReminders] = useState(true);
  const [reminderTime, setReminderTime] = useState(15); // minutes before prayer
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [textSize, setTextSize] = useState(2); // 1-4 scale
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [calculationMethod, setCalculationMethod] = useState("hanafi");
  
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container max-w-md mx-auto px-3 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserCircle className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        {/* Settings Tabs */}
        <Tabs defaultValue="appearance" className="mb-6">
          <TabsList className="grid grid-cols-5 mb-4 w-full">
            <TabsTrigger value="appearance">
              <div className="flex items-center gap-1">
                <Sun className="h-4 w-4" />
                <span>Look</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <div className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                <span>Alerts</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="account">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Account</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="about">
              <div className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>About</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how Hopium looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Moon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-muted-foreground">Light, dark, or system</p>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Text Size</Label>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {textSize === 1 ? "Small" : textSize === 2 ? "Medium" : textSize === 3 ? "Large" : "Extra Large"}
                      </span>
                    </div>
                    <Slider
                      value={[textSize]}
                      min={1}
                      max={4}
                      step={1}
                      onValueChange={(value) => setTextSize(value[0])}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>A</span>
                      <span className="text-sm">A</span>
                      <span className="text-base">A</span>
                      <span className="text-lg">A</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="font-medium">Reduce Animations</p>
                      <p className="text-sm text-muted-foreground">For improved performance</p>
                    </div>
                    <Switch 
                      checked={reduceAnimations} 
                      onCheckedChange={setReduceAnimations} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure your prayer reminders and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Prayer Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified before prayer times</p>
                  </div>
                  <Switch 
                    checked={prayerReminders} 
                    onCheckedChange={setPrayerReminders} 
                  />
                </div>
                
                {prayerReminders && (
                  <div className="pl-4 border-l-2 border-primary/20 mt-2 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Reminder Time</Label>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {reminderTime} min before
                        </span>
                      </div>
                      <Slider
                        value={[reminderTime]}
                        min={5}
                        max={30}
                        step={5}
                        onValueChange={(value) => setReminderTime(value[0])}
                        className="py-2"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Sound</span>
                      </div>
                      <Switch 
                        checked={soundEnabled} 
                        onCheckedChange={setSoundEnabled} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Vibration</span>
                      </div>
                      <Switch 
                        checked={vibrationEnabled} 
                        onCheckedChange={setVibrationEnabled} 
                      />
                    </div>
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Community Updates</p>
                    <p className="text-sm text-muted-foreground">News and feature announcements</p>
                  </div>
                  <Switch 
                    checked={notifications} 
                    onCheckedChange={setNotifications} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data
                </CardTitle>
                <CardDescription>Manage your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Collection</p>
                    <p className="text-sm text-muted-foreground">Help improve Hopium with usage data</p>
                  </div>
                  <Switch 
                    checked={dataCollection} 
                    onCheckedChange={setDataCollection} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Location Services</p>
                    <p className="text-sm text-muted-foreground">For accurate prayer times</p>
                  </div>
                  <Switch 
                    checked={locationEnabled} 
                    onCheckedChange={setLocationEnabled} 
                  />
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="#">
                      <span>Privacy Policy</span>
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-between text-destructive hover:text-destructive" asChild>
                    <Link href="#">
                      <span>Delete My Data</span>
                      <span className="text-destructive">→</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account
                </CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Abdullah Hassan</h3>
                    <p className="text-sm text-muted-foreground">abdullah@example.com</p>
                    <Button variant="link" className="p-0 h-auto text-primary text-xs">Edit Profile</Button>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium mb-2 block">Prayer Calculation Method</Label>
                    <RadioGroup 
                      value={calculationMethod}
                      onValueChange={setCalculationMethod}
                      className="grid grid-cols-1 gap-2"
                    >
                      <div className={cn(
                        "flex items-center justify-between rounded-md border p-3",
                        calculationMethod === "hanafi" ? "border-primary bg-primary/5" : "border-muted"
                      )}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="hanafi" id="hanafi" />
                          <Label htmlFor="hanafi" className="font-medium">Hanafi</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">Standard in South Asia</span>
                      </div>
                      
                      <div className={cn(
                        "flex items-center justify-between rounded-md border p-3",
                        calculationMethod === "shafi" ? "border-primary bg-primary/5" : "border-muted"
                      )}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="shafi" id="shafi" />
                          <Label htmlFor="shafi" className="font-medium">Shafi'i</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">Common in Middle East</span>
                      </div>
                      
                      <div className={cn(
                        "flex items-center justify-between rounded-md border p-3",
                        calculationMethod === "north_america" ? "border-primary bg-primary/5" : "border-muted"
                      )}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="north_america" id="north_america" />
                          <Label htmlFor="north_america" className="font-medium">North America</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">ISNA Standard</span>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Button variant="outline" className="w-full justify-between">
                    <span>Language</span>
                    <span className="text-muted-foreground">English →</span>
                  </Button>
                  
                  <Button variant="destructive" className="w-full mt-4">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* About Tab */}
          <TabsContent value="about" className="space-y-4">
            <Card className="mb-6 border border-primary/20 w-full overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About Hopium
                </CardTitle>
                <CardDescription>App information and support resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <div className="text-center py-4">
                  <div className="bg-primary/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sun className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Hopium Prayer App</h3>
                  <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="#">
                      <span>Help & Support</span>
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="#">
                      <span>Terms of Service</span>
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="#">
                      <span>Open Source Licenses</span>
                      <span className="text-muted-foreground">→</span>
                    </Link>
                  </Button>
                </div>
                
                <div className="text-center text-xs text-muted-foreground mt-6">
                  <p>Made with ❤️ for mindful prayer</p>
                  <p className="mt-1">© 2025 Hopium. All rights reserved.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
