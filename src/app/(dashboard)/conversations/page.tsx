'use client';

import { useTranslations, useLocale } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

export default function ConversationsPage() {
  const t = useTranslations('conversations');
  const locale = useLocale() as Locale;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <MessageSquare className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {locale === 'ar'
            ? 'صفحة المحادثات قيد التطوير. ستتمكن قريباً من عرض وإدارة جميع محادثات المرضى.'
            : 'The conversations page is under development. You will soon be able to view and manage all patient conversations.'}
        </p>
      </div>
    </div>
  );
}
