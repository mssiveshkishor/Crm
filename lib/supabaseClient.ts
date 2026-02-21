import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabase) {
    return supabase;
  }

  if (!url || !anonKey) {
    console.warn(
      "Supabase credentials are missing—falling back to sample data."
    );
    return null;
  }

  supabase = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return supabase;
}
