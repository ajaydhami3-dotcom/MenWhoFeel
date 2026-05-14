import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { db } from "../db"; 
import { stories } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const storiesRouter = createRouter({
  // 1. READ: Fetch only 'approved' stories to show on the board
  getApprovedStories: publicQuery.query(async () => {
    return await db
      .select()
      .from(stories)
      .where(eq(stories.status, "approved"))
      .orderBy(desc(stories.createdAt)); // Newest first
  }),

  // 2. WRITE: Users submit a story (Defaults to 'pending' for your approval)
  submitStory: publicQuery
    .input(z.object({
      title: z.string().min(3, "Title is too short"),
      content: z.string().min(20, "Story needs more detail"),
      authorName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.insert(stories).values({
        title: input.title,
        content: input.content,
        authorName: input.authorName || "Anonymous",
        excerpt: input.content.substring(0, 120) + "...", // Auto-generate an excerpt
        status: "pending", // Goes to your admin queue!
      });
    }),
});