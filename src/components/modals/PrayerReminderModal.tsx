'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Clock, 
  Smartphone, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Shield,
  Vibrate
} from "lucide-react";

interface Prayer {
  name: string;
  time: Date;
  timeRemaining: string;
}

interface PrayerReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prayer: Prayer;
  onSetReminder: (reminderOptions: ReminderOptions) => Promise<boolean>;
}

interface ReminderOptions {
  minutesBefore: number;
  enableSound: boolean;
  enableVibration: boolean;
  customMessage?: string;
}

const REMINDER_PRESETS = [
  { label: '5 min before', value: 5, icon: '⏰' },
  { label: '10 min before', value: 10, icon: '🔔' },
  { label: '15 min before', value: 15, icon: '⏱️' },
  { label: '30 min before', value: 30, icon: '📱' },
  { label: 'At prayer time', value: 0, icon: '🕐' }
];

export function PrayerReminderModal({ 
  open, 
  onOpenChange, 
  prayer, 
  onSetReminder 
}: PrayerReminderModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(10); // Default to 10 minutes
  const [enableSound, setEnableSound] = useState(true);
  const [enableVibration, setEnableVibration] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const [isSettingReminder, setIsSettingReminder] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [open]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setPermissionError('Notifications are not supported in this browser');
      return false;
    }

    setIsCheckingPermission(true);
    setPermissionError(null);

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'denied') {
        setPermissionError('Notifications were denied. Please enable them in your browser settings.');
        return false;
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setPermissionError('Failed to request notification permission');
      return false;
    } finally {
      setIsCheckingPermission(false);
    }
  };

  const handleSetReminder = async () => {
    setIsSettingReminder(true);
    
    try {
      // Check permission first
      if (notificationPermission !== 'granted') {
        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) {
          setIsSettingReminder(false);
          return;
        }
      }

      const success = await onSetReminder({
        minutesBefore: selectedPreset,
        enableSound,
        enableVibration,
      });

      if (success) {
        // Show test notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(`${prayer.name} Reminder Set`, {
            body: `You'll be reminded ${selectedPreset === 0 ? 'at prayer time' : `${selectedPreset} minutes before`} ${prayer.name}`,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'prayer-reminder-confirmation',
            silent: !enableSound
          });
          
          // Handle vibration separately for mobile devices
          if (enableVibration && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        }
        
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error setting reminder:', error);
      setPermissionError('Failed to set reminder. Please try again.');
    } finally {
      setIsSettingReminder(false);
    }
  };

  const getPermissionIcon = () => {
    switch (notificationPermission) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPermissionText = () => {
    switch (notificationPermission) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Blocked';
      default:
        return 'Permission needed';
    }
  };

  const formatReminderTime = (minutesBefore: number) => {
    if (minutesBefore === 0) return formatTime(prayer.time);
    
    const reminderTime = new Date(prayer.time.getTime() - minutesBefore * 60000);
    return formatTime(reminderTime);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto max-h-[85vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-center flex items-center justify-center gap-2 text-lg">
            <Bell className="h-4 w-4 text-primary" />
            Set Reminder
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Get notified for {prayer.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Prayer Info - Compact */}
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="font-semibold text-foreground">{prayer.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatTime(prayer.time)} • {prayer.timeRemaining}
              </div>
            </div>

            {/* Notification Permission Status - Compact */}
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                {getPermissionIcon()}
                <div>
                  <div className="font-medium text-xs">{getPermissionText()}</div>
                </div>
              </div>
              {notificationPermission !== 'granted' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={requestNotificationPermission}
                  disabled={isCheckingPermission}
                  className="h-7 px-2 text-xs"
                >
                  {isCheckingPermission ? 'Checking...' : 'Enable'}
                </Button>
              )}
            </div>

            {/* Permission Error - Compact */}
            {permissionError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-red-700">
                    {permissionError}
                  </div>
                </div>
              </div>
            )}

            {/* Reminder Time Presets - Compact */}
            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">
                When to remind you
              </label>
              <div className="space-y-1">
                {REMINDER_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setSelectedPreset(preset.value)}
                    className={`w-full p-2 text-left rounded-md border transition-colors ${
                      selectedPreset === preset.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{preset.icon}</span>
                        <span className="font-medium text-sm">{preset.label}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatReminderTime(preset.value)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Options - Compact */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground block">
                Notification style
              </label>
              
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-xs">Sound</div>
                  </div>
                </div>
                <Switch
                  checked={enableSound}
                  onCheckedChange={setEnableSound}
                  className="scale-75"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Vibrate className="h-3 w-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-xs">Vibration</div>
                  </div>
                </div>
                <Switch
                  checked={enableVibration}
                  onCheckedChange={setEnableVibration}
                  className="scale-75"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9 text-sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSetReminder}
            disabled={isSettingReminder || (notificationPermission === 'denied')}
            className="flex-1 h-9 text-sm"
          >
            {isSettingReminder ? (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Setting...
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Set Reminder
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 