import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findApprovedMessages,
  findRecentMessages,
  createMessage,
  findPendingMessages,
  moderateMessage,
} from "./queries/chat";

export const chatRouter = createRouter({
  list: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }: any) => findApprovedMessages(input?.limit || 100)),

  recent: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }: any) => findRecentMessages(input?.limit || 50)),

  create: publicQuery
    .input(
      z.object({
        authorName: z.string().max(255).optional(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(({ input }: any) =>
      createMessage({
        authorName: input.authorName || "Anonymous",
        content: input.content,
      })
    ),

  // Admin moderation
  pending: adminQuery.query(() => findPendingMessages()),
  moderate: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected"]) }))
    .mutation(({ input }: any) => moderateMessage(input.id, input.status)),
});
