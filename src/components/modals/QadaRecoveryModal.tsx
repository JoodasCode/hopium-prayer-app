'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, CheckCircle, AlertCircle, Timer } from "lucide-react";

interface PrayerToRecover {
  id: string;
  name: string;
  time: Date;
  expiresAt: Date;
}

interface QadaRecoveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prayer: PrayerToRecover;
  onRecover: (prayerId: string) => void;
  onSetReminder: (prayerId: string, reminderTime: Date) => void;
}

export function QadaRecoveryModal({
  open,
  onOpenChange,
  prayer,
  onRecover,
  onSetReminder,
}: QadaRecoveryModalProps) {
  const [loading, setLoading] = useState(false);

  // Calculate time remaining percentage
  const calculateTimeRemaining = () => {
    const now = new Date();
    const missedTime = prayer.time.getTime();
    const expiryTime = prayer.expiresAt.getTime();
    const totalWindow = expiryTime - missedTime;
    const elapsed = now.getTime() - missedTime;
    const remaining = Math.max(0, 100 - (elapsed / totalWindow) * 100);
    return Math.round(remaining);
  };

  const timeRemaining = calculateTimeRemaining();
  
  // Format time until expiry in human readable form
  const formatTimeRemaining = () => {
    const now = new Date();
    const expiryTime = prayer.expiresAt.getTime();
    const diffMs = expiryTime - now.getTime();
    
    if (diffMs <= 0) {
      return "Time expired";
    }
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes} minutes remaining`;
    }
  };

  const handleRecover = async () => {
    setLoading(true);
    try {
      await onRecover(prayer.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error recovering prayer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetReminder = () => {
    // Calculate a reminder time 30 minutes from now
    const reminderTime = new Date();
    reminderTime.setMinutes(reminderTime.getMinutes() + 30);
    
    onSetReminder(prayer.id, reminderTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Recover Missed Prayer
          </DialogTitle>
          <DialogDescription>
            You missed {prayer.name}, but you can still make it up.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prayer Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {prayer.time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {prayer.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1.5">Recovery window</h4>
              <div className="space-y-1.5">
                <Progress value={timeRemaining} className="h-2 bg-muted" />
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 text-xs font-normal">
                    <Timer className="h-3 w-3 mr-1" />
                    {formatTimeRemaining()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{timeRemaining}% window remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Qada Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">About Qada prayers</h4>
            <p className="text-sm text-muted-foreground">
              In Islam, if you miss a prayer, you can make it up later as a Qada prayer. 
              It's recommended to make up missed prayers as soon as possible.
            </p>
            <div className="bg-primary/5 rounded-lg p-3 text-sm">
              <p>"Whoever forgets a prayer should pray it when they remember it. 
              There is no other expiation than this."</p>
              <p className="mt-1 text-xs text-muted-foreground">— Hadith, Sahih Muslim</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            onClick={handleRecover} 
            className="w-full gap-1.5" 
            disabled={loading}
          >
            <CheckCircle className="h-4 w-4" />
            Make Up This Prayer Now
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSetReminder}
            className="w-full gap-1.5"
          >
            <Clock className="h-4 w-4" />
            Remind Me Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
