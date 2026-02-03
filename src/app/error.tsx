'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 bg-background text-foreground">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground max-w-md">
              An unexpected error occurred. Please try again or return to the home page.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={reset}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-md',
                'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href="/"
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-md',
                'border border-input bg-background hover:bg-muted'
              )}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
