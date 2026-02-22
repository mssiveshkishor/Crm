"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export function useSupabaseAuth() {
  const client = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(() => (client ? true : false));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;

    let mounted = true;

    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [client]);

  const signInWithPassword = async (email: string, password: string) => {
    if (!client) return { error: new Error("Supabase client missing") };
    setLoading(true);
    const { error: authError } = await client.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return { error: authError };
    }
    setError(null);
    return { error: null };
  };

  const signOut = async () => {
    if (!client) return;
    await client.auth.signOut();
  };

  return {
    session,
    loading,
    error,
    signInWithPassword,
    signOut,
  };
}
