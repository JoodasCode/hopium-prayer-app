'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useUserState } from '@/contexts/UserStateContext';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { userState } = useUserState();
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState(userState.name || '');
  const [calculationMethod, setCalculationMethod] = useState(userState.calculationMethod || 'mwl');
  const [hijriOffset, setHijriOffset] = useState(userState.hijriOffset?.toString() || '0');
  const [notificationsEnabled, setNotificationsEnabled] = useState(userState.notificationsEnabled);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await updateProfile({
        name,
        calculation_method: calculationMethod,
        hijri_offset: parseInt(hijriOffset),
        notifications_enabled: notificationsEnabled
      });
      
      if (success) {
        toast({
          title: 'Settings updated',
          description: 'Your preferences have been saved.',
        });
      } else {
        toast({
          title: 'Update failed',
          description: 'There was a problem updating your settings.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Settings update error:', error);
      toast({
        title: 'Update failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={userState.email} 
                  disabled 
                  placeholder="Your email"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Prayer Settings</CardTitle>
              <CardDescription>Configure your prayer calculation preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calculation-method">Calculation Method</Label>
                <Select 
                  value={calculationMethod} 
                  onValueChange={setCalculationMethod}
                >
                  <SelectTrigger id="calculation-method">
                    <SelectValue placeholder="Select calculation method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mwl">Muslim World League</SelectItem>
                    <SelectItem value="isna">Islamic Society of North America (ISNA)</SelectItem>
                    <SelectItem value="egypt">Egyptian General Authority of Survey</SelectItem>
                    <SelectItem value="makkah">Umm al-Qura University, Makkah</SelectItem>
                    <SelectItem value="karachi">University of Islamic Sciences, Karachi</SelectItem>
                    <SelectItem value="tehran">Institute of Geophysics, University of Tehran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hijri-offset">Hijri Date Adjustment</Label>
                <Select 
                  value={hijriOffset} 
                  onValueChange={setHijriOffset}
                >
                  <SelectTrigger id="hijri-offset">
                    <SelectValue placeholder="Select hijri offset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-2">-2 days</SelectItem>
                    <SelectItem value="-1">-1 day</SelectItem>
                    <SelectItem value="0">No adjustment</SelectItem>
                    <SelectItem value="1">+1 day</SelectItem>
                    <SelectItem value="2">+2 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Prayer Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for prayer times.</p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled} 
                />
              </div>
            </CardContent>
          </Card>
          
          <CardFooter className="flex justify-end border-t p-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </div>
      </form>
    </div>
  );
}
