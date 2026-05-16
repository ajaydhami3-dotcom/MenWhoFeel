import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection"; // <-- Swapped to getDb
import { challenges, userChallenges } from "../db/schema";
import { eq } from "drizzle-orm";

export const challengesRouter = createRouter({
  // 1. Read: Get all active challenges
  getChallenges: publicQuery.query(async () => {
    // <-- Added getDb() here
    return await getDb().select().from(challenges).where(eq(challenges.active, true));
  }),

  // 2. Read: Get only the challenges THIS specific user has completed
  getUserProgress: publicQuery
    .input(z.object({ userIdentifier: z.string() }))
    .query(async ({ input }) => {
      // <-- Added getDb() here
      return await getDb()
        .select()
        .from(userChallenges)
        .where(eq(userChallenges.userIdentifier, input.userIdentifier));
    }),

  // 3. Write: Save a victory to the database
  completeChallenge: publicQuery
    .input(z.object({ challengeId: z.number(), userIdentifier: z.string() }))
    .mutation(async ({ input }) => {
      // <-- Added getDb() here
      return await getDb().insert(userChallenges).values({
        challengeId: input.challengeId,
        userIdentifier: input.userIdentifier,
        completed: true,
        completedAt: new Date(),
      });
    }),
});