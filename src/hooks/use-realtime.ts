'use client';

import { useEffect, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions<T extends Record<string, unknown>> {
  table: string;
  schema?: string;
  event?: PostgresChangeEvent;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: { new: T; old: Partial<T> }) => void;
  onDelete?: (payload: Partial<T>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useRealtime<T extends Record<string, unknown>>({
  table,
  schema = 'public',
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimePostgresChangesPayload<T> | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const channelName = `realtime:${schema}:${table}:${filter || 'all'}`;

    const channel = supabase
      .channel(channelName)
      .on<T>(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter,
        },
        (payload) => {
          setLastEvent(payload as RealtimePostgresChangesPayload<T>);

          // Call specific handlers
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new as T);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate({
              new: payload.new as T,
              old: payload.old as Partial<T>,
            });
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old as Partial<T>);
          }

          // Call generic handler
          if (onChange) {
            onChange(payload as RealtimePostgresChangesPayload<T>);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, schema, event, filter, onInsert, onUpdate, onDelete, onChange]);

  return {
    isConnected,
    lastEvent,
  };
}

// Hook for appointments realtime updates
export function useAppointmentsRealtime(
  onUpdate?: () => void
) {
  const [updateCount, setUpdateCount] = useState(0);

  const handleChange = useCallback(() => {
    setUpdateCount((c) => c + 1);
    onUpdate?.();
  }, [onUpdate]);

  const { isConnected, lastEvent } = useRealtime({
    table: 'appointments',
    onChange: handleChange,
  });

  return {
    isConnected,
    lastEvent,
    updateCount,
  };
}

// Hook for conversations realtime updates
export function useConversationsRealtime(
  patientId?: string,
  onNewMessage?: () => void
) {
  const [messageCount, setMessageCount] = useState(0);

  const handleInsert = useCallback(() => {
    setMessageCount((c) => c + 1);
    onNewMessage?.();
  }, [onNewMessage]);

  const { isConnected, lastEvent } = useRealtime({
    table: 'conversations',
    event: 'INSERT',
    filter: patientId ? `patient_id=eq.${patientId}` : undefined,
    onInsert: handleInsert,
  });

  return {
    isConnected,
    lastEvent,
    messageCount,
  };
}
