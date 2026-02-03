'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MessageSquare, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { Conversation } from '@/types';
import type { Locale } from '@/lib/i18n/config';

interface ConversationHistoryProps {
  patientId: string;
}

export function ConversationHistory({ patientId }: ConversationHistoryProps) {
  const t = useTranslations('conversations');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setConversations(data || []);
      }

      setIsLoading(false);
    };

    fetchConversations();
  }, [supabase, patientId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('title')}</h3>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-center py-4">{tCommon('loading')}</p>
      )}

      {error && (
        <p className="text-destructive text-center py-4">{error}</p>
      )}

      {!isLoading && !error && conversations.length === 0 && (
        <p className="text-muted-foreground text-center py-4">
          {locale === 'ar' ? 'لا توجد محادثات' : 'No conversations yet'}
        </p>
      )}

      {!isLoading && !error && conversations.length > 0 && (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                'flex gap-3',
                conv.sender === 'ai_agent' ? 'flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
                  conv.sender === 'patient'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                )}
              >
                {conv.sender === 'patient' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  'flex-1 max-w-[80%]',
                  conv.sender === 'ai_agent' ? 'text-end' : ''
                )}
              >
                <div
                  className={cn(
                    'rounded-lg p-3 inline-block',
                    conv.sender === 'patient'
                      ? 'bg-muted'
                      : 'bg-green-50 dark:bg-green-950'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{conv.message}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(conv.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
