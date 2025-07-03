'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Award, Share2, Download, Star } from "lucide-react";

interface StreakMilestoneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streak: number;
  onContinue: () => void;
}

export function StreakMilestoneModal({
  open,
  onOpenChange,
  streak,
  onContinue,
}: StreakMilestoneModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Get milestone type based on streak count
  const getMilestoneDetails = () => {
    if (streak >= 100) {
      return {
        title: "Master Achievement",
        description: "You've reached a stunning 100-day prayer streak! This is true dedication to your spiritual journey.",
        stars: 5,
        color: "from-amber-400 to-yellow-600",
      };
    } else if (streak >= 30) {
      return {
        title: "Devotion Milestone",
        description: "30 days of consistent prayer is a wonderful achievement. You're building a beautiful habit!",
        stars: 4,
        color: "from-indigo-500 to-purple-600",
      };
    } else {
      return {
        title: "Consistency Award",
        description: "You've completed 7 days of prayer consistency. An excellent start to your journey!",
        stars: 3,
        color: "from-teal-400 to-emerald-600",
      };
    }
  };

  const details = getMilestoneDetails();

  // Trigger confetti when modal opens
  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#5E35B1', '#3949AB', '#1E88E5']
          });
          
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#43A047', '#7CB342', '#C0CA33']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      }, 100);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {details.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {details.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Achievement Card */}
          <Card className={`w-full h-52 bg-gradient-to-br ${details.color} text-white p-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-20"></div>
            <div className="relative z-10 flex flex-col items-center">
              <Award className="h-16 w-16 mb-3" />
              <h3 className="text-xl font-bold">{streak} Day Streak!</h3>
              <div className="flex items-center mt-3">
                {Array(details.stars).fill(0).map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-white text-white" />
                ))}
              </div>
            </div>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Save
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Keep up the great work! Your dedication to prayer is building a stronger spiritual foundation.
          </p>
        </div>

        <DialogFooter className="flex sm:justify-center">
          <Button onClick={onContinue} className="w-full sm:w-auto">
            Continue My Journey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
