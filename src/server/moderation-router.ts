import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  communityReports,
  communityPosts,
  communityComments,
  communicationMessages,
  communicationReplies,
} from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const moderationRouter = createRouter({
  // List all open (unresolved) reports
  listReports: adminQuery
    .input(
      z
        .object({
          resolved: z.boolean().default(false),
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { resolved = false, limit = 50, offset = 0 } = input ?? {};

      return db
        .select()
        .from(communityReports)
        .where(eq(communityReports.resolved, resolved))
        .orderBy(desc(communityReports.createdAt))
        .limit(limit)
        .offset(offset);
    }),

  // Mark a report as resolved
  resolveReport: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(communityReports)
        .set({ resolved: true })
        .where(eq(communityReports.id, input.id));
      return { success: true };
    }),

  // Summary stats for the moderation dashboard
  stats: adminQuery.query(async () => {
    const db = getDb();

    const [
      [{ openReports }],
      [{ flaggedPosts }],
      [{ flaggedComments }],
      [{ flaggedMessages }],
    ] = await Promise.all([
      db
        .select({ openReports: sql<number>`count(*)` })
        .from(communityReports)
        .where(eq(communityReports.resolved, false)),
      db
        .select({ flaggedPosts: sql<number>`count(*)` })
        .from(communityPosts)
        .where(and(eq(communityPosts.flagged, true), eq(communityPosts.deleted, false))),
      db
        .select({ flaggedComments: sql<number>`count(*)` })
        .from(communityComments)
        .where(
          and(eq(communityComments.flagged, true), eq(communityComments.deleted, false))
        ),
      db
        .select({ flaggedMessages: sql<number>`count(*)` })
        .from(communicationMessages)
        .where(
          and(
            eq(communicationMessages.flagged, true),
            eq(communicationMessages.status, "active")
          )
        ),
    ]);

    return {
      openReports: Number(openReports),
      flaggedPosts: Number(flaggedPosts),
      flaggedComments: Number(flaggedComments),
      flaggedMessages: Number(flaggedMessages),
    };
  }),

  // Bulk delete content by type and id
  deleteContent: adminQuery
    .input(
      z.object({
        type: z.enum(["post", "comment", "communication_message", "communication_reply"]),
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      switch (input.type) {
        case "post":
          await db
            .update(communityPosts)
            .set({ deleted: true })
            .where(eq(communityPosts.id, input.id));
          break;
        case "comment":
          await db
            .update(communityComments)
            .set({ deleted: true })
            .where(eq(communityComments.id, input.id));
          break;
        case "communication_message":
          await db
            .update(communicationMessages)
            .set({ status: "deleted" })
            .where(eq(communicationMessages.id, input.id));
          break;
        case "communication_reply":
          await db
            .delete(communicationReplies)
            .where(eq(communicationReplies.id, input.id));
          break;
      }

      return { success: true };
    }),
});
