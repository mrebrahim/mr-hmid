'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Phone, Mail, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPhoneNumber, getInitials } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import type { Patient } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface PatientProfileProps {
  patient: Patient;
  onEdit?: () => void;
}

export function PatientProfile({ patient, onEdit }: PatientProfileProps) {
  const t = useTranslations('patients');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-medium">
            {getInitials(patient.name)}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <div className="mt-2 space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span dir="ltr">{formatPhoneNumber(patient.phone)}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{patient.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {locale === 'ar' ? 'تم التسجيل: ' : 'Registered: '}
                  {formatDate(patient.created_at, locale)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className={cn(
              'px-4 py-2 text-sm rounded-md',
              'bg-secondary hover:bg-secondary/80'
            )}
          >
            {tCommon('edit')}
          </button>
        )}
      </div>

      {patient.notes && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{t('notes')}</h3>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap">{patient.notes}</p>
        </div>
      )}
    </div>
  );
}
