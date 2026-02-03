/**
 * Slot availability calculation utilities
 */

import { timeToMinutes, minutesToTime, addMinutesToTime } from './date';
import type { ClinicSchedule, Appointment } from '@/lib/supabase/types';

export interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
}

export interface ScheduleDay {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  slotDuration: number;
}

/**
 * Generate all possible time slots for a given schedule
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
): string[] {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  for (let time = startMinutes; time + slotDuration <= endMinutes; time += slotDuration) {
    slots.push(minutesToTime(time));
  }

  return slots;
}

/**
 * Check if a time slot overlaps with an existing appointment
 */
export function isSlotBooked(
  slotTime: string,
  slotDuration: number,
  appointments: Pick<Appointment, 'appointment_time' | 'duration_minutes' | 'status'>[]
): boolean {
  const slotStart = timeToMinutes(slotTime);
  const slotEnd = slotStart + slotDuration;

  return appointments.some((apt) => {
    // Skip cancelled and no-show appointments
    if (apt.status === 'cancelled' || apt.status === 'no_show') {
      return false;
    }

    const aptStart = timeToMinutes(apt.appointment_time);
    const aptEnd = aptStart + apt.duration_minutes;

    // Check for any overlap
    return slotStart < aptEnd && slotEnd > aptStart;
  });
}

/**
 * Get available slots for a given date
 */
export function getAvailableSlots(
  schedule: ScheduleDay | null,
  appointments: Pick<Appointment, 'appointment_time' | 'duration_minutes' | 'status'>[],
  slotDurationOverride?: number
): TimeSlot[] {
  if (!schedule || !schedule.isActive) {
    return [];
  }

  const slotDuration = slotDurationOverride || schedule.slotDuration;
  const allSlots = generateTimeSlots(schedule.startTime, schedule.endTime, slotDuration);

  return allSlots.map((time) => ({
    time,
    endTime: addMinutesToTime(time, slotDuration),
    available: !isSlotBooked(time, slotDuration, appointments),
  }));
}

/**
 * Get only available (unbooked) slots
 */
export function getOnlyAvailableSlots(
  schedule: ScheduleDay | null,
  appointments: Pick<Appointment, 'appointment_time' | 'duration_minutes' | 'status'>[],
  slotDurationOverride?: number
): TimeSlot[] {
  return getAvailableSlots(schedule, appointments, slotDurationOverride).filter(
    (slot) => slot.available
  );
}

/**
 * Convert database schedule to ScheduleDay format
 */
export function toScheduleDay(schedule: ClinicSchedule): ScheduleDay {
  return {
    dayOfWeek: schedule.day_of_week,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    isActive: schedule.is_active,
    slotDuration: schedule.slot_duration_minutes,
  };
}

/**
 * Get schedule for a specific day of week
 */
export function getScheduleForDay(
  schedules: ClinicSchedule[],
  dayOfWeek: number
): ScheduleDay | null {
  const schedule = schedules.find((s) => s.day_of_week === dayOfWeek);
  return schedule ? toScheduleDay(schedule) : null;
}

/**
 * Check if clinic is open on a specific date
 */
export function isClinicOpen(
  date: Date,
  schedules: ClinicSchedule[],
  blockedDates: string[]
): boolean {
  const dateString = date.toISOString().split('T')[0];

  // Check if date is blocked
  if (blockedDates.includes(dateString)) {
    return false;
  }

  // Check if schedule is active for this day
  const dayOfWeek = date.getDay();
  const schedule = getScheduleForDay(schedules, dayOfWeek);

  return schedule !== null && schedule.isActive;
}

/**
 * Format slot for display
 */
export function formatSlot(slot: TimeSlot, locale: 'ar' | 'en' = 'ar'): string {
  const formatTime12h = (time: string, loc: 'ar' | 'en') => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? (loc === 'ar' ? 'م' : 'PM') : (loc === 'ar' ? 'ص' : 'AM');
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return `${formatTime12h(slot.time, locale)} - ${formatTime12h(slot.endTime, locale)}`;
}
