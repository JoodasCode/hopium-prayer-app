'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Flame } from 'lucide-react';

type AmbientInfoProps = {
  activeUsers: number;
  streakDays: number;
};

export function AmbientInfo({ activeUsers, streakDays }: AmbientInfoProps) {
  return (
    <Card className="bg-card/80">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm text-muted-foreground">{activeUsers} Muslims praying now</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="flex items-center gap-1 py-1 bg-primary/5 hover:bg-primary/10 transition-colors">
              <span className="text-xs">{streakDays} day streak</span>
              <Flame className="h-3 w-3 text-amber-500" />
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
