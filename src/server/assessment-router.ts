import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection"; // <-- Swapped to getDb
import { assessmentQuestions, assessmentResults, assessmentActionPlans } from "../db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const assessmentRouter = createRouter({
  // ==========================================
  // PHASE 1: THE DIAGNOSTIC (TAKING THE TEST)
  // ==========================================
  
  // 1. Fetch random active questions for the MCQ
  getQuestions: publicQuery.query(async () => {
    // <-- Added getDb() here
    return await getDb().select()
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.active, true))
      .orderBy(sql`RANDOM()`) 
      .limit(5); 
  }),

  // 2. Save the user's final generalized archetype
  submitResult: publicQuery
    .input(z.object({
      userIdentifier: z.string(),
      resultCategory: z.string(),
    }))
    .mutation(async ({ input }) => {
      // <-- Added getDb() here
      return await getDb().insert(assessmentResults).values({
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
      // <-- Added getDb() here
      const result = await getDb().select()
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
      // <-- Added getDb() here
      const result = await getDb().select()
        .from(assessmentActionPlans)
        .where(eq(assessmentActionPlans.category, input.category))
        .limit(1);
        
      return result[0] || null;
    }),
});