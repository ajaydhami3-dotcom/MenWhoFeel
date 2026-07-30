import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { supabase } from "@/lib/supabase";
import { users } from "@/db/schema";
import { findUserByUnionId } from "./queries/users";

export type User = typeof users.$inferSelect;

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  // The validated Supabase Auth uuid, set whenever the bearer token checks
  // out — even if no `users` row with that unionId exists yet. This stays
  // a cheap read-only lookup on purpose (it runs on every tRPC call,
  // including fully public ones) — see requireAuth in middleware.ts for
  // where a missing row actually gets created, only on requests that need
  // it.
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
        ctx.user = await findUserByUnionId(data.user.id);
      }
    }
  } catch {
    // Fail silently if not logged in
  }
  
  return ctx;
}