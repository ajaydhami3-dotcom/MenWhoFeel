import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { supabase } from "@/lib/supabase"; 
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./queries/connection";

export type User = typeof users.$inferSelect;

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User; 
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  
  try {
    const authHeader = opts.req.headers.get("authorization");
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabase.auth.getUser(token);

      if (data.user && !error) {
        
        // 🚨 YOUR CURSOR GOES HERE 🚨
        const dbUser = await getDb().select()
          .from(users)
          .where(eq(users.unionId, data.user.id))
          .limit(1);

        if (dbUser.length > 0) {
          ctx.user = dbUser[0]; 
        }
      }
    }
  } catch {
    // Fail silently if not logged in
  }
  
  return ctx;
}