'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { getDayName } from '@/lib/utils/date';
import type { ClinicSchedule } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface WorkingHoursFormProps {
  schedule: ClinicSchedule[];
  onUpdate: (dayOfWeek: number, data: Partial<ClinicSchedule>) => Promise<void>;
  isLoading?: boolean;
}

export function WorkingHoursForm({ schedule, onUpdate, isLoading }: WorkingHoursFormProps) {
  const t = useTranslations('schedule');
  const locale = useLocale() as Locale;

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Create a map of schedule by day
  const scheduleByDay: Record<number, ClinicSchedule> = {};
  schedule.forEach((s) => {
    scheduleByDay[s.day_of_week] = s;
  });

  const handleToggleActive = async (dayOfWeek: number, currentActive: boolean) => {
    setIsSaving(true);
    try {
      await onUpdate(dayOfWeek, { is_active: !currentActive });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (dayOfWeek: number, data: Partial<ClinicSchedule>) => {
    setIsSaving(true);
    try {
      await onUpdate(dayOfWeek, data);
      setEditingDay(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('title')}</h3>

      <div className="space-y-2">
        {Array.from({ length: 7 }, (_, i) => {
          const daySchedule = scheduleByDay[i];
          const isActive = daySchedule?.is_active ?? false;
          const isEditing = editingDay === i;

          return (
            <div
              key={i}
              className={cn(
                'rounded-lg border p-4',
                isActive ? 'bg-card' : 'bg-muted/50'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-medium w-24">{getDayName(i, locale)}</span>

                  {isEditing ? (
                    <EditForm
                      schedule={daySchedule}
                      dayOfWeek={i}
                      onSave={handleSave}
                      onCancel={() => setEditingDay(null)}
                      isSaving={isSaving}
                      t={t}
                    />
                  ) : (
                    <>
                      {isActive ? (
                        <span className="text-sm text-muted-foreground">
                          {daySchedule?.start_time?.slice(0, 5)} - {daySchedule?.end_time?.slice(0, 5)}
                          {' | '}
                          {daySchedule?.slot_duration_minutes} {t('slotDuration')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">{t('closed')}</span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing && isActive && (
                    <button
                      onClick={() => setEditingDay(i)}
                      disabled={isLoading || isSaving}
                      className={cn(
                        'px-3 py-1 text-sm rounded-md',
                        'bg-secondary hover:bg-secondary/80',
                        'disabled:opacity-50'
                      )}
                    >
                      {t('edit') || 'Edit'}
                    </button>
                  )}

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleToggleActive(i, isActive)}
                      disabled={isLoading || isSaving}
                      className="sr-only peer"
                    />
                    <div className={cn(
                      'w-11 h-6 bg-muted rounded-full peer',
                      'peer-checked:after:translate-x-full peer-checked:bg-primary',
                      'after:content-[""] after:absolute after:top-0.5 after:left-[2px]',
                      'after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all',
                      'peer-disabled:opacity-50'
                    )} />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface EditFormProps {
  schedule?: ClinicSchedule;
  dayOfWeek: number;
  onSave: (dayOfWeek: number, data: Partial<ClinicSchedule>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  t: (key: string) => string;
}

function EditForm({ schedule, dayOfWeek, onSave, onCancel, isSaving, t }: EditFormProps) {
  const [startTime, setStartTime] = useState(schedule?.start_time?.slice(0, 5) || '09:00');
  const [endTime, setEndTime] = useState(schedule?.end_time?.slice(0, 5) || '18:00');
  const [slotDuration, setSlotDuration] = useState(schedule?.slot_duration_minutes || 30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(dayOfWeek, {
      start_time: startTime,
      end_time: endTime,
      slot_duration_minutes: slotDuration,
      is_active: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className={cn(
          'rounded-md border border-input bg-background px-2 py-1 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      />
      <span>-</span>
      <input
        type="time"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className={cn(
          'rounded-md border border-input bg-background px-2 py-1 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      />
      <select
        value={slotDuration}
        onChange={(e) => setSlotDuration(Number(e.target.value))}
        className={cn(
          'rounded-md border border-input bg-background px-2 py-1 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      >
        <option value={15}>15 min</option>
        <option value={30}>30 min</option>
        <option value={45}>45 min</option>
        <option value={60}>60 min</option>
      </select>
      <button
        type="submit"
        disabled={isSaving}
        className={cn(
          'px-3 py-1 text-sm rounded-md',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'disabled:opacity-50'
        )}
      >
        {t('save') || 'Save'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className={cn(
          'px-3 py-1 text-sm rounded-md',
          'bg-secondary hover:bg-secondary/80',
          'disabled:opacity-50'
        )}
      >
        {t('cancel') || 'Cancel'}
      </button>
    </form>
  );
}
