import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection"; // <-- Swapped to getDb
import { helplines } from "../db/schema";
import { eq } from "drizzle-orm";

export const helplinesRouter = createRouter({
  // 1. Get all helplines globally
  list: publicQuery.query(async () => {
    // <-- Added getDb() here
    return await getDb().select().from(helplines); 
  }),

  // 2. Get helplines for a specific country
  byCountry: publicQuery
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
      // <-- Added getDb() here
      return await getDb().select() 
        .from(helplines)
        .where(eq(helplines.countryCode, input.countryCode));
    }),
});