import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  communicationMessages,
  communicationReplies,
  communityReports,
} from "../db/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";
import { checkContentSafety, isFlagged } from "@/lib/safety";

export const communicationRouter = createRouter({
  // ─── MESSAGES ───────────────────────────────────────────────────────────────

  listMessages: publicQuery
    .input(
      z
        .object({
          limit: z.number().default(30),
          offset: z.number().default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { limit = 30, offset = 0 } = input ?? {};

      const messages = await db
        .select()
        .from(communicationMessages)
        .where(eq(communicationMessages.status, "active"))
        .orderBy(desc(communicationMessages.createdAt))
        .limit(limit)
        .offset(offset);

      // Attach reply counts
      const messagesWithCounts = await Promise.all(
        messages.map(async (msg) => {
          const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(communicationReplies)
            .where(eq(communicationReplies.messageId, msg.id));
          return { ...msg, replyCount: Number(count) };
        })
      );

      return messagesWithCounts;
    }),

  createMessage: publicQuery
    .input(
      z.object({
        content: z
          .string()
          .min(5, "Message too short")
          .max(2000, "Message too long"),
        anonymousId: z.string().max(50),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const flags = checkContentSafety(input.content);
      const flagged = isFlagged(flags);

      const [message] = await db
        .insert(communicationMessages)
        .values({
          content: input.content,
          anonymousId: input.anonymousId,
          flagged,
          flagReasons: flags.length ? flags.map((f) => f.type).join(",") : null,
        })
        .returning();

      return message;
    }),

  reportMessage: publicQuery
    .input(
      z.object({ id: z.number(), reason: z.string().min(1).max(500) })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(communicationMessages)
        .set({
          reportCount: sql`${communicationMessages.reportCount} + 1`,
        })
        .where(eq(communicationMessages.id, input.id));

      await db.insert(communityReports).values({
        targetType: "communication_message",
        targetId: input.id,
        reason: input.reason,
      });
      return { success: true };
    }),

  // ─── REPLIES ────────────────────────────────────────────────────────────────

  listReplies: publicQuery
    .input(z.object({ messageId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(communicationReplies)
        .where(eq(communicationReplies.messageId, input.messageId))
        .orderBy(asc(communicationReplies.createdAt));
    }),

  createReply: publicQuery
    .input(
      z.object({
        messageId: z.number(),
        content: z
          .string()
          .min(1, "Reply cannot be empty")
          .max(1000, "Reply too long"),
        anonymousId: z.string().max(50),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const flags = checkContentSafety(input.content);
      const flagged = isFlagged(flags);

      const [reply] = await db
        .insert(communicationReplies)
        .values({
          messageId: input.messageId,
          content: input.content,
          anonymousId: input.anonymousId,
          flagged,
          flagReasons: flags.length ? flags.map((f) => f.type).join(",") : null,
        })
        .returning();

      return reply;
    }),

  reportReply: publicQuery
    .input(
      z.object({ id: z.number(), reason: z.string().min(1).max(500) })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(communicationReplies)
        .set({
          reportCount: sql`${communicationReplies.reportCount} + 1`,
        })
        .where(eq(communicationReplies.id, input.id));

      await db.insert(communityReports).values({
        targetType: "communication_reply",
        targetId: input.id,
        reason: input.reason,
      });
      return { success: true };
    }),

  // ─── ADMIN ──────────────────────────────────────────────────────────────────

  adminDeleteMessage: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(communicationMessages)
        .set({ status: "deleted" })
        .where(eq(communicationMessages.id, input.id));
      return { success: true };
    }),

  adminDeleteReply: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(communicationReplies)
        .where(eq(communicationReplies.id, input.id));
      return { success: true };
    }),

  adminListFlagged: adminQuery.query(async () => {
    const db = getDb();
    const [messages, replies] = await Promise.all([
      db
        .select()
        .from(communicationMessages)
        .where(
          and(
            eq(communicationMessages.flagged, true),
            eq(communicationMessages.status, "active")
          )
        )
        .orderBy(desc(communicationMessages.createdAt))
        .limit(50),
      db
        .select()
        .from(communicationReplies)
        .where(eq(communicationReplies.flagged, true))
        .orderBy(desc(communicationReplies.createdAt))
        .limit(50),
    ]);
    return { messages, replies };
  }),
});
