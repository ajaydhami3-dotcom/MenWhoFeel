import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { contactMessages } from "../db/schema";

export const contactRouter = createRouter({
  // Users submit the "Contact Us" form — this is what was missing before:
  // the form previously only updated local UI state and never reached a database.
  submitMessage: publicQuery
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(255),
        email: z.string().email("Enter a valid email address").max(320),
        message: z.string().min(5, "Message is too short").max(5000),
      })
    )
    .mutation(async ({ input }) => {
      return await getDb().insert(contactMessages).values({
        name: input.name,
        email: input.email,
        message: input.message,
        status: "new",
      });
    }),
});
