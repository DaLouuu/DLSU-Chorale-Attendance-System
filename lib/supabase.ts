import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sstmwvnstzwaopqjkurm.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdG13dm5zdHp3YW9wcWprdXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjM2ODcsImV4cCI6MjA2MjA5OTY4N30.owoNICStx_2uejWtHjHvcZmq-5i5vn_62SSQLtQBKMA"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
