'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import type { BlockedDate, BlockedDateFormData } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface BlockedDatesProps {
  blockedDates: BlockedDate[];
  onAdd: (data: BlockedDateFormData) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function BlockedDates({ blockedDates, onAdd, onRemove, isLoading }: BlockedDatesProps) {
  const t = useTranslations('schedule');
  const locale = useLocale() as Locale;

  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;

    setIsSaving(true);
    try {
      await onAdd({ blocked_date: newDate, reason: newReason || undefined });
      setNewDate('');
      setNewReason('');
      setIsAdding(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    setIsSaving(true);
    try {
      await onRemove(id);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('blockedDates')}</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={isLoading || isSaving}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50'
            )}
          >
            <Plus className="h-4 w-4" />
            {t('addBlockedDate')}
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="blocked_date" className="text-sm font-medium">
                {t('date') || 'Date'} *
              </label>
              <input
                id="blocked_date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="reason" className="text-sm font-medium">
                {t('reason')}
              </label>
              <input
                id="reason"
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: عطلة رسمية' : 'e.g., Public Holiday'}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                'px-4 py-2 text-sm rounded-md',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'disabled:opacity-50'
              )}
            >
              {t('save') || 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewDate('');
                setNewReason('');
              }}
              disabled={isSaving}
              className={cn(
                'px-4 py-2 text-sm rounded-md',
                'bg-secondary hover:bg-secondary/80',
                'disabled:opacity-50'
              )}
            >
              {t('cancel') || 'Cancel'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {blockedDates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {locale === 'ar' ? 'لا توجد تواريخ محجوبة' : 'No blocked dates'}
        </p>
      ) : (
        <div className="space-y-2">
          {blockedDates.map((blocked) => (
            <div
              key={blocked.id}
              className="flex items-center justify-between rounded-lg border bg-card p-3"
            >
              <div>
                <p className="font-medium">{formatDate(blocked.blocked_date, locale)}</p>
                {blocked.reason && (
                  <p className="text-sm text-muted-foreground">{blocked.reason}</p>
                )}
              </div>
              <button
                onClick={() => handleRemove(blocked.id)}
                disabled={isLoading || isSaving}
                className={cn(
                  'p-2 rounded-md text-destructive hover:bg-destructive/10',
                  'disabled:opacity-50'
                )}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
