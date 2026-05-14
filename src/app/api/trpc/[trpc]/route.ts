import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app"; // Check this import matches your actual path!

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    // FIX: We cast to 'any' to tell TypeScript to stand down 
    // until we wire up the actual Supabase database context later.
    createContext: () => ({} as any), 
  });

export { handler as GET, handler as POST };