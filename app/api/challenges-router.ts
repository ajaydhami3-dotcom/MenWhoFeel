import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findActiveChallenges,
  findChallengeById,
  findUserProgress,
  completeChallenge,
  getTodayProgress,
  getWeeklyProgress,
  getChallengeStats,
} from "./queries/challenges";

export const challengesRouter = createRouter({
  list: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(({ input }: any) => findActiveChallenges(input?.category)),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }: any) => findChallengeById(input.id)),

  progress: publicQuery
    .input(z.object({ userIdentifier: z.string() }))
    .query(({ input }: any) =>findUserProgress(input.userIdentifier)),

  complete: publicQuery
    .input(
      z.object({
        challengeId: z.number(),
        userIdentifier: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }: any) =>
      completeChallenge({
        challengeId: input.challengeId,
        userIdentifier: input.userIdentifier,
        notes: input.notes,
      })
    ),

  todayProgress: publicQuery
    .input(z.object({ userIdentifier: z.string() }))
    .query(({ input }: any) => getTodayProgress(input.userIdentifier)),

  weeklyProgress: publicQuery
    .input(z.object({ userIdentifier: z.string() }))
    .query(({ input }: any) =>getWeeklyProgress(input.userIdentifier)),

  stats: publicQuery.query(() => getChallengeStats()),
});
