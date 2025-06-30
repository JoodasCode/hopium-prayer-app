import { ReactNode } from 'react';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  showSampleData?: boolean;
  sampleDataComponent?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  showSampleData = false,
  sampleDataComponent,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50 space-y-4">
      <div className="rounded-full bg-primary/10 p-3">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold">{title}</h3>
      
      <p className="text-muted-foreground max-w-md">
        {description}
      </p>
      
      {showSampleData && sampleDataComponent && (
        <div className="w-full max-w-md my-4 opacity-70">
          {sampleDataComponent}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        
        {secondaryLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
