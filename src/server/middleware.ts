import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson"; // <-- 1. SuperJSON imported
import { ErrorMessages } from "@/contracts/constants";
import type { TrpcContext } from "./context"; 

// 2. Cleaned up the initTRPC call and added the transformer!
const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

// Middleware: Enforce a user is logged in
const requireAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages?.unauthenticated || "You must be logged in to do this.",
    });
  }

  // We know the user exists now, so we pass it down the chain
  return next({ ctx: { ...ctx, user: ctx.user } });
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