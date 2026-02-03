'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Stethoscope } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

export default function ServicesPage() {
  const t = useTranslations('services');
  const locale = useLocale() as Locale;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Stethoscope className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {locale === 'ar'
            ? 'صفحة إدارة الخدمات قيد التطوير. ستتمكن قريباً من إضافة وتعديل خدمات العيادة.'
            : 'The services management page is under development. You will soon be able to add and edit clinic services.'}
        </p>
      </div>
    </div>
  );
}
