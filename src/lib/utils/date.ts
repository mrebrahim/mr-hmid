/**
 * Date/Time utility functions for the dental clinic system
 */

const ARABIC_DAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

const ENGLISH_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getDayName(dayOfWeek: number, locale: 'ar' | 'en' = 'ar'): string {
  const days = locale === 'ar' ? ARABIC_DAYS : ENGLISH_DAYS;
  return days[dayOfWeek] || '';
}

export function getMonthName(month: number, locale: 'ar' | 'en' = 'ar'): string {
  const months = locale === 'ar' ? ARABIC_MONTHS : ENGLISH_MONTHS;
  return months[month] || '';
}

export function formatDate(
  date: Date | string,
  locale: 'ar' | 'en' = 'ar'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dayName = getDayName(d.getDay(), locale);
  const day = d.getDate();
  const monthName = getMonthName(d.getMonth(), locale);
  const year = d.getFullYear();

  return locale === 'ar'
    ? `${dayName}، ${day} ${monthName} ${year}`
    : `${dayName}, ${monthName} ${day}, ${year}`;
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function formatTime(
  time: string,
  locale: 'ar' | 'en' = 'ar'
): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? (locale === 'ar' ? 'م' : 'PM') : (locale === 'ar' ? 'ص' : 'AM');
  const displayHours = hours % 12 || 12;

  return locale === 'ar'
    ? `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
    : `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatTimeRange(
  startTime: string,
  endTime: string,
  locale: 'ar' | 'en' = 'ar'
): string {
  const start = formatTime(startTime, locale);
  const end = formatTime(endTime, locale);
  return locale === 'ar' ? `${start} - ${end}` : `${start} - ${end}`;
}

export function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

export function timeToMinutes(time: string): number {
  const { hours, minutes } = parseTime(time);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const totalMinutes = timeToMinutes(time) + minutesToAdd;
  return minutesToTime(totalMinutes);
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isTomorrow(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function getRelativeDay(date: Date | string, locale: 'ar' | 'en' = 'ar'): string {
  if (isToday(date)) {
    return locale === 'ar' ? 'اليوم' : 'Today';
  }
  if (isTomorrow(date)) {
    return locale === 'ar' ? 'غداً' : 'Tomorrow';
  }
  return formatDate(date, locale);
}
