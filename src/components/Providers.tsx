"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { Toaster } from "sonner";
import { useTheme } from "next-themes";

// Shared by both the public site and admin. The public site wraps this in
// next-themes' <ThemeProvider> (see (site)/layout.tsx) so useTheme() below
// resolves the visitor's real choice; admin has no ThemeProvider ancestor
// (it stays permanently dark per its own layout), in which case useTheme()
// safely returns an undefined theme and the fallback below keeps toasts
// dark there too — matching admin's forced-dark reality either way.
function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <Toaster
      position="bottom-right"
      theme={isLight ? "light" : "dark"}
      toastOptions={{
        style: {
          background: isLight ? "hsl(42 30% 98%)" : "hsl(88 11% 11%)",
          border: `1px solid ${isLight ? "hsl(42 16% 85%)" : "hsl(85 10% 20%)"}`,
          color: isLight ? "hsl(100 10% 13%)" : "hsl(42 22% 93%)",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          async headers() {
            // Forwards whatever session already exists (restored or
            // anonymous) — this never creates one itself. A page that
            // never calls useAuth() just sends no Authorization header,
            // and every publicQuery procedure keeps working exactly as
            // before.
            const {
              data: { session },
            } = await supabase.auth.getSession();
            return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ThemedToaster />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
