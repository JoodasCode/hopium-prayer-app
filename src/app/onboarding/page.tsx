'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Dynamically import the OnboardingContainer to avoid hydration issues
// since it uses browser APIs like localStorage and navigator.vibrate
const OnboardingContainer = dynamic(
  () => import('@/components/onboarding/OnboardingContainer').then(mod => ({ default: mod.default })),
  { ssr: false }
);

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Preparing your spiritual journey...</p>
        </div>
      </div>
    }>
      <OnboardingContainer />
    </Suspense>
  );

}
