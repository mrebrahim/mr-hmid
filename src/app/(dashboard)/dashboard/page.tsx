'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Clock, Users, CheckCircle, MessageCircle, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppointments } from '@/hooks/use-appointments';
import { useAppointmentsRealtime } from '@/hooks/use-realtime';
import { formatTime, formatDateShort } from '@/lib/utils/date';
import { formatPhoneNumber } from '@/lib/utils/format';
import type { Locale } from '@/lib/i18n/config';
import type { AppointmentWithRelations } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  loading?: boolean;
}

function StatCard({ title, value, icon: Icon, className, loading }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold">
            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : value}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

interface RequestCardProps {
  appointment: AppointmentWithRelations;
  onConfirm: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  locale: Locale;
}

function RequestCard({ appointment, onConfirm, onCancel, locale }: RequestCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(appointment.id);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel(appointment.id);
    } finally {
      setIsCancelling(false);
    }
  };

  // Use patient relation if available, otherwise use direct fields
  const patientName = appointment.patient?.name || appointment.patient_name || '';
  const patientPhone = appointment.patient?.phone || appointment.patient_phone || '';
  const serviceName = appointment.service
    ? (locale === 'ar' ? appointment.service.name_ar : appointment.service.name)
    : appointment.purpose || '';

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Patient Info */}
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-green-500" />
            <span className="font-medium truncate">{patientName}</span>
          </div>

          {/* Phone */}
          <p className="text-sm text-muted-foreground mb-2" dir="ltr">
            {formatPhoneNumber(patientPhone)}
          </p>

          {/* Service & Time */}
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
              {serviceName}
            </span>
            <span className="px-2 py-1 rounded-full bg-muted">
              {formatDateShort(appointment.appointment_date)} - {formatTime(appointment.appointment_time, locale)}
            </span>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {appointment.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleConfirm}
            disabled={isConfirming || isCancelling}
            className={cn(
              'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium',
              'bg-green-600 text-white hover:bg-green-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {isConfirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {locale === 'ar' ? 'تأكيد' : 'Confirm'}
          </button>

          <button
            onClick={handleCancel}
            disabled={isConfirming || isCancelling}
            className={cn(
              'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium',
              'bg-red-600 text-white hover:bg-red-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {isCancelling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale() as Locale;

  // Fetch all appointments
  const { appointments, isLoading, updateStatus, refetch } = useAppointments();

  // Enable realtime updates
  useAppointmentsRealtime(() => {
    refetch();
  });

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const confirmedToday = todayAppointments.filter(a => a.status === 'confirmed');

  // Get unique patients count
  const uniquePatients = new Set(appointments.map(a => a.patient_id)).size;

  // Handle confirm - updates status and triggers n8n webhook
  const handleConfirm = async (id: string) => {
    await updateStatus(id, 'confirmed');

    // Trigger n8n webhook for confirmation notification
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      try {
        await fetch('/api/webhooks/n8n/appointment-confirmed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            record: appointment,
            old_record: { ...appointment, status: 'pending' }
          })
        });
      } catch (error) {
        console.error('Failed to trigger n8n webhook:', error);
      }
    }
  };

  // Handle cancel - updates status and triggers n8n webhook
  const handleCancel = async (id: string) => {
    await updateStatus(id, 'cancelled', 'assistant');

    // Trigger n8n webhook for cancellation notification
    const appointment = appointments.find(a => a.id === id);
    if (appointment) {
      try {
        await fetch('/api/webhooks/n8n/appointment-cancelled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            record: { ...appointment, status: 'cancelled' },
            old_record: appointment
          })
        });
      } catch (error) {
        console.error('Failed to trigger n8n webhook:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('todayAppointments')}
          value={todayAppointments.length}
          icon={Calendar}
          loading={isLoading}
        />
        <StatCard
          title={t('pendingAppointments')}
          value={pendingAppointments.length}
          icon={Clock}
          loading={isLoading}
        />
        <StatCard
          title={t('totalPatients')}
          value={uniquePatients}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title={locale === 'ar' ? 'مؤكد اليوم' : 'Confirmed Today'}
          value={confirmedToday.length}
          icon={CheckCircle}
          loading={isLoading}
        />
      </div>

      {/* WhatsApp Requests Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-semibold">
            {locale === 'ar' ? 'طلبات الحجز من واتساب' : 'WhatsApp Booking Requests'}
          </h2>
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            {pendingAppointments.length}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{locale === 'ar' ? 'لا توجد طلبات جديدة' : 'No new requests'}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingAppointments.map((appointment) => (
              <RequestCard
                key={appointment.id}
                appointment={appointment}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>

      {/* Today's Confirmed Appointments */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          {locale === 'ar' ? 'مواعيد اليوم المؤكدة' : "Today's Confirmed Appointments"}
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : confirmedToday.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            {locale === 'ar' ? 'لا توجد مواعيد مؤكدة اليوم' : 'No confirmed appointments today'}
          </p>
        ) : (
          <div className="space-y-3">
            {confirmedToday
              .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
              .map((appointment) => {
                const patientName = appointment.patient?.name || appointment.patient_name || '';
                const serviceName = appointment.service
                  ? (locale === 'ar' ? appointment.service.name_ar : appointment.service.name)
                  : appointment.purpose || '';

                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-primary">
                        {formatTime(appointment.appointment_time, locale)}
                      </div>
                      <div>
                        <p className="font-medium">{patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {serviceName}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {locale === 'ar' ? 'مؤكد' : 'Confirmed'}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
