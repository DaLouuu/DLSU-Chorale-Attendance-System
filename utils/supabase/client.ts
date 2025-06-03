import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Custom Error from utils/supabase/client.ts: Supabase URL or Anon Key is missing when createClient is called!'
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
} 