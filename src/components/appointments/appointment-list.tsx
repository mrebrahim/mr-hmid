'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { AppointmentCard } from './appointment-card';
import { useAppointments } from '@/hooks/use-appointments';
import type { AppointmentFilters, AppointmentStatus } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface AppointmentListProps {
  initialFilters?: AppointmentFilters;
}

const STATUS_FILTERS: (AppointmentStatus | 'all')[] = [
  'all',
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
];

export function AppointmentList({ initialFilters }: AppointmentListProps) {
  const t = useTranslations('appointments');
  const locale = useLocale() as Locale;

  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<string>(
    initialFilters?.date || new Date().toISOString().split('T')[0]
  );

  const filters: AppointmentFilters = {
    ...initialFilters,
    date: dateFilter,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  };

  const {
    appointments,
    isLoading,
    error,
    updateStatus,
  } = useAppointments({ filters, realtime: true });

  const handleConfirm = async (id: string) => {
    try {
      await updateStatus(id, 'confirmed');
    } catch (err) {
      console.error('Failed to confirm appointment:', err);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await updateStatus(id, 'cancelled', 'assistant');
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateStatus(id, 'completed');
    } catch (err) {
      console.error('Failed to complete appointment:', err);
    }
  };

  const handleNoShow = async (id: string) => {
    try {
      await updateStatus(id, 'no_show');
    } catch (err) {
      console.error('Failed to mark no-show:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Date picker */}
        <div>
          <label htmlFor="date" className="sr-only">
            {t('date')}
          </label>
          <input
            id="date"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={cn(
              'rounded-md border border-input bg-background px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          />
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              )}
            >
              {status === 'all' ? t('filters.all') : t(`statuses.${status}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          {t('loading') || 'Loading...'}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-8 text-destructive">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && appointments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {t('noResults') || 'No appointments found'}
        </div>
      )}

      {/* Appointments grid */}
      {!isLoading && !error && appointments.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onConfirm={() => handleConfirm(appointment.id)}
              onCancel={() => handleCancel(appointment.id)}
              onComplete={() => handleComplete(appointment.id)}
              onNoShow={() => handleNoShow(appointment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
