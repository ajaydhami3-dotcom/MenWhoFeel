import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router"; 
import { createContext } from "@/server/context"; 

// This line is the fix. It forces the route to be dynamic.
export const dynamic = "force-dynamic";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (opts) => createContext(opts), 
  });

export { handler as GET, handler as POST };