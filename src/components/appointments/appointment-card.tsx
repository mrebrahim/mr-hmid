'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Clock, User, Stethoscope, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime, formatDate } from '@/lib/utils/date';
import { formatStatus, getStatusColor } from '@/lib/utils/format';
import type { AppointmentWithRelations } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onConfirm?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onNoShow?: () => void;
  compact?: boolean;
}

export function AppointmentCard({
  appointment,
  onConfirm,
  onCancel,
  onComplete,
  onNoShow,
  compact = false,
}: AppointmentCardProps) {
  const t = useTranslations('appointments');
  const locale = useLocale() as Locale;

  // Use direct fields if patient relation is null (WhatsApp booking)
  const patientName = appointment.patient?.name || appointment.patient_name || 'غير معروف';
  const patientPhone = appointment.patient?.phone || appointment.patient_phone || '';
  const serviceName = appointment.service
    ? (locale === 'ar' ? appointment.service.name_ar : appointment.service.name)
    : appointment.purpose || 'غير محدد';

  if (compact) {
    return (
      <div className="flex items-center gap-4 rounded-lg border bg-card p-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{patientName}</span>
            <span className={cn('px-2 py-0.5 text-xs rounded-full', getStatusColor(appointment.status))}>
              {formatStatus(appointment.status, locale)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(appointment.appointment_time, locale)}
            </span>
            <span>{serviceName}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{patientName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{patientPhone}</span>
          </div>
        </div>
        <span className={cn('px-2 py-1 text-xs rounded-full', getStatusColor(appointment.status))}>
          {formatStatus(appointment.status, locale)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">{t('date')}</p>
            <p className="font-medium">{formatDate(appointment.appointment_date, locale)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">{t('time')}</p>
            <p className="font-medium">{formatTime(appointment.appointment_time, locale)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-muted-foreground">{t('service')}</p>
            <p className="font-medium">{serviceName}</p>
          </div>
        </div>
      </div>

      {(appointment.notes || appointment.purpose) && (
        <div className="mt-4 text-sm">
          <p className="text-muted-foreground">{t('notes')}</p>
          <p>{appointment.notes || appointment.purpose}</p>
        </div>
      )}

      {/* Action buttons based on status */}
      <div className="mt-4 flex flex-wrap gap-2">
        {appointment.status === 'pending' && (
          <>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md',
                  'bg-green-100 text-green-700 hover:bg-green-200',
                  'dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                )}
              >
                {t('actions.confirm')}
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md',
                  'bg-red-100 text-red-700 hover:bg-red-200',
                  'dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                )}
              >
                {t('actions.cancel')}
              </button>
            )}
          </>
        )}

        {appointment.status === 'confirmed' && (
          <>
            {onComplete && (
              <button
                onClick={onComplete}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md',
                  'bg-blue-100 text-blue-700 hover:bg-blue-200',
                  'dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
                )}
              >
                {t('actions.complete')}
              </button>
            )}
            {onNoShow && (
              <button
                onClick={onNoShow}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md',
                  'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                )}
              >
                {t('actions.noShow')}
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md',
                  'bg-red-100 text-red-700 hover:bg-red-200',
                  'dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                )}
              >
                {t('actions.cancel')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
