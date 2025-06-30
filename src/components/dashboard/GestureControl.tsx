'use client';

import { useState } from 'react';
import { cn } from '@/components/ui/cn';

type GestureControlProps = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  children: React.ReactNode;
};

export function GestureControl({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  children
}: GestureControlProps) {
  const [touchStart, setTouchStart] = useState<{x: number; y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number; y: number} | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) < minSwipeDistance) return;
      if (distanceX > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    } else {
      if (Math.abs(distanceY) < minSwipeDistance) return;
      if (distanceY > 0) {
        onSwipeUp?.();
      } else {
        onSwipeDown?.();
      }
    }
    
    setTouchEnd(null);
    setTouchStart(null);
  };

  return (
    <div
      className={cn('touch-pan-y', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}
