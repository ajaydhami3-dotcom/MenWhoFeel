import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { findUserByUnionId, upsertUser } from "./queries/users";
import {
  checkInMaintenance,
  completeDay,
  getAnonymousStats,
  getForgeDays,
  getOrCreateForgeProgress,
  getRecentMonthlyLogs,
  getUserResponses,
  pauseForge,
  resetForgeProgress,
  resumeForge,
  saveMonthlyLog,
  skipDay,
} from "./queries/forge";
import { isDayUnlocked } from "@/lib/forge-logic";

export const forgeRouter = createRouter({
  /**
   * Called once on mount, before anyone is necessarily in `users` yet —
   * a brand-new supabase.auth.signInAnonymously() session has a perfectly
   * valid token but no row here until this runs. publicQuery (not
   * authedQuery) on purpose: ctx.user doesn't exist yet on a first visit,
   * only ctx.supabaseUserId does (see server/context.ts).
   */
  init: publicQuery.query(async ({ ctx }) => {
    if (!ctx.supabaseUserId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No anonymous session yet — the Forge couldn't start. Try refreshing the page.",
      });
    }

    await upsertUser({ unionId: ctx.supabaseUserId });
    const user = await findUserByUnionId(ctx.supabaseUserId);
    if (!user) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't set up your Forge session." });
    }

    const [progress, responses, stats] = await Promise.all([
      getOrCreateForgeProgress(user.id),
      getUserResponses(user.id),
      getAnonymousStats(),
    ]);

    return { progress, responses, stats };
  }),

  completeDay: authedQuery
    .input(
      z.object({
        dayNumber: z.number().int().min(1),
        responseText: z.string().max(4000).optional(),
        moodRating: z.number().int().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const days = await getForgeDays();
      const day = days.find((d) => d.dayNumber === input.dayNumber);
      if (!day) throw new TRPCError({ code: "NOT_FOUND", message: "That Forge day doesn't exist." });

      const progress = await getOrCreateForgeProgress(ctx.user.id);
      if (!isDayUnlocked(input.dayNumber, progress)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "That day isn't unlocked yet." });
      }

      const { progress: updated } = await completeDay({
        userId: ctx.user.id,
        dayNumber: input.dayNumber,
        challengeTitle: day.title,
        responseText: input.responseText,
        moodRating: input.moodRating,
        totalDays: days.length,
      });

      return updated;
    }),

  skipDay: authedQuery
    .input(z.object({ dayNumber: z.number().int().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const days = await getForgeDays();
      if (!days.some((d) => d.dayNumber === input.dayNumber)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "That Forge day doesn't exist." });
      }

      const progress = await getOrCreateForgeProgress(ctx.user.id);
      if (!isDayUnlocked(input.dayNumber, progress)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "That day isn't unlocked yet." });
      }

      return skipDay({ userId: ctx.user.id, dayNumber: input.dayNumber, totalDays: days.length });
    }),

  pause: authedQuery.mutation(async ({ ctx }) => pauseForge(ctx.user.id)),

  resume: authedQuery.mutation(async ({ ctx }) => resumeForge(ctx.user.id)),

  reset: authedQuery.mutation(async ({ ctx }) => resetForgeProgress(ctx.user.id)),

  checkInMaintenance: authedQuery.mutation(async ({ ctx }) => {
    try {
      return await checkInMaintenance(ctx.user.id);
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: err instanceof Error ? err.message : "Couldn't check in.",
      });
    }
  }),

  saveMonthlyLog: authedQuery
    .input(z.object({ logText: z.string().min(1).max(4000) }))
    .mutation(async ({ ctx, input }) => {
      const row = await saveMonthlyLog(ctx.user.id, input.logText);
      const recent = await getRecentMonthlyLogs(ctx.user.id);
      return { saved: row, recent };
    }),

  getMonthlyLogs: authedQuery.query(async ({ ctx }) => getRecentMonthlyLogs(ctx.user.id)),

  getStats: publicQuery.query(async () => getAnonymousStats()),
});
