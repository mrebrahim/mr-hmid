/**
 * Formatting utilities
 */

/**
 * Format phone number for display
 * Input: +971501234567
 * Output: +971 50 123 4567
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // UAE format
  if (cleaned.startsWith('+971')) {
    const rest = cleaned.slice(4);
    if (rest.length === 9) {
      return `+971 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5)}`;
    }
  }

  // Generic international format
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  return phone;
}

/**
 * Format price in AED
 */
export function formatPrice(
  price: number | null | undefined,
  locale: 'ar' | 'en' = 'ar'
): string {
  if (price === null || price === undefined) {
    return locale === 'ar' ? 'غير محدد' : 'Not specified';
  }

  const formatted = price.toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-AE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return locale === 'ar' ? `${formatted} درهم` : `AED ${formatted}`;
}

/**
 * Format duration in minutes
 */
export function formatDuration(
  minutes: number,
  locale: 'ar' | 'en' = 'ar'
): string {
  if (minutes < 60) {
    return locale === 'ar' ? `${minutes} دقيقة` : `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    if (locale === 'ar') {
      return hours === 1 ? 'ساعة واحدة' : `${hours} ساعات`;
    }
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  if (locale === 'ar') {
    const hourText = hours === 1 ? 'ساعة' : 'ساعات';
    return `${hours} ${hourText} و ${remainingMinutes} دقيقة`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format appointment status for display
 */
export function formatStatus(
  status: string,
  locale: 'ar' | 'en' = 'ar'
): string {
  const statusMap: Record<string, { ar: string; en: string }> = {
    pending: { ar: 'معلق', en: 'Pending' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
    no_show: { ar: 'لم يحضر', en: 'No Show' },
  };

  return statusMap[status]?.[locale] || status;
}

/**
 * Get status color class for Tailwind
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Validate E.164 phone number format
 */
export function isValidE164Phone(phone: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
