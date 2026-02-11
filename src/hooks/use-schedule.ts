'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ClinicSchedule, BlockedDate, ScheduleFormData, BlockedDateFormData } from '@/types';

interface UseScheduleReturn {
  schedule: ClinicSchedule[];
  blockedDates: BlockedDate[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSchedule: (dayOfWeek: number, data: Partial<ScheduleFormData>) => Promise<void>;
  addBlockedDate: (data: BlockedDateFormData) => Promise<BlockedDate>;
  removeBlockedDate: (id: string) => Promise<void>;
}

export function useSchedule(): UseScheduleReturn {
  const [schedule, setSchedule] = useState<ClinicSchedule[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await supabase.auth.getSession();

      // Fetch schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('clinic_schedule')
        .select('*')
        .order('day_of_week');

      if (scheduleError) throw scheduleError;

      // Fetch blocked dates
      const { data: blockedData, error: blockedError } = await supabase
        .from('blocked_dates')
        .select('*')
        .gte('blocked_date', new Date().toISOString().split('T')[0])
        .order('blocked_date');

      if (blockedError) throw blockedError;

      setSchedule(scheduleData || []);
      setBlockedDates(blockedData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateSchedule = useCallback(
    async (dayOfWeek: number, data: Partial<ScheduleFormData>) => {
      const existingDay = schedule.find((s) => s.day_of_week === dayOfWeek);

      if (existingDay) {
        // Update existing
        const { error } = await supabase
          .from('clinic_schedule')
          .update(data)
          .eq('day_of_week', dayOfWeek);

        if (error) throw new Error(error.message);
      } else {
        // Insert new
        const { error } = await supabase.from('clinic_schedule').insert({
          day_of_week: dayOfWeek,
          start_time: data.start_time || '09:00',
          end_time: data.end_time || '18:00',
          is_active: data.is_active ?? true,
          slot_duration_minutes: data.slot_duration_minutes || 30,
        });

        if (error) throw new Error(error.message);
      }

      await fetchData();
    },
    [supabase, schedule, fetchData]
  );

  const addBlockedDate = useCallback(
    async (data: BlockedDateFormData) => {
      const { data: blockedDate, error } = await supabase
        .from('blocked_dates')
        .insert(data)
        .select()
        .single();

      if (error) throw new Error(error.message);

      await fetchData();
      return blockedDate;
    },
    [supabase, fetchData]
  );

  const removeBlockedDate = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('blocked_dates').delete().eq('id', id);

      if (error) throw new Error(error.message);

      await fetchData();
    },
    [supabase, fetchData]
  );

  return {
    schedule,
    blockedDates,
    isLoading,
    error,
    refetch: fetchData,
    updateSchedule,
    addBlockedDate,
    removeBlockedDate,
  };
}
