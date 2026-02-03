'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatients } from '@/hooks/use-patients';
import { createClient } from '@/lib/supabase/client';
import { formatTime } from '@/lib/utils/date';
import type { Service, AppointmentFormData, TimeSlot } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  initialData?: Partial<AppointmentFormData>;
  mode?: 'create' | 'edit';
}

export function AppointmentForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: AppointmentFormProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const supabase = createClient();

  const { patients, isLoading: patientsLoading } = usePatients();
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: initialData?.patient_id || '',
    service_id: initialData?.service_id || '',
    appointment_date: initialData?.appointment_date || '',
    appointment_time: initialData?.appointment_time || '',
    notes: initialData?.notes || '',
  });

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (data) {
        setServices(data);
      }
    };

    fetchServices();
  }, [supabase]);

  // Fetch available slots when date or service changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.appointment_date) {
        setAvailableSlots([]);
        return;
      }

      setIsLoadingSlots(true);

      try {
        const { data, error } = await supabase.rpc('get_available_slots', {
          p_date: formData.appointment_date,
          p_service_id: formData.service_id || undefined,
        });

        if (error) throw error;

        setAvailableSlots(
          (data || []).map((slot: { slot_time: string; slot_end: string }) => ({
            time: slot.slot_time,
            endTime: slot.slot_end,
            available: true,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch slots:', err);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [supabase, formData.appointment_date, formData.service_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset time when date changes
    if (name === 'appointment_date') {
      setFormData((prev) => ({ ...prev, appointment_time: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? t('appointments.newAppointment') : t('common.edit')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Patient */}
          <div className="space-y-2">
            <label htmlFor="patient_id" className="text-sm font-medium">
              {t('appointments.patient')} *
            </label>
            <select
              id="patient_id"
              name="patient_id"
              value={formData.patient_id}
              onChange={handleChange}
              required
              disabled={patientsLoading}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <option value="">{t('common.select')}</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <label htmlFor="service_id" className="text-sm font-medium">
              {t('appointments.service')} *
            </label>
            <select
              id="service_id"
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              required
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            >
              <option value="">{t('common.select')}</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {locale === 'ar' ? service.name_ar : service.name} ({service.duration_minutes} {t('time.minutes')})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="appointment_date" className="text-sm font-medium">
              {t('appointments.date')} *
            </label>
            <input
              id="appointment_date"
              name="appointment_date"
              type="date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label htmlFor="appointment_time" className="text-sm font-medium">
              {t('appointments.time')} *
            </label>
            {isLoadingSlots ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : availableSlots.length === 0 && formData.appointment_date ? (
              <p className="text-sm text-muted-foreground">{t('common.noResults')}</p>
            ) : (
              <select
                id="appointment_time"
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleChange}
                required
                disabled={!formData.appointment_date || availableSlots.length === 0}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                <option value="">{t('common.select')}</option>
                {availableSlots.map((slot) => (
                  <option key={slot.time} value={slot.time}>
                    {formatTime(slot.time, locale)} - {formatTime(slot.endTime, locale)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              {t('appointments.notes')}
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'resize-none'
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
                'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
                'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              {isSubmitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
