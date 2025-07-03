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
import { Clock, Shield, Flame, AlertTriangle } from "lucide-react";

interface StreakFreezeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStreak: number;
  freezesRemaining: number;
  prayer: {
    name: string;
    time: Date;
  };
  onUseFreeze: () => void;
  onNavigateToSettings: () => void;
}

export function StreakFreezeModal({
  open,
  onOpenChange,
  currentStreak,
  freezesRemaining,
  prayer,
  onUseFreeze,
  onNavigateToSettings,
}: StreakFreezeModalProps) {
  const [loading, setLoading] = useState(false);

  // Calculate risk level based on current time and prayer time
  const calculateRiskLevel = () => {
    const now = new Date();
    const prayerTime = prayer.time.getTime();
    const diffMs = prayerTime - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) return "high"; // Less than 1 hour
    if (diffHours < 2) return "medium"; // Less than 2 hours
    return "low"; // More than 2 hours
  };

  const riskLevel = calculateRiskLevel();
  const riskColor = 
    riskLevel === "high" ? "text-red-500" : 
    riskLevel === "medium" ? "text-amber-500" : 
    "text-yellow-500";

  const handleUseFreeze = async () => {
    if (freezesRemaining <= 0) return;
    
    setLoading(true);
    try {
      await onUseFreeze();
      onOpenChange(false);
    } catch (error) {
      console.error("Error using streak freeze:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${riskColor}`} />
            Streak at Risk
          </DialogTitle>
          <DialogDescription>
            You might miss {prayer.name} today. Protect your {currentStreak}-day streak.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Streak Information */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-lg">{currentStreak} Days</h4>
              <p className="text-sm text-muted-foreground">Your current streak</p>
            </div>
          </div>
          
          {/* Risk Assessment */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Risk Level</h4>
              <Badge 
                variant="outline" 
                className={`
                  ${riskLevel === "high" ? "bg-red-500/10 text-red-600 border-red-200" : ""}
                  ${riskLevel === "medium" ? "bg-amber-500/10 text-amber-600 border-amber-200" : ""}
                  ${riskLevel === "low" ? "bg-yellow-500/10 text-yellow-600 border-yellow-200" : ""}
                `}
              >
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{prayer.name} prayer time</span>
              </div>
              <span className="font-medium">
                {prayer.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
            
            <Progress 
              value={riskLevel === "high" ? 90 : riskLevel === "medium" ? 60 : 30} 
              className={`h-1.5 
                ${riskLevel === "high" ? "bg-red-100" : ""}
                ${riskLevel === "medium" ? "bg-amber-100" : ""}
                ${riskLevel === "low" ? "bg-yellow-100" : ""}
              `} 
            />
          </div>
          
          {/* Streak Shield Information */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Streak Shields Available</h4>
              <Badge variant="outline" className="font-mono">
                {freezesRemaining} remaining
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Use a Streak Shield to protect your streak when you can't make a prayer on time.
              {freezesRemaining <= 0 ? " You can earn more shields through consistent prayer habits." : ""}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            onClick={handleUseFreeze} 
            className="w-full gap-1.5" 
            disabled={loading || freezesRemaining <= 0}
          >
            <Shield className="h-4 w-4" />
            Use Streak Shield
          </Button>
          
          {freezesRemaining <= 0 && (
            <Button 
              variant="outline" 
              onClick={onNavigateToSettings}
              className="w-full gap-1.5"
            >
              Manage Streak Shields
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
