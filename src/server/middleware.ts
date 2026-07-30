import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson"; // <-- 1. SuperJSON imported
import { ErrorMessages } from "@/contracts/constants";
import type { TrpcContext } from "./context"; 
import { findUserByUnionId, upsertUser } from "./queries/users";

// 2. Cleaned up the initTRPC call and added the transformer!
const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// Middleware: Enforce a user is logged in
//
// ctx.user is only missing here for two different reasons, and they need
// different handling: either there's genuinely no valid session (no token,
// or Supabase rejected it) — a real auth failure — or the token is
// perfectly valid but this is the very first authed call this session has
// ever made, so there's no `users` row yet (previously, only forge.init
// created that row, which meant any *other* authedQuery procedure —
// resume.get, for instance — threw UNAUTHORIZED for a completely valid
// session that simply hadn't visited /challenges first). ctx.supabaseUserId
// distinguishes the two cases; when it's set, self-heal by creating the row
// right here instead of failing. upsertUser is the same idempotent
// ON CONFLICT DO UPDATE forge.init already calls, so calling it again from
// there afterward is a harmless no-op — Challenges keeps working exactly
// as before.
const requireAuth = t.middleware(async ({ ctx, next }) => {
  let user = ctx.user;

  if (!user && ctx.supabaseUserId) {
    await upsertUser({ unionId: ctx.supabaseUserId });
    user = await findUserByUnionId(ctx.supabaseUserId);
  }

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages?.unauthenticated || "You must be logged in to do this.",
    });
  }

  // We know the user exists now, so we pass it down the chain
  return next({ ctx: { ...ctx, user } });
});

// Middleware: Enforce a specific database role
function requireRole(role: "user" | "admin") { 
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages?.insufficientRole || "You do not have the required permissions.",
      });
    }

    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

// Export the protected procedures for your routers to use
export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("admin"));