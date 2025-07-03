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
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Home, Building, Plane, MapPin, Landmark } from "lucide-react";

type Emotion = 'peaceful' | 'grateful' | 'focused' | 'distracted' | 'rushed';
type Location = 'home' | 'work' | 'mosque' | 'traveling' | 'other';

interface PrayerReflectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prayerName: string;
  onComplete: (data: {
    emotion: Emotion;
    location: Location;
    quality: number;
    reflection?: string;
  }) => void;
}

export function PrayerReflectionModal({
  open,
  onOpenChange,
  prayerName,
  onComplete,
}: PrayerReflectionModalProps) {
  const [emotion, setEmotion] = useState<Emotion>('peaceful');
  const [location, setLocation] = useState<Location>('home');
  const [quality, setQuality] = useState<number>(75);
  const [reflection, setReflection] = useState<string>('');

  const emotions: { label: string; value: Emotion; emoji: string }[] = [
    { label: 'Peaceful', value: 'peaceful', emoji: '😌' },
    { label: 'Grateful', value: 'grateful', emoji: '🙏' },
    { label: 'Focused', value: 'focused', emoji: '🧠' },
    { label: 'Distracted', value: 'distracted', emoji: '😵‍💫' },
    { label: 'Rushed', value: 'rushed', emoji: '⏱️' },
  ];

  const locations: { label: string; value: Location; icon: React.ReactNode }[] = [
    { label: 'Home', value: 'home', icon: <Home className="h-4 w-4" /> },
    { label: 'Work', value: 'work', icon: <Building className="h-4 w-4" /> },
    { label: 'Mosque', value: 'mosque', icon: <Landmark className="h-4 w-4" /> },
    { label: 'Traveling', value: 'traveling', icon: <Plane className="h-4 w-4" /> },
    { label: 'Other', value: 'other', icon: <MapPin className="h-4 w-4" /> },
  ];

  const handleSubmit = () => {
    onComplete({
      emotion,
      location,
      quality,
      reflection: reflection.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-chart-1" />
            {prayerName} Reflection
          </DialogTitle>
          <DialogDescription>
            Take a moment to reflect on your prayer experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Emotion Selection */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">How did you feel during prayer?</h4>
            <div className="flex flex-wrap gap-2">
              {emotions.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={emotion === item.value ? "default" : "outline"}
                  className={`flex items-center gap-1 ${emotion === item.value ? 'bg-chart-1 hover:bg-chart-1/90' : ''}`}

                  onClick={() => setEmotion(item.value)}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Location Selection */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Where did you pray?</h4>
            <div className="flex flex-wrap gap-2">
              {locations.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={location === item.value ? "default" : "outline"}
                  className={`flex items-center gap-1.5 ${location === item.value ? 'bg-chart-2 hover:bg-chart-2/90' : ''}`}

                  onClick={() => setLocation(item.value)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Prayer Quality Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Prayer quality</h4>
              <Badge variant="outline" className="font-mono">{quality}%</Badge>
            </div>
            <Slider
              defaultValue={[quality]}
              max={100}
              step={1}
              className="py-4 [&>[data-theme=light]>:first-child]:bg-chart-3/30 [&>[data-theme=light]>:last-child]:bg-chart-3"
              onValueChange={(values) => setQuality(values[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Distracted</span>
              <span>Focused</span>
            </div>
          </div>

          {/* Reflection Notes */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Reflection notes (optional)</h4>
            <Textarea
              placeholder="Any thoughts or reflections on this prayer..."
              className="resize-none h-20"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-1.5 bg-chart-2 hover:bg-chart-2/90">
            <CheckCircle className="h-4 w-4 text-primary-foreground" />
            Complete Reflection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
