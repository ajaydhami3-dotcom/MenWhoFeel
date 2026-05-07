import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findApprovedStories,
  findFeaturedStories,
  findStoryById,
  findStoryComments,
  createStory,
  createStoryComment,
  findPendingStories,
  findPendingComments,
  moderateStory,
  moderateComment,
} from "./queries/stories";

export const storiesRouter = createRouter({
  list: publicQuery.query(() => findApprovedStories()),

  featured: publicQuery.query(() => findFeaturedStories()),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }: any) => findStoryById(input.id)),

  comments: publicQuery
    .input(z.object({ storyId: z.number() }))
    .query(({ input }: any) => findStoryComments(input.storyId)),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        authorName: z.string().max(255).optional(),
        excerpt: z.string().max(500).optional(),
      })
    )
    .mutation(({ input }: any) =>
      createStory({
        title: input.title,
        content: input.content,
        authorName: input.authorName || "Anonymous",
        excerpt: input.excerpt,
      })
    ),

  addComment: publicQuery
    .input(
      z.object({
        storyId: z.number(),
        authorName: z.string().max(255).optional(),
        content: z.string().min(1),
      })
    )
    .mutation(({ input }: any) =>
      createStoryComment({
        storyId: input.storyId,
        authorName: input.authorName || "Anonymous",
        content: input.content,
      })
    ),

  // Admin moderation endpoints
  pendingStories: adminQuery.query(() => findPendingStories()),
  pendingComments: adminQuery.query(() => findPendingComments()),
  moderateStory: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected"]) }))
    .mutation(({ input }: any) =>moderateStory(input.id, input.status)),
  moderateComment: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected"]) }))
    .mutation(({ input }: any) =>moderateComment(input.id, input.status)),
});
