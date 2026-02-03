'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KnowledgeBase, KnowledgeBaseFormData, KnowledgeBaseCategory } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface KnowledgeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: KnowledgeBaseFormData) => Promise<void>;
  initialData?: KnowledgeBase | null;
  mode?: 'create' | 'edit';
}

const CATEGORIES: KnowledgeBaseCategory[] = ['faq', 'service', 'policy', 'general'];

export function KnowledgeForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: KnowledgeFormProps) {
  const t = useTranslations('knowledgeBase');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<KnowledgeBaseFormData>({
    title: '',
    content: '',
    category: 'general',
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        category: initialData.category || 'general',
        is_active: initialData.is_active,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'general',
        is_active: true,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? t('newEntry') : tCommon('edit')}
          </h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              {t('entryTitle')} *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              {t('category')}
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={cn(
                'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              {t('content')} *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={6}
              className={cn(
                'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'resize-none'
              )}
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              {t('active')}
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium',
                'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
              )}
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground',
                'hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:pointer-events-none disabled:opacity-50'
              )}
            >
              {isSubmitting ? tCommon('loading') : tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
