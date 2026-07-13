"use client";

import { useState } from "react";
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "@/server/router";
import { supabase } from "@/lib/supabase";

export const trpc = createTRPCReact<AppRouter>();

// This right here is the React Function Component. 
// The hooks MUST live inside these curly brackets!
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson, // Moved inside httpBatchLink!
          async headers() {
            // Kept in sync with Providers.tsx, which is the provider
            // actually mounted in (site)/layout.tsx and admin/layout.tsx
            // today — this one isn't currently wired up anywhere, but
            // it's the same client the app router's types come from, so
            // it shouldn't quietly fall behind and surprise whoever wires
            // it up next.
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
      </QueryClientProvider>
    </trpc.Provider>
  );
}