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
  // The validated Supabase Auth uuid, set whenever the bearer token checks
  // out — even if no `users` row with that unionId exists yet. `ctx.user`
  // requires that row to already exist (it's a straight SELECT below), but
  // a brand-new anonymous session (supabase.auth.signInAnonymously()) has a
  // perfectly valid token with nothing in `users` yet. forge-router's
  // `init` mutation is the one place that reads this directly, to create
  // that row on someone's very first visit.
  supabaseUserId?: string;
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
        ctx.supabaseUserId = data.user.id;

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