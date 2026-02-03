'use client';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ message, fullScreen = false }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : 'py-12'
      )}
    >
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
