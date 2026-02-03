'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatPhoneNumber, getInitials } from '@/lib/utils/format';
import { usePatients } from '@/hooks/use-patients';
import type { Locale } from '@/lib/i18n/config';

export function PatientList() {
  const t = useTranslations('patients');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;

  const [search, setSearch] = useState('');
  const { patients, isLoading, error } = usePatients({
    filters: { search: search || undefined },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${tCommon('search')}...`}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background ps-10 pe-3 py-2 text-sm',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
          )}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          {tCommon('loading')}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8 text-destructive">
          {error}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && patients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {tCommon('noResults')}
        </div>
      )}

      {/* List */}
      {!isLoading && !error && patients.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className={cn(
                'block rounded-lg border bg-card p-4 shadow-sm',
                'hover:border-primary/50 hover:shadow-md transition-all'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                  {getInitials(patient.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{patient.name}</h3>
                  <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span dir="ltr">{formatPhoneNumber(patient.phone)}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{patient.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
