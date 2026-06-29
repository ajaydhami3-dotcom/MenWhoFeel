import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://build-bypass.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "build-bypass-key";

/**
 * Browser-side Supabase client that stores the session in cookies (rather
 * than localStorage) so it's visible to src/proxy.ts and Server Components.
 * Only used on /admin/login — the rest of the site keeps using the
 * localStorage-based client in src/lib/supabase.ts.
 *
 * @supabase/ssr already memoizes this into a singleton internally, so it's
 * fine to call this on every render.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
