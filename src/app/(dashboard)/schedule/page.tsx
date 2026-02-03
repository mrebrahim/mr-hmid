'use client';

import { useTranslations } from 'next-intl';
import { WorkingHoursForm } from '@/components/schedule/working-hours-form';
import { BlockedDates } from '@/components/schedule/blocked-dates';
import { useSchedule } from '@/hooks/use-schedule';

export default function SchedulePage() {
  const t = useTranslations('schedule');
  const {
    schedule,
    blockedDates,
    isLoading,
    error,
    updateSchedule,
    addBlockedDate,
    removeBlockedDate,
  } = useSchedule();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Working Hours */}
        <div className="rounded-lg border bg-card p-6">
          <WorkingHoursForm
            schedule={schedule}
            onUpdate={updateSchedule}
            isLoading={isLoading}
          />
        </div>

        {/* Blocked Dates */}
        <div className="rounded-lg border bg-card p-6">
          <BlockedDates
            blockedDates={blockedDates}
            onAdd={async (data) => { await addBlockedDate(data); }}
            onRemove={async (id) => { await removeBlockedDate(id); }}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
