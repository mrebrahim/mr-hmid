'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Patient, PatientFilters, PatientFormData } from '@/types';

interface UsePatientsOptions {
  filters?: PatientFilters;
  realtime?: boolean;
}

interface UsePatientsReturn {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPatient: (data: PatientFormData) => Promise<Patient>;
  updatePatient: (id: string, data: Partial<PatientFormData>) => Promise<void>;
}

export function usePatients(options: UsePatientsOptions = {}): UsePatientsReturn {
  const { filters, realtime = false } = options;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply search filter
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setPatients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, filters]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Realtime subscription
  useEffect(() => {
    if (!realtime) return;

    const channel = supabase
      .channel('patients-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        () => {
          fetchPatients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, realtime, fetchPatients]);

  const createPatient = useCallback(
    async (data: PatientFormData) => {
      const { data: patient, error } = await supabase
        .from('patients')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return patient;
    },
    [supabase]
  );

  const updatePatient = useCallback(
    async (id: string, data: Partial<PatientFormData>) => {
      const { error } = await supabase
        .from('patients')
        .update(data)
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    [supabase]
  );

  return {
    patients,
    isLoading,
    error,
    refetch: fetchPatients,
    createPatient,
    updatePatient,
  };
}

// Hook for single patient
export function usePatient(id: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setPatient(data);
      }

      setIsLoading(false);
    };

    if (id) {
      fetchPatient();
    }
  }, [supabase, id]);

  return { patient, isLoading, error };
}
