import { createClient } from "@supabase/supabase-js";

// We provide fallback dummy strings so the Next.js build worker doesn't crash 
// if it evaluates this file before Vercel injects the environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://build-bypass.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "build-bypass-key";

// Some mobile browsing contexts — Safari Private Browsing, or in-app
// browsers like Instagram/TikTok/WhatsApp opening a shared link in their
// own restricted webview — either don't provide a working localStorage or
// throw on write. The default Supabase storage adapter doesn't guard
// against that: signInAnonymously() can succeed against Supabase's server
// (no client-side error, useAuth reports ready) while the session quietly
// never gets persisted, so the next request — resume.get, for instance —
// goes out with no token to send at all. This falls back to an in-memory
// store instead, so the session survives for the current page life even
// when storage is restricted, rather than failing outright. It won't
// survive a reload in that specific case — that's still a real
// limitation of a fully restricted context, just a much smaller one than
// "doesn't work at all."
const memoryStore = new Map<string, string>();

const resilientStorage = {
  getItem: (key: string) => {
    try {
      return window.localStorage.getItem(key) ?? memoryStore.get(key) ?? null;
    } catch {
      return memoryStore.get(key) ?? null;
    }
  },
  setItem: (key: string, value: string) => {
    memoryStore.set(key, value);
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage restricted — the in-memory fallback above is what keeps
      // this page life working.
    }
  },
  removeItem: (key: string) => {
    memoryStore.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Already cleared from the memory store above.
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Only wire in the custom storage client-side — this file is also
    // imported server-side (context.ts, auth-router.ts) purely to
    // validate tokens, where `window` doesn't exist and Supabase's own
    // server-safe default (no persistence) is exactly what's wanted.
    storage: typeof window !== "undefined" ? resilientStorage : undefined,
  },
});