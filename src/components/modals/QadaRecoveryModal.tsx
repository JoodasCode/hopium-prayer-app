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
import { Clock, Calendar, CheckCircle, AlertCircle, Timer, Heart, Sparkles } from "lucide-react";

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
      return "Recovery window closed";
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
      <DialogContent className="max-w-md mx-auto border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="flex items-center justify-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <span>Make Up Prayer</span>
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            You can still complete your {prayer.name} prayer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Prayer Details Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {prayer.time.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {prayer.time.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recovery Window</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  <Timer className="h-3 w-3 mr-1" />
                  {formatTimeRemaining()}
                </Badge>
              </div>
              
              <Progress 
                value={timeRemaining} 
                className="h-2 bg-muted/50" 
              />
              
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Recovery available</span>
                <span>{timeRemaining}% window remaining</span>
              </div>
            </div>
          </div>

          {/* Spiritual Encouragement */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Spiritual Reminder</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              "Whoever forgets a prayer should pray it when they remember it. 
              There is no other expiation than this."
            </p>
            <p className="text-xs text-muted-foreground mt-2 opacity-75">
              — Hadith, Sahih Muslim
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-primary">+15</div>
              <div className="text-xs text-muted-foreground">XP Reward</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-primary">1</div>
              <div className="text-xs text-muted-foreground">Qada Completed</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 pt-2">
          <Button 
            onClick={handleRecover} 
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
            disabled={loading}
            size="lg"
          >
            <CheckCircle className="h-4 w-4" />
            {loading ? 'Completing...' : 'Complete Prayer Now'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSetReminder}
            className="w-full gap-2 border-primary/30 hover:bg-primary/10"
            size="lg"
          >
            <Clock className="h-4 w-4" />
            Remind Me in 30 Minutes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
