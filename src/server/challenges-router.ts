import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { challenges, userChallenges } from "../db/schema";
import { and, eq } from "drizzle-orm";

export const challengesRouter = createRouter({
  // 1. Read: Get active challenges, optionally filtered to one category
  // (The Forge's own daily content now comes from the `forge` router
  // instead — this stays focused on weekly/monthly).
  getChallenges: publicQuery
    .input(z.object({ category: z.enum(["daily", "weekly", "monthly"]).optional() }).optional())
    .query(async ({ input }) => {
      const conditions = [eq(challenges.active, true)];
      if (input?.category) conditions.push(eq(challenges.category, input.category));
      return await getDb()
        .select()
        .from(challenges)
        .where(and(...conditions));
    }),

  // 2. Read: this person's own completed challenges. Used to share one
  // hardcoded "guest_warrior_1" identifier across every visitor — now
  // scoped to the real per-person id the Forge's anonymous-auth system
  // resolves in context.ts, the same as everywhere else in this app.
  getUserProgress: authedQuery.query(async ({ ctx }) => {
    return await getDb()
      .select()
      .from(userChallenges)
      .where(eq(userChallenges.userIdentifier, ctx.user.id.toString()));
  }),

  // 3. Write: Save a victory to the database
  completeChallenge: authedQuery
    .input(z.object({ challengeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await getDb().insert(userChallenges).values({
        challengeId: input.challengeId,
        userIdentifier: ctx.user.id.toString(),
        completed: true,
        completedAt: new Date(),
      });
    }),
});