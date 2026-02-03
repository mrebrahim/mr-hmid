import { Skeleton } from '@/components/ui/skeleton';

export default function ScheduleLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Content grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Working Hours */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-5 w-4" />
              <Skeleton className="h-10 w-28" />
            </div>
          ))}
          <Skeleton className="h-10 w-full mt-4" />
        </div>

        {/* Blocked Dates */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
