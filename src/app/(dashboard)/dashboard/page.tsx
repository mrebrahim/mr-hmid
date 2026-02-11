'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Clock, Users, CheckCircle, MessageCircle, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { formatTime, formatDateShort } from '@/lib/utils/date';
import { formatPhoneNumber } from '@/lib/utils/format';
import type { Locale } from '@/lib/i18n/config';

interface AppointmentRow {
  id: string;
  patient_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  patient_name: string | null;
  patient_phone: string | null;
  purpose: string | null;
  patient: { id: string; name: string; phone: string; email: string | null } | null;
  service: { id: string; name: string; name_ar: string; duration_minutes: number; price: number } | null;
}

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

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const locale = useLocale() as Locale;

  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function fetchData() {
    try {
      console.log('[Dashboard] Fetching appointments...');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, name, phone, email),
          service:services(id, name, name_ar, duration_minutes, price)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (fetchError) throw fetchError;

      console.log('[Dashboard] Fetched', data?.length ?? 0, 'appointments');
      setAppointments((data as AppointmentRow[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Dashboard] Fetch error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleConfirm = async (id: string) => {
    setActionLoading(id);
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchData();
    } catch (err) {
      console.error('[Dashboard] Confirm error:', err);
      alert(locale === 'ar' ? 'فشل في تأكيد الموعد' : 'Failed to confirm appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    setActionLoading(id);
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchData();
    } catch (err) {
      console.error('[Dashboard] Cancel error:', err);
      alert(locale === 'ar' ? 'فشل في إلغاء الموعد' : 'Failed to cancel appointment');
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const confirmedToday = todayAppointments.filter(a => a.status === 'confirmed');
  const uniquePatients = new Set(appointments.map(a => a.patient_id)).size;

  // Error state - full page error with retry
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium text-lg mb-2">{locale === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data'}</p>
          <p className="text-sm mb-4 font-mono bg-red-100 dark:bg-red-900 p-2 rounded">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm"
          >
            {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
          title={locale === 'ar' ? 'تحديث البيانات' : 'Refresh Data'}
        >
          <RefreshCw className={cn('h-4 w-4', (isRefreshing || loading) && 'animate-spin')} />
          <span className="hidden sm:inline">
            {locale === 'ar' ? 'تحديث' : 'Refresh'}
          </span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('todayAppointments')}
          value={todayAppointments.length}
          icon={Calendar}
          loading={loading}
        />
        <StatCard
          title={t('pendingAppointments')}
          value={pendingAppointments.length}
          icon={Clock}
          loading={loading}
        />
        <StatCard
          title={t('totalPatients')}
          value={uniquePatients}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title={locale === 'ar' ? 'مؤكد اليوم' : 'Confirmed Today'}
          value={confirmedToday.length}
          icon={CheckCircle}
          loading={loading}
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

        {loading ? (
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
            {pendingAppointments.map((appointment) => {
              const patientName = appointment.patient?.name || appointment.patient_name || '';
              const patientPhone = appointment.patient?.phone || appointment.patient_phone || '';
              const serviceName = appointment.service
                ? (locale === 'ar' ? appointment.service.name_ar : appointment.service.name)
                : appointment.purpose || '';
              const isActioning = actionLoading === appointment.id;

              return (
                <div key={appointment.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium truncate">{patientName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2" dir="ltr">
                        {formatPhoneNumber(patientPhone)}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {serviceName}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-muted">
                          {formatDateShort(appointment.appointment_date)} - {formatTime(appointment.appointment_time, locale)}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleConfirm(appointment.id)}
                        disabled={isActioning}
                        className={cn(
                          'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium',
                          'bg-green-600 text-white hover:bg-green-700',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'transition-colors'
                        )}
                      >
                        {isActioning ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {locale === 'ar' ? 'تأكيد' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        disabled={isActioning}
                        className={cn(
                          'flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium',
                          'bg-red-600 text-white hover:bg-red-700',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'transition-colors'
                        )}
                      >
                        {isActioning ? (
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
            })}
          </div>
        )}
      </div>

      {/* Today's Confirmed Appointments */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          {locale === 'ar' ? 'مواعيد اليوم المؤكدة' : "Today's Confirmed Appointments"}
        </h2>

        {loading ? (
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
