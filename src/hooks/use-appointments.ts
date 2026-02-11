'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Appointment, AppointmentWithRelations, AppointmentFilters } from '@/types';

interface UseAppointmentsOptions {
  filters?: AppointmentFilters;
  realtime?: boolean;
}

interface UseAppointmentsReturn {
  appointments: AppointmentWithRelations[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAppointment: (data: {
    patient_id: string;
    service_id: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
  }) => Promise<Appointment>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;
  updateStatus: (id: string, status: Appointment['status'], cancelledBy?: 'assistant' | 'patient') => Promise<void>;
}

export function useAppointments(options: UseAppointmentsOptions = {}): UseAppointmentsReturn {
  const { filters, realtime = true } = options;
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const currentFilters = filtersRef.current;

    try {
      // Ensure auth token is refreshed before querying
      await supabase.auth.getSession();

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, name, phone, email),
          service:services(id, name, name_ar, duration_minutes, price)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      // Apply filters
      if (currentFilters?.status && ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].includes(currentFilters.status)) {
        query = query.eq('status', currentFilters.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show');
      }

      if (currentFilters?.date) {
        query = query.eq('appointment_date', currentFilters.date);
      }

      if (currentFilters?.dateRange) {
        query = query
          .gte('appointment_date', currentFilters.dateRange.from)
          .lte('appointment_date', currentFilters.dateRange.to);
      }

      if (currentFilters?.patientId) {
        query = query.eq('patient_id', currentFilters.patientId);
      }

      if (currentFilters?.serviceId) {
        query = query.eq('service_id', currentFilters.serviceId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setAppointments(data as AppointmentWithRelations[]);
    } catch (err: unknown) {
      // Ignore AbortError (happens during component cleanup)
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to fetch appointments';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Realtime subscription
  useEffect(() => {
    if (!realtime) return;

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, realtime, fetchAppointments]);

  const createAppointment = useCallback(
    async (data: {
      patient_id: string;
      service_id: string;
      appointment_date: string;
      appointment_time: string;
      notes?: string;
    }) => {
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          ...data,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return appointment;
    },
    [supabase]
  );

  const updateAppointment = useCallback(
    async (id: string, data: Partial<Appointment>) => {
      const { error } = await supabase
        .from('appointments')
        .update(data)
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    [supabase]
  );

  const updateStatus = useCallback(
    async (
      id: string,
      status: Appointment['status'],
      cancelledBy?: 'assistant' | 'patient'
    ) => {
      // Call API endpoint that updates status AND sends WhatsApp notification
      const response = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, cancelledBy }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      // Refetch to get updated data
      await fetchAppointments();
    },
    [fetchAppointments]
  );

  return {
    appointments,
    isLoading,
    error,
    refetch: fetchAppointments,
    createAppointment,
    updateAppointment,
    updateStatus,
  };
}

// Hook for single appointment
export function useAppointment(id: string) {
  const [appointment, setAppointment] = useState<AppointmentWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchAppointment = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, name, phone, email),
          service:services(id, name, name_ar, duration_minutes, price)
        `)
        .eq('id', id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setAppointment(data as AppointmentWithRelations);
      }

      setIsLoading(false);
    };

    if (id) {
      fetchAppointment();
    }
  }, [supabase, id]);

  return { appointment, isLoading, error };
}
