import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  communityPosts,
  communityComments,
  communityReports,
  pillars,
} from "../db/schema";
import { eq, desc, asc, sql, and, ilike, or } from "drizzle-orm";
import { checkContentSafety, isFlagged } from "@/lib/safety";

const POST_CATEGORIES = [
  "mental_health",
  "anxiety",
  "depression",
  "relationships",
  "career",
  "loneliness",
  "self_improvement",
  "venting",
  "advice_needed",
  "success_stories",
  "need_support_now",
] as const;

// Phase 6: derives communityPosts.pillarId from the (still required,
// unchanged) category field at creation time, so new posts populate the
// new column automatically without the creation form having to ask a
// second question. Same mapping as the one-time backfill in
// supabase_migration_community_pillars.sql — if you edit one, edit both.
// self_improvement and the four tone-only categories map to null on
// purpose: none of them is a single pillar, same reasoning as
// categories.pillarId leaving self-improvement null in Phase 0.
const COMMUNITY_CATEGORY_TO_PILLAR_SLUG: Record<string, string | null> = {
  mental_health: "mental-emotional-health",
  anxiety: "mental-emotional-health",
  depression: "mental-emotional-health",
  relationships: "relationships-stress",
  loneliness: "relationships-stress",
  career: "work-financial-stability",
  self_improvement: null,
  venting: null,
  advice_needed: null,
  success_stories: null,
  need_support_now: null,
};

async function derivePillarId(category: string): Promise<number | null> {
  const slug = COMMUNITY_CATEGORY_TO_PILLAR_SLUG[category];
  if (!slug) return null;
  try {
    const db = getDb();
    const [row] = await db.select({ id: pillars.id }).from(pillars).where(eq(pillars.slug, slug)).limit(1);
    return row?.id ?? null;
  } catch (err) {
    // Don't fail post creation over a taxonomy lookup — pillarId staying
    // null just means this post behaves like it did before Phase 6.
    console.error(`[community-router] derivePillarId(${category}) failed:`, err);
    return null;
  }
}

export const communityRouter = createRouter({
  // ─── POSTS ──────────────────────────────────────────────────────────────────

  listPosts: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        sort: z.enum(["recent", "trending"]).default("recent"),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const { category, sort, search, limit = 20, offset = 0 } = input ?? {};

      const conditions = [eq(communityPosts.deleted, false)];

      if (category && category !== "all") {
        conditions.push(eq(communityPosts.category, category as any));
      }

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        conditions.push(
          or(
            ilike(communityPosts.title, term),
            ilike(communityPosts.content, term)
          ) as any
        );
      }

      const orderBy =
        sort === "trending"
          ? desc(communityPosts.upvoteCount)
          : desc(communityPosts.createdAt);

      const posts = await db
        .select()
        .from(communityPosts)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      // Attach comment counts
      const postsWithCounts = await Promise.all(
        posts.map(async (post) => {
          const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(communityComments)
            .where(
              and(
                eq(communityComments.postId, post.id),
                eq(communityComments.deleted, false)
              )
            );
          return { ...post, commentCount: Number(count) };
        })
      );

      return postsWithCounts;
    }),

  getPost: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      // Increment view count
      await db
        .update(communityPosts)
        .set({ viewCount: sql`${communityPosts.viewCount} + 1` })
        .where(eq(communityPosts.id, input.id));

      const [post] = await db
        .select()
        .from(communityPosts)
        .where(and(eq(communityPosts.id, input.id), eq(communityPosts.deleted, false)))
        .limit(1);

      if (!post) return null;

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(communityComments)
        .where(
          and(
            eq(communityComments.postId, post.id),
            eq(communityComments.deleted, false)
          )
        );

      return { ...post, commentCount: Number(count) };
    }),

  createPost: publicQuery
    .input(
      z.object({
        title: z.string().min(5, "Title too short").max(300, "Title too long"),
        content: z.string().min(10, "Content too short").max(5000, "Content too long"),
        category: z.enum(POST_CATEGORIES),
        anonymousId: z.string().max(50),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const flags = checkContentSafety(`${input.title} ${input.content}`);
      const flagged = isFlagged(flags);
      const pillarId = await derivePillarId(input.category);

      const [post] = await db
        .insert(communityPosts)
        .values({
          title: input.title,
          content: input.content,
          category: input.category,
          anonymousId: input.anonymousId,
          flagged,
          flagReasons: flags.length ? flags.map((f) => f.type).join(",") : null,
          pillarId,
        })
        .returning();

      return post;
    }),

  upvotePost: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(communityPosts)
        .set({ upvoteCount: sql`${communityPosts.upvoteCount} + 1` })
        .where(eq(communityPosts.id, input.id));
      return { success: true };
    }),

  reportPost: publicQuery
    .input(z.object({ id: z.number(), reason: z.string().min(1).max(500) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(communityPosts)
        .set({ reportCount: sql`${communityPosts.reportCount} + 1` })
        .where(eq(communityPosts.id, input.id));

      await db.insert(communityReports).values({
        targetType: "post",
        targetId: input.id,
        reason: input.reason,
      });
      return { success: true };
    }),

  // ─── COMMENTS ───────────────────────────────────────────────────────────────

  listComments: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(communityComments)
        .where(
          and(
            eq(communityComments.postId, input.postId),
            eq(communityComments.deleted, false)
          )
        )
        .orderBy(asc(communityComments.createdAt));
    }),

  createComment: publicQuery
    .input(
      z.object({
        postId: z.number(),
        parentCommentId: z.number().optional(),
        content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment too long"),
        anonymousId: z.string().max(50),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const flags = checkContentSafety(input.content);
      const flagged = isFlagged(flags);

      const [comment] = await db
        .insert(communityComments)
        .values({
          postId: input.postId,
          parentCommentId: input.parentCommentId ?? null,
          content: input.content,
          anonymousId: input.anonymousId,
          flagged,
          flagReasons: flags.length ? flags.map((f) => f.type).join(",") : null,
        })
        .returning();

      return comment;
    }),

  reportComment: publicQuery
    .input(z.object({ id: z.number(), reason: z.string().min(1).max(500) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(communityComments)
        .set({ reportCount: sql`${communityComments.reportCount} + 1` })
        .where(eq(communityComments.id, input.id));

      await db.insert(communityReports).values({
        targetType: "comment",
        targetId: input.id,
        reason: input.reason,
      });
      return { success: true };
    }),

  // ─── ADMIN ──────────────────────────────────────────────────────────────────

  adminDeletePost: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(communityPosts)
        .set({ deleted: true })
        .where(eq(communityPosts.id, input.id));
      return { success: true };
    }),

  adminDeleteComment: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(communityComments)
        .set({ deleted: true })
        .where(eq(communityComments.id, input.id));
      return { success: true };
    }),

  adminListFlagged: adminQuery.query(async () => {
    const db = getDb();
    const [posts, comments] = await Promise.all([
      db
        .select()
        .from(communityPosts)
        .where(and(eq(communityPosts.flagged, true), eq(communityPosts.deleted, false)))
        .orderBy(desc(communityPosts.createdAt))
        .limit(50),
      db
        .select()
        .from(communityComments)
        .where(and(eq(communityComments.flagged, true), eq(communityComments.deleted, false)))
        .orderBy(desc(communityComments.createdAt))
        .limit(50),
    ]);
    return { posts, comments };
  }),
});
