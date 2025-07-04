'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you would log to an error reporting service
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. This has been logged and we're working to fix it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Error Details:</p>
                  <code className="text-xs text-red-600 block whitespace-pre-wrap">
                    {this.state.error.message}
                  </code>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Async error caught:', error);
    }
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error; // This will be caught by the ErrorBoundary
    }
  }, [error]);

  return { handleError, clearError };
}

// Specific error fallback for prayer times
export function PrayerTimesErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Prayer Times Unavailable
        </CardTitle>
        <CardDescription>
          We couldn't load your prayer times. This might be due to location access or network issues.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Please check your location settings and internet connection.
          </p>
          <Button onClick={retry} size="sm" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Loading Prayer Times
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Network error fallback
export function NetworkErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Connection Issue
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          We're having trouble connecting to our services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Please check your internet connection and try again.
          </p>
          <Button onClick={retry} size="sm" variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 