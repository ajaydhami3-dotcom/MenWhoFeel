import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { db } from "../db"; 
import { assessmentQuestions, assessmentResults, assessmentActionPlans } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const assessmentRouter = createRouter({
  // ==========================================
  // PHASE 1: THE DIAGNOSTIC (TAKING THE TEST)
  // ==========================================
  
  // 1. Fetch random active questions for the MCQ
  getQuestions: publicQuery.query(async () => {
    return await db.select()
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.active, true))
      .orderBy(sql`RANDOM()`) // Randomizes the questions so the quiz stays fresh
      .limit(5); // Change this number if you want more/less questions per quiz
  }),

  // 2. Save the user's final generalized archetype
  submitResult: publicQuery
    .input(z.object({
      userIdentifier: z.string(),
      resultCategory: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await db.insert(assessmentResults).values({
        userIdentifier: input.userIdentifier,
        resultCategory: input.resultCategory,
      });
    }),

  // ==========================================
  // PHASE 2: THE PRESCRIPTION (GETTING THE CURE)
  // ==========================================

  // 3. Get the user's most recent test result
  getLatestResult: publicQuery
    .input(z.object({ userIdentifier: z.string() }))
    .query(async ({ input }) => {
      const result = await db.select()
        .from(assessmentResults)
        .where(eq(assessmentResults.userIdentifier, input.userIdentifier))
        .orderBy(desc(assessmentResults.createdAt))
        .limit(1);
      
      return result[0] || null;
    }),

  // 4. Fetch the corresponding "Action Plan" from the database
  getActionPlan: publicQuery
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const result = await db.select()
        .from(assessmentActionPlans)
        .where(eq(assessmentActionPlans.category, input.category))
        .limit(1);
        
      return result[0] || null;
    }),
});