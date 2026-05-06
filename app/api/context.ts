import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { supabase } from "../src/lib/supabase";

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
    // 1. Grab the auth token from the request headers
    const authHeader = opts.req.headers.get("authorization");
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      
      // 2. Ask Supabase to verify the token and return the user
      const { data, error } = await supabase.auth.getUser(token);

      if (data.user && !error) {
        // 3. Attach the user to the context
        // Note: You may need to fetch the full user from your database here 
        // using data.user.id if your Drizzle `User` type requires more fields.
        ctx.user = {
          id: data.user.id,
          email: data.user.email!,
        } as User; 
      }
    }
  } catch {
    // Authentication is optional here, so we fail silently if they aren't logged in
  }
  
  return ctx;
}