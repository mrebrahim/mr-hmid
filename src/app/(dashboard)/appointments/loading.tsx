import { Skeleton, CardSkeleton } from '@/components/ui/skeleton';

export default function AppointmentsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
