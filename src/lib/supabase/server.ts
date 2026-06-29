import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Same fallback pattern as src/lib/supabase.ts, so the build worker doesn't
// crash if this is evaluated before Vercel injects real env vars.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://build-bypass.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "build-bypass-key";

/**
 * Creates a Supabase client bound to the current request's cookies. Use this
 * in admin Server Components, Server Actions, and Route Handlers — anywhere
 * that runs on the server and needs to know who's signed in.
 *
 * Must be created fresh per request (don't hoist this into a module-level
 * singleton) since it closes over the current request's cookie jar.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // `setAll` was called from a Server Component, which can't write
          // cookies. Safe to ignore: src/proxy.ts refreshes the session on
          // every request under /admin/**, so the cookie jar stays current
          // by the time it matters.
        }
      },
    },
  });
}
