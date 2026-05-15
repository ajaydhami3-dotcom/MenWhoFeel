import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { supabase } from "@/lib/supabase"; 
import { db } from "../db"; 
import { users } from "../db/schema"; // <-- Removed the broken 'type User' import
import { eq } from "drizzle-orm";

// Generate the User type directly from the Drizzle table definition
export type User = typeof users.$inferSelect;

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User; // Now represents your full Drizzle User row!
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  
  try {
    // 1. Grab the auth token from the request headers
    const authHeader = opts.req.headers.get("authorization");
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      
      // 2. Ask Supabase to verify the token
      const { data, error } = await supabase.auth.getUser(token);

      if (data.user && !error) {
        // 3. THE UPGRADE: Fetch the full user row from your Drizzle database
        // We match the Supabase Auth ID to the 'unionId' column in your table
        const dbUser = await db.select()
          .from(users)
          .where(eq(users.unionId, data.user.id))
          .limit(1);

        // 4. Attach the real database user to the context
        if (dbUser.length > 0) {
          ctx.user = dbUser[0]; 
        }
      }
    }
  } catch {
    // Authentication is optional here, so we fail silently if they aren't logged in
  }
  
  return ctx;
}