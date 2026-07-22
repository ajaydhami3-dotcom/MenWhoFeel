import { db } from "@/db";
import { pillars, categories, resources, selfHelpGuides } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Mirrors getCategoriesWithCounts in ../intel/queries.ts. Pillars are a
// fixed set of 4 (see MIGRATION_PLAN.md 4.5/4.9 — "these are NOT
// categories... the core architecture"), so this is a single grouped
// query per related table rather than N+1, same fix already applied to
// the public category/topic pages.
export async function getPillarsWithCounts() {
  const [pillarRows, categoryCounts, resourceCounts, guideCounts] = await Promise.all([
    db.select().from(pillars).orderBy(pillars.sortOrder),
    db
      .select({ pillarId: categories.pillarId, count: sql<number>`cast(count(*) as int)` })
      .from(categories)
      .where(sql`${categories.pillarId} IS NOT NULL`)
      .groupBy(categories.pillarId),
    db
      .select({ pillarId: resources.pillarId, count: sql<number>`cast(count(*) as int)` })
      .from(resources)
      .where(sql`${resources.pillarId} IS NOT NULL`)
      .groupBy(resources.pillarId),
    db
      .select({ pillarId: selfHelpGuides.pillarId, count: sql<number>`cast(count(*) as int)` })
      .from(selfHelpGuides)
      .where(sql`${selfHelpGuides.pillarId} IS NOT NULL`)
      .groupBy(selfHelpGuides.pillarId),
  ]);

  const categoryMap = new Map(categoryCounts.map((c) => [c.pillarId, c.count]));
  const resourceMap = new Map(resourceCounts.map((c) => [c.pillarId, c.count]));
  const guideMap = new Map(guideCounts.map((c) => [c.pillarId, c.count]));

  return pillarRows.map((p) => ({
    ...p,
    categoryCount: categoryMap.get(p.id) ?? 0,
    resourceCount: resourceMap.get(p.id) ?? 0,
    guideCount: guideMap.get(p.id) ?? 0,
  }));
}

export async function getPillarById(id: number) {
  const rows = await db.select().from(pillars).where(eq(pillars.id, id)).limit(1);
  return rows[0] ?? null;
}
