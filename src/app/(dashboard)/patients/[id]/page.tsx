'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PatientProfile } from '@/components/patients/patient-profile';
import { ConversationHistory } from '@/components/patients/conversation-history';
import { AppointmentCard } from '@/components/appointments/appointment-card';
import { usePatient } from '@/hooks/use-patients';
import { useAppointments } from '@/hooks/use-appointments';
import type { Locale } from '@/lib/i18n/config';

export default function PatientDetailPage() {
  const t = useTranslations('patients');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const { patient, isLoading: patientLoading, error: patientError } = usePatient(patientId);
  const { appointments, isLoading: appointmentsLoading } = useAppointments({
    filters: { patientId },
    realtime: false,
  });

  if (patientLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {tCommon('loading')}
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="text-center py-8 text-destructive">
        {patientError || (locale === 'ar' ? 'المريض غير موجود' : 'Patient not found')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className={cn(
            'p-2 rounded-md hover:bg-muted',
            'focus:outline-none focus:ring-2 focus:ring-ring'
          )}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
      </div>

      {/* Patient Profile */}
      <PatientProfile patient={patient} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointment History */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">{t('appointmentHistory')}</h3>

          {appointmentsLoading ? (
            <p className="text-muted-foreground">{tCommon('loading')}</p>
          ) : appointments.length === 0 ? (
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'لا توجد مواعيد' : 'No appointments'}
            </p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  compact
                />
              ))}
              {appointments.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  {locale === 'ar'
                    ? `+ ${appointments.length - 5} مواعيد أخرى`
                    : `+ ${appointments.length - 5} more appointments`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Conversation History */}
        <ConversationHistory patientId={patientId} />
      </div>
    </div>
  );
}
