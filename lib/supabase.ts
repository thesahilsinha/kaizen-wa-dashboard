import { createClient } from '@supabase/supabase-js'

// Master supabase (your DB)
export const masterSupabase = createClient(
  process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY!
)

// Dynamic client supabase per session
export function getClientSupabase(url: string, anonKey: string) {
  return createClient(url, anonKey)
}