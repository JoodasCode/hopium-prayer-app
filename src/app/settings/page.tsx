'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/shared/BottomNav';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container max-w-md mx-auto px-4 py-6">
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
        </div>
        
        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how Hopium looks on your device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Sun className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Light, dark, or system</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure your prayer reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-full">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Prayer Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified before prayer times</p>
                </div>
              </div>
              <Button 
                variant={notifications ? "default" : "outline"}
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? "On" : "Off"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>Hopium Prayer App v1.0.0</p>
          <p className="mt-1">Made with ❤️ for mindful prayer</p>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
