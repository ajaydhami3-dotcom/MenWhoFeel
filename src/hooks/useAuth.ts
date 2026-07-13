"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuthState = {
  isReady: boolean;
  error: string | null;
};

/**
 * Ensures a Supabase session exists for this browser — restoring one from
 * a previous visit (via the refresh token Supabase already keeps in
 * localStorage) if there is one, or starting a brand new anonymous
 * session if not. No email, password, or any other identifying info is
 * ever collected; signInAnonymously() just issues a real auth.uid() and
 * session tied to nothing but this browser.
 *
 * `isReady` flips true once a session is confirmed to exist — the signal
 * that it's safe to call anything that needs a logged-in ctx.user
 * server-side (e.g. forge.init).
 *
 * This is the one place that actually *starts* a session. Providers.tsx
 * forwards whatever session already exists on every tRPC call, but
 * doesn't create one — so a page that never renders something calling
 * this hook never gets an anonymous identity just for being visited.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ isReady: false, error: null });

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) throw error;
        }

        if (!cancelled) setState({ isReady: true, error: null });
      } catch (err) {
        console.error("[useAuth] failed to establish a session:", err);
        if (!cancelled) {
          setState({
            isReady: false,
            error: err instanceof Error ? err.message : "Couldn't start a session.",
          });
        }
      }
    }

    ensureSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
