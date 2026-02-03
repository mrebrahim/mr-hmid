'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KnowledgeList } from '@/components/knowledge/knowledge-list';
import { KnowledgeForm } from '@/components/knowledge/knowledge-form';
import { useKnowledge } from '@/hooks/use-knowledge';
import type { KnowledgeBase } from '@/types';

export default function KnowledgeBasePage() {
  const t = useTranslations('knowledgeBase');
  const {
    entries,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    generateEmbedding,
  } = useKnowledge();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeBase | null>(null);

  const handleCreate = () => {
    setEditingEntry(null);
    setIsFormOpen(true);
  };

  const handleEdit = (entry: KnowledgeBase) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, data);
    } else {
      await createEntry(data);
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <button
          onClick={handleCreate}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-md',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'focus:outline-none focus:ring-2 focus:ring-ring'
          )}
        >
          <Plus className="h-4 w-4" />
          {t('newEntry')}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <KnowledgeList
        entries={entries}
        onEdit={handleEdit}
        onDelete={deleteEntry}
        onGenerateEmbedding={generateEmbedding}
        isLoading={isLoading}
      />

      <KnowledgeForm
        isOpen={isFormOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialData={editingEntry}
        mode={editingEntry ? 'edit' : 'create'}
      />
    </div>
  );
}
