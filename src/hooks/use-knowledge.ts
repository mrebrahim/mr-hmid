'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { KnowledgeBase, KnowledgeBaseFormData } from '@/types';

interface UseKnowledgeReturn {
  entries: KnowledgeBase[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createEntry: (data: KnowledgeBaseFormData) => Promise<KnowledgeBase>;
  updateEntry: (id: string, data: Partial<KnowledgeBaseFormData>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  generateEmbedding: (id: string) => Promise<void>;
}

export function useKnowledge(): UseKnowledgeReturn {
  const [entries, setEntries] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await supabase.auth.getSession();

      const { data, error: fetchError } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('category')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch knowledge base');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = useCallback(
    async (data: KnowledgeBaseFormData) => {
      const { data: entry, error } = await supabase
        .from('knowledge_base')
        .insert(data)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Trigger embedding generation
      try {
        await generateEmbeddingForEntry(entry.id, entry.title + ' ' + entry.content);
      } catch (e) {
        console.warn('Failed to generate embedding:', e);
      }

      await fetchEntries();
      return entry;
    },
    [supabase, fetchEntries]
  );

  const updateEntry = useCallback(
    async (id: string, data: Partial<KnowledgeBaseFormData>) => {
      const { error } = await supabase
        .from('knowledge_base')
        .update(data)
        .eq('id', id);

      if (error) throw new Error(error.message);

      // Re-generate embedding if content changed
      if (data.title || data.content) {
        const entry = entries.find((e) => e.id === id);
        if (entry) {
          const text = (data.title || entry.title) + ' ' + (data.content || entry.content);
          try {
            await generateEmbeddingForEntry(id, text);
          } catch (e) {
            console.warn('Failed to generate embedding:', e);
          }
        }
      }

      await fetchEntries();
    },
    [supabase, entries, fetchEntries]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('knowledge_base').delete().eq('id', id);

      if (error) throw new Error(error.message);

      await fetchEntries();
    },
    [supabase, fetchEntries]
  );

  const generateEmbeddingForEntry = async (id: string, text: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-embedding`,
      {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ id, text, table: 'knowledge_base' }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate embedding');
    }
  };

  const generateEmbedding = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) throw new Error('Entry not found');

      await generateEmbeddingForEntry(id, entry.title + ' ' + entry.content);
      await fetchEntries();
    },
    [entries, fetchEntries]
  );

  return {
    entries,
    isLoading,
    error,
    refetch: fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    generateEmbedding,
  };
}
