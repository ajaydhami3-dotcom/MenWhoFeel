import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { db } from "../db"; 
import { helplines } from "../db/schema";
import { eq } from "drizzle-orm";

export const helplinesRouter = createRouter({
  // 1. Get all helplines globally
  list: publicQuery.query(async () => {
    return await db.select().from(helplines);
  }),

  // 2. Get helplines for a specific country
  byCountry: publicQuery
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
      return await db.select()
        .from(helplines)
        .where(eq(helplines.countryCode, input.countryCode));
    }),
});