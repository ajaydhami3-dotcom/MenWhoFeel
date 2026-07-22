import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { stories, storyComments } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const storiesRouter = createRouter({
  // 1. READ: Fetch only 'approved' stories to show on the board
  getApprovedStories: publicQuery.query(async () => {
    // <-- Added getDb() here
    return await getDb()
      .select()
      .from(stories)
      .where(eq(stories.status, "approved"))
      .orderBy(desc(stories.createdAt)); // Newest first
  }),

  // 2. WRITE: Users submit a story (Defaults to 'pending' for your approval)
  // pillarId is optional and self-selected by the submitter (see
  // StoriesClient.tsx's write tab) — added in Phase 4 so new stories
  // don't just add to the untagged backlog the way every existing story
  // does. topicId isn't collected here; that's finer-grained than a
  // submission form should ask an anonymous submitter to get right, left
  // for editorial review instead.
  submitStory: publicQuery
    .input(z.object({
      title: z.string().min(3, "Title is too short"),
      content: z.string().min(20, "Story needs more detail"),
      authorName: z.string().optional(),
      pillarId: z.number().int().positive().optional(),
    }))
    .mutation(async ({ input }) => {
      return await getDb().insert(stories).values({
        title: input.title,
        content: input.content,
        authorName: input.authorName || "Anonymous",
        excerpt: input.content.substring(0, 240) + "...",
        status: "pending",
        pillarId: input.pillarId ?? null,
      });
    }),

  // 3. Fetch comments for a story
  getComments: publicQuery
    .input(z.object({ storyId: z.number() }))
    .query(async ({ input }) => {
      return await getDb()
        .select()
        .from(storyComments)
        .where(eq(storyComments.storyId, input.storyId))
        .orderBy(desc(storyComments.createdAt));
    }),

  // 4. Post a comment on a story
  addComment: publicQuery
    .input(z.object({
      storyId: z.number(),
      authorName: z.string().optional(),
      content: z.string().min(1, "Comment cannot be empty"),
    }))
    .mutation(async ({ input }) => {
      return await getDb().insert(storyComments).values({
        storyId: input.storyId,
        authorName: input.authorName || "Anonymous",
        content: input.content,
        status: "pending",
      });
    }),
});