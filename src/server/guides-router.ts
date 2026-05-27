import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { resources } from "../db/schema";
import { eq, and, ilike, sql } from "drizzle-orm";

export const guidesRouter = createRouter({
  // Lightweight summary — just counts per category+type, no full payloads.
  // Used to render the folder cards on initial page load.
  getCategorySummaries: publicQuery.query(async () => {
    const rows = await getDb()
      .select({
        category: resources.category,
        type: resources.type,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(resources)
      .groupBy(resources.category, resources.type);

    const map: Record<string, { category: string; total: number; byType: Record<string, number> }> = {};
    for (const row of rows) {
      if (!map[row.category]) {
        map[row.category] = { category: row.category, total: 0, byType: {} };
      }
      map[row.category].total += row.count;
      map[row.category].byType[row.type] = row.count;
    }
    return Object.values(map);
  }),

  // Paginated, filtered resources for one category.
  // Called when a user opens a category folder or switches type tabs.
  getResourcesByCategory: publicQuery
    .input(
      z.object({
        category: z.string(),
        type: z.enum(["all", "video", "pdf", "book", "link"]).default("all"),
        limit: z.number().min(1).max(50).default(12),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      const baseCondition = eq(resources.category, input.category);
      const where =
        input.type === "all"
          ? baseCondition
          : and(baseCondition, eq(resources.type, input.type as "video" | "pdf" | "book" | "link"));

      const [items, countResult] = await Promise.all([
        db.select().from(resources).where(where).limit(input.limit).offset(input.offset),
        db.select({ count: sql<number>`cast(count(*) as int)` }).from(resources).where(where),
      ]);

      const total = countResult[0]?.count ?? 0;
      return {
        items,
        total,
        hasMore: input.offset + items.length < total,
      };
    }),

  // Server-side search across all categories — max 20 results.
  searchResources: publicQuery
    .input(z.object({ term: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(resources)
        .where(ilike(resources.name, `%${input.term}%`))
        .limit(20);
    }),

  // Kept for backwards compatibility — used by seed data fallback in the UI
  getAllResources: publicQuery.query(async () => {
    return getDb().select().from(resources);
  }),
});
