import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/router"; 
import { createContext } from "@/server/context"; // Using the file we just fixed!

export const dynamic = "force-dynamic"; // This prevents the 'Failed to collect page data' build error

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (opts) => createContext(opts), 
  });

export { handler as GET, handler as POST };