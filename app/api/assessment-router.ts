import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  createAssessment,
  findUserAssessments,
  findAssessmentById,
} from "./queries/assessments";

export const assessmentRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        userIdentifier: z.string(),
        answers: z.string(),
        score: z.number().min(0).max(100),
        category: z.string(),
        recommendations: z.string(),
      })
    )
    .mutation(({ input }: any) =>
      createAssessment({
        userIdentifier: input.userIdentifier,
        answers: input.answers,
        score: input.score,
        category: input.category,
        recommendations: input.recommendations,
      })
    ),

  list: publicQuery
    .input(z.object({ userIdentifier: z.string() }))
    .query(({ input }) => findUserAssessments(input.userIdentifier)),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findAssessmentById(input.id)),
});
