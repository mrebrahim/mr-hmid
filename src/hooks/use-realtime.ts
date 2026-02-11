'use client';

import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

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

  const supabase = useMemo(() => createClient(), []);

  // Store callbacks in refs to avoid re-subscribing on every render
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  const onChangeRef = useRef(onChange);
  onInsertRef.current = onInsert;
  onUpdateRef.current = onUpdate;
  onDeleteRef.current = onDelete;
  onChangeRef.current = onChange;

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
          if (payload.eventType === 'INSERT' && onInsertRef.current) {
            onInsertRef.current(payload.new as T);
          } else if (payload.eventType === 'UPDATE' && onUpdateRef.current) {
            onUpdateRef.current({
              new: payload.new as T,
              old: payload.old as Partial<T>,
            });
          } else if (payload.eventType === 'DELETE' && onDeleteRef.current) {
            onDeleteRef.current(payload.old as Partial<T>);
          }

          // Call generic handler
          if (onChangeRef.current) {
            onChangeRef.current(payload as RealtimePostgresChangesPayload<T>);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, table, schema, event, filter]);

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
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const handleChange = useCallback(() => {
    setUpdateCount((c) => c + 1);
    onUpdateRef.current?.();
  }, []);

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

  const onNewMessageRef = useRef(onNewMessage);
  onNewMessageRef.current = onNewMessage;

  const handleInsert = useCallback(() => {
    setMessageCount((c) => c + 1);
    onNewMessageRef.current?.();
  }, []);

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
