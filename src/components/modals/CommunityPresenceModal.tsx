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
  DialogClose,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Clock, Heart, CircleUser, X } from "lucide-react";

interface RegionData {
  name: string;
  count: number;
  percentage: number;
}

interface CommunityPresenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalUsers: number;
  prayerName: string;
  regions: RegionData[];
  onJoin: () => void;
}

export function CommunityPresenceModal({
  open,
  onOpenChange,
  totalUsers,
  prayerName,
  regions,
  onJoin,
}: CommunityPresenceModalProps) {
  const [joined, setJoined] = useState(false);
  const [counter, setCounter] = useState(totalUsers);

  // Simulate real-time counter changes
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      // Random fluctuation in user count (+1, 0, or -1)
      const change = Math.floor(Math.random() * 3) - 1;
      setCounter(prev => Math.max(prev + change, totalUsers - 5));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [open, totalUsers]);

  const handleJoin = () => {
    setJoined(true);
    onJoin();
    // Increase the counter when user joins
    setCounter(prev => prev + 1);
  };

  // Get time window description
  const getTimeWindow = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Simplified mapping of hours to prayer times
    if (hour >= 4 && hour < 7) return "Fajr";
    if (hour >= 12 && hour < 14) return "Dhuhr";
    if (hour >= 15 && hour < 17) return "Asr";
    if (hour >= 19 && hour < 21) return "Maghrib";
    if (hour >= 21 || hour < 1) return "Isha";
    
    return prayerName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Community Presence
          </DialogTitle>
          <DialogDescription>
            Join others from around the world in prayer right now.
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Active User Count */}
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="text-4xl font-bold relative">
              <span className="relative z-10">{counter.toLocaleString()}</span>
              <span className="absolute inset-0 animate-ping opacity-20 bg-primary/10 rounded-full"></span>
            </div>
            <p className="text-sm text-muted-foreground">people praying {getTimeWindow()}</p>
            
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {Array.from({ length: Math.min(15, Math.floor(totalUsers / 100)) }).map((_, i) => (
                <div 
                  key={i}
                  className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <CircleUser className="h-4 w-4 text-primary/60" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Regional Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Prayer activity by region
            </h4>
            
            <div className="space-y-2">
              {regions.map((region) => (
                <div key={region.name} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>{region.name}</span>
                    <span className="text-muted-foreground">{region.count.toLocaleString()} people</span>
                  </div>
                  <Progress value={region.percentage} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Time Insights */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Live prayer times
            </h4>
            
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p>
                <strong>{(counter * 0.85).toFixed(0)}%</strong> of the community has completed their prayers within the past hour.
              </p>
              <p className="mt-1">
                Join them in prayer to strengthen our global community.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleJoin} 
            className="w-full gap-1.5" 
            disabled={joined}
          >
            <Heart className="h-4 w-4" />
            {joined ? "You've joined the community" : "Join in prayer now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
