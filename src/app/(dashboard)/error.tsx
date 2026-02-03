'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          An error occurred while loading this page. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={reset}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-md',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
