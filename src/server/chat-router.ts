import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { db } from "../db"; 
import { chatMessages } from "../db/schema";
import { eq, desc, gt, and } from "drizzle-orm";

export const chatRouter = createRouter({
  // 1. Get approved messages for the live chat feed (WITH 24H BURN)
  list: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      // The 24-Hour Burn Timer
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      return await db.select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.status, "approved"),
            gt(chatMessages.createdAt, twentyFourHoursAgo) // Only show messages newer than 24h
          )
        )
        .orderBy(desc(chatMessages.createdAt)) // Sorts newest first!
        .limit(input?.limit || 100);
    }),

  // 2. Get recent messages (WITH 24H BURN)
  recent: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      return await db.select()
        .from(chatMessages)
        .where(gt(chatMessages.createdAt, twentyFourHoursAgo)) // Burn logic applied here too
        .orderBy(desc(chatMessages.createdAt))
        .limit(input?.limit || 50);
    }),

  // 3. Post a new message
  create: publicQuery
    .input(
      z.object({
        authorName: z.string().max(255).optional(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input }) => {
      return await db.insert(chatMessages).values({
        authorName: input.authorName || "Anonymous",
        content: input.content,
        // Note: Your schema automatically sets status to "approved" by default!
      }).returning();
    }),

  // 4. Admin: View all messages waiting for moderation
  pending: adminQuery.query(async () => {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.status, "pending"))
      .orderBy(desc(chatMessages.createdAt));
  }),

  // 5. Admin: Approve or Reject a message
  moderate: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected"]) }))
    .mutation(async ({ input }) => {
      return await db.update(chatMessages)
        .set({ status: input.status })
        .where(eq(chatMessages.id, input.id))
        .returning();
    }),
});