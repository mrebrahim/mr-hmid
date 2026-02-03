import { Skeleton } from '@/components/ui/skeleton';

export default function PatientDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-9 w-48" />
      </div>

      {/* Profile card */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointment History */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* Conversation History */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'} rounded-lg`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
