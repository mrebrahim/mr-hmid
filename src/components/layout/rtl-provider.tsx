'use client';

import { useLocale } from 'next-intl';
import { localeDirection, type Locale } from '@/lib/i18n/config';

interface RTLProviderProps {
  children: React.ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  const locale = useLocale() as Locale;
  const direction = localeDirection[locale] || 'ltr';

  return (
    <div dir={direction} className="min-h-screen">
      {children}
    </div>
  );
}
