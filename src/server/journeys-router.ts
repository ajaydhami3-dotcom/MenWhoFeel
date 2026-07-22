import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { findUserByUnionId, upsertUser } from "./queries/users";
import {
  completeJourneyDay,
  getJourneyBySlug,
  getJourneyDays,
  getOrCreateJourneyProgress,
  getUserJourneyResponses,
  pauseJourney,
  resetJourneyProgress,
  resumeJourney,
  skipJourneyDay,
} from "./queries/journeys";
import { isDayUnlocked } from "@/lib/forge-logic";

// Mirrors forge-router.ts's core mutations, parameterized by journeySlug
// instead of always meaning The Forge. Deliberately doesn't port
// checkInMaintenance / saveMonthlyLog / getMonthlyLogs / getStats — none
// of these three journeys has a post-completion continuation designed
// yet, so there's nothing there to generalize (see queries/journeys.ts).

async function resolveJourney(journeySlug: string) {
  const journey = await getJourneyBySlug(journeySlug);
  if (!journey) {
    throw new TRPCError({ code: "NOT_FOUND", message: "That journey doesn't exist." });
  }
  if (journey.externalHref) {
    // The Forge's registry row — callers should never reach here since
    // the UI links straight to externalHref instead of this router, but
    // fail loudly rather than silently operating on a journey with no
    // journey_days/journey_progress of its own.
    throw new TRPCError({ code: "BAD_REQUEST", message: "This journey is hosted elsewhere." });
  }
  return journey;
}

export const journeysRouter = createRouter({
  /** Called once on mount, same pattern as forge.init — a brand-new
   * anonymous session has a valid token but no `users` row yet. */
  init: publicQuery
    .input(z.object({ journeySlug: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.supabaseUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No anonymous session yet — try refreshing the page.",
        });
      }

      const journey = await resolveJourney(input.journeySlug);

      await upsertUser({ unionId: ctx.supabaseUserId });
      const user = await findUserByUnionId(ctx.supabaseUserId);
      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Couldn't set up your session." });
      }

      const [days, progress, responses] = await Promise.all([
        getJourneyDays(journey.id),
        getOrCreateJourneyProgress(user.id, journey.id),
        getUserJourneyResponses(user.id, journey.id),
      ]);

      return { journey, days, progress, responses };
    }),

  completeDay: authedQuery
    .input(
      z.object({
        journeySlug: z.string(),
        dayNumber: z.number().int().min(1),
        responseText: z.string().max(4000).optional(),
        moodRating: z.number().int().min(1).max(5).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const journey = await resolveJourney(input.journeySlug);
      const days = await getJourneyDays(journey.id);
      const day = days.find((d) => d.dayNumber === input.dayNumber);
      if (!day) throw new TRPCError({ code: "NOT_FOUND", message: "That day doesn't exist." });

      const progress = await getOrCreateJourneyProgress(ctx.user.id, journey.id);
      if (!isDayUnlocked(input.dayNumber, progress)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "That day isn't unlocked yet." });
      }

      const { progress: updated } = await completeJourneyDay({
        userId: ctx.user.id,
        journeyId: journey.id,
        dayNumber: input.dayNumber,
        dayTitle: day.title,
        responseText: input.responseText,
        moodRating: input.moodRating,
        totalDays: days.length,
      });

      return updated;
    }),

  skipDay: authedQuery
    .input(z.object({ journeySlug: z.string(), dayNumber: z.number().int().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const journey = await resolveJourney(input.journeySlug);
      const days = await getJourneyDays(journey.id);
      if (!days.some((d) => d.dayNumber === input.dayNumber)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "That day doesn't exist." });
      }

      const progress = await getOrCreateJourneyProgress(ctx.user.id, journey.id);
      if (!isDayUnlocked(input.dayNumber, progress)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "That day isn't unlocked yet." });
      }

      return skipJourneyDay({
        userId: ctx.user.id,
        journeyId: journey.id,
        dayNumber: input.dayNumber,
        totalDays: days.length,
      });
    }),

  pause: authedQuery
    .input(z.object({ journeySlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const journey = await resolveJourney(input.journeySlug);
      return pauseJourney(ctx.user.id, journey.id);
    }),

  resume: authedQuery
    .input(z.object({ journeySlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const journey = await resolveJourney(input.journeySlug);
      return resumeJourney(ctx.user.id, journey.id);
    }),

  reset: authedQuery
    .input(z.object({ journeySlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const journey = await resolveJourney(input.journeySlug);
      return resetJourneyProgress(ctx.user.id, journey.id);
    }),
});
