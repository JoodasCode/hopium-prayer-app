'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { UserStateProvider } from '@/contexts/UserStateContext';
import { Toaster } from '@/components/ui/sonner';
import { PageTransition } from '@/components/transitions/PageTransition';

// Create a client-side only providers wrapper
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <UserStateProvider>
          <PageTransition>
            {children}
          </PageTransition>
          <Toaster />
        </UserStateProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
