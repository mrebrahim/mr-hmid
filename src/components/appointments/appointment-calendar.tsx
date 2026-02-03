'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDayName, formatDateShort } from '@/lib/utils/date';
import { AppointmentCard } from './appointment-card';
import type { AppointmentWithRelations } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface AppointmentCalendarProps {
  appointments: AppointmentWithRelations[];
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onNoShow?: (id: string) => void;
}

export function AppointmentCalendar({
  appointments,
  onDateSelect,
  onAppointmentClick,
  onConfirm,
  onCancel,
  onComplete,
  onNoShow,
}: AppointmentCalendarProps) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, AppointmentWithRelations[]> = {};
    appointments.forEach((apt) => {
      const dateKey = apt.appointment_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [appointments]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [startingDayOfWeek, daysInMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const getDateKey = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return formatDateShort(date);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const selectedDateKey = selectedDate ? formatDateShort(selectedDate) : null;
  const selectedAppointments = selectedDateKey ? appointmentsByDate[selectedDateKey] || [] : [];

  // Day names
  const dayNames = Array.from({ length: 7 }, (_, i) => getDayName(i, locale).slice(0, 3));

  // Month name
  const monthNames = locale === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* Calendar */}
      <div className="rounded-lg border bg-card p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className={cn(
              'p-2 rounded-md hover:bg-muted',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={handleNextMonth}
            className={cn(
              'p-2 rounded-md hover:bg-muted',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((name, i) => (
            <div
              key={i}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dateKey = getDateKey(day);
            const dayAppointments = appointmentsByDate[dateKey] || [];
            const hasAppointments = dayAppointments.length > 0;
            const pendingCount = dayAppointments.filter((a) => a.status === 'pending').length;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  'aspect-square p-1 rounded-md text-sm relative',
                  'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring',
                  isToday(day) && 'bg-primary/10 font-bold',
                  isSelected(day) && 'bg-primary text-primary-foreground',
                  !isSelected(day) && hasAppointments && 'font-medium'
                )}
              >
                <span>{day}</span>
                {hasAppointments && !isSelected(day) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {pendingCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day appointments */}
      <div className="space-y-4">
        <h3 className="font-semibold">
          {selectedDate
            ? new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(selectedDate)
            : t('appointments.selectDate')}
        </h3>

        {selectedAppointments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t('common.noResults')}
          </p>
        ) : (
          <div className="space-y-3">
            {selectedAppointments
              .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
              .map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  compact
                  onConfirm={onConfirm ? () => onConfirm(appointment.id) : undefined}
                  onCancel={onCancel ? () => onCancel(appointment.id) : undefined}
                  onComplete={onComplete ? () => onComplete(appointment.id) : undefined}
                  onNoShow={onNoShow ? () => onNoShow(appointment.id) : undefined}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
