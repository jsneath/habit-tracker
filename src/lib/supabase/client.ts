import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Check if Supabase is configured
export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return supabaseClient;
}
