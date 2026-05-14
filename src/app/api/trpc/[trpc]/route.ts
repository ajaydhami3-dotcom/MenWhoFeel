import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router";

// This bridges Next.js HTTP requests to your tRPC router
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    // We will wire up your exact context (database/auth) in a second
    createContext: () => ({}), 
  });

export { handler as GET, handler as POST };