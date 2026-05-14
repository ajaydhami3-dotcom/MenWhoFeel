import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { db } from "../db"; 
import { articles, articleComments } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const intelRouter = createRouter({
  // 1. Fetch the main library
  getLibrary: publicQuery.query(async () => {
    return await db.select()
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.createdAt));
  }),

  // 2. Fetch a specific article by its URL slug
  getArticle: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await db.select()
        .from(articles)
        .where(eq(articles.slug, input.slug))
        .limit(1);
      return result[0] || null;
    }),

  // 3. Fetch comments for a specific article
  getComments: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await db.select()
        .from(articleComments)
        .where(eq(articleComments.articleSlug, input.slug))
        .orderBy(desc(articleComments.createdAt)); // Newest first
    }),

  // 4. Post an instant comment
  addComment: publicQuery
    .input(z.object({
      slug: z.string(),
      authorName: z.string().optional(),
      content: z.string().min(1, "Comment cannot be empty"),
    }))
    .mutation(async ({ input }) => {
      return await db.insert(articleComments).values({
        articleSlug: input.slug,
        authorName: input.authorName || "Anonymous",
        content: input.content,
      });
    }),
});