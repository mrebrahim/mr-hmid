'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Staff } from '@/lib/supabase/types';

interface AuthState {
  user: User | null;
  staff: Staff | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    staff: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
  });

  const supabase = useMemo(() => createClient(), []);

  const fetchStaffProfile = useCallback(
    async (userId: string) => {
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      return staffData;
    },
    [supabase]
  );

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const staff = await fetchStaffProfile(user.id);
        setState({
          user,
          staff,
          isLoading: false,
          isAuthenticated: !!staff,
          isAdmin: staff?.role === 'admin',
        });
      } else {
        setState({
          user: null,
          staff: null,
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
        });
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
        const staff = await fetchStaffProfile(session.user.id);
        setState({
          user: session.user,
          staff,
          isLoading: false,
          isAuthenticated: !!staff,
          isAdmin: staff?.role === 'admin',
        });
      } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        setState({
          user: null,
          staff: null,
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchStaffProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...state,
    signIn,
    signOut,
  };
}
