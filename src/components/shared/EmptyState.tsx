'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type EmptyStateProps = {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  showSampleData?: boolean;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  showSampleData = false,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-primary/20 bg-background">
      <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          {icon}
        </div>
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">{description}</p>
        
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mb-2">
            {actionLabel}
          </Button>
        )}
        
        {secondaryLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryLabel}
          </Button>
        )}
        
        {showSampleData && (
          <div className="mt-6 pt-4 border-t border-border w-full">
            <p className="text-xs text-muted-foreground mb-2">Sample data preview:</p>
            <div className="bg-muted/50 rounded-md p-3">
              <div className="h-20 animate-pulse flex flex-col justify-between">
                <div className="h-2 bg-muted-foreground/20 rounded w-3/4"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-1/2"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-5/6"></div>
                <div className="h-2 bg-muted-foreground/20 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
