import { db } from "@/db";
import { providers, pillars } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getApprovedProviders(pillarSlug?: string) {
  try {
    const conditions = pillarSlug
      ? and(eq(providers.status, "approved"), eq(pillars.slug, pillarSlug))
      : eq(providers.status, "approved");

    return await db
      .select({
        id: providers.id,
        name: providers.name,
        type: providers.type,
        description: providers.description,
        location: providers.location,
        url: providers.url,
        trustNotes: providers.trustNotes,
        featured: providers.featured,
        pillarName: pillars.name,
        pillarSlug: pillars.slug,
      })
      .from(providers)
      .leftJoin(pillars, eq(providers.pillarId, pillars.id))
      .where(conditions)
      .orderBy(desc(providers.featured), desc(providers.createdAt));
  } catch (err) {
    console.error("[provider-directory] getApprovedProviders failed:", err);
    return [];
  }
}
