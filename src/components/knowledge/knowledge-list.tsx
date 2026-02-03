'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Trash2, Edit2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { truncate } from '@/lib/utils/format';
import type { KnowledgeBase, KnowledgeBaseCategory } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface KnowledgeListProps {
  entries: KnowledgeBase[];
  onEdit: (entry: KnowledgeBase) => void;
  onDelete: (id: string) => Promise<void>;
  onGenerateEmbedding: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORY_COLORS: Record<KnowledgeBaseCategory, string> = {
  faq: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  service: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  policy: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export function KnowledgeList({
  entries,
  onEdit,
  onDelete,
  onGenerateEmbedding,
  isLoading,
}: KnowledgeListProps) {
  const t = useTranslations('knowledgeBase');
  const locale = useLocale() as Locale;

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<KnowledgeBaseCategory | 'all'>('all');

  const filteredEntries = filterCategory === 'all'
    ? entries
    : entries.filter((e) => e.category === filterCategory);

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
      return;
    }

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateEmbedding = async (id: string) => {
    setGeneratingId(id);
    try {
      await onGenerateEmbedding(id);
    } finally {
      setGeneratingId(null);
    }
  };

  const categories: (KnowledgeBaseCategory | 'all')[] = ['all', 'faq', 'service', 'policy', 'general'];

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-md transition-colors',
              filterCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            )}
          >
            {cat === 'all' ? (locale === 'ar' ? 'الكل' : 'All') : t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Entries list */}
      {filteredEntries.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {locale === 'ar' ? 'لا توجد إدخالات' : 'No entries found'}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                'rounded-lg border bg-card p-4',
                !entry.is_active && 'opacity-60'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{entry.title}</h3>
                    {entry.category && (
                      <span className={cn('px-2 py-0.5 text-xs rounded-full', CATEGORY_COLORS[entry.category])}>
                        {t(`categories.${entry.category}`)}
                      </span>
                    )}
                    {!entry.is_active && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                        {locale === 'ar' ? 'غير نشط' : 'Inactive'}
                      </span>
                    )}
                    {!entry.embedding && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {locale === 'ar' ? 'بدون تضمين' : 'No embedding'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {truncate(entry.content, 150)}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {!entry.embedding && (
                    <button
                      onClick={() => handleGenerateEmbedding(entry.id)}
                      disabled={isLoading || generatingId === entry.id}
                      title={locale === 'ar' ? 'توليد التضمين' : 'Generate embedding'}
                      className={cn(
                        'p-2 rounded-md hover:bg-muted',
                        'disabled:opacity-50'
                      )}
                    >
                      <RefreshCw className={cn('h-4 w-4', generatingId === entry.id && 'animate-spin')} />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(entry)}
                    disabled={isLoading}
                    className={cn(
                      'p-2 rounded-md hover:bg-muted',
                      'disabled:opacity-50'
                    )}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={isLoading || deletingId === entry.id}
                    className={cn(
                      'p-2 rounded-md text-destructive hover:bg-destructive/10',
                      'disabled:opacity-50'
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
