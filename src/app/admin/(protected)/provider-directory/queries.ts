import { db } from "@/db";
import { providers, pillars } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getAllProviders() {
  return db
    .select({
      id: providers.id,
      name: providers.name,
      type: providers.type,
      description: providers.description,
      location: providers.location,
      url: providers.url,
      trustNotes: providers.trustNotes,
      pillarId: providers.pillarId,
      pillarName: pillars.name,
      status: providers.status,
      featured: providers.featured,
    })
    .from(providers)
    .leftJoin(pillars, eq(providers.pillarId, pillars.id))
    .orderBy(desc(providers.createdAt));
}

export async function getProviderById(id: number) {
  const rows = await db.select().from(providers).where(eq(providers.id, id)).limit(1);
  return rows[0] ?? null;
}

// For the pillar picker in the add/edit form. Returns all 4 rather than
// hardcoding a restriction to just Mental Health/Physical Wellbeing —
// this is an admin-only tool, no harm in leaving the picker open in case
// there's ever a reason to tag a provider to another pillar.
export async function getAllPillars() {
  return db
    .select({ id: pillars.id, name: pillars.name, slug: pillars.slug })
    .from(pillars)
    .orderBy(pillars.sortOrder);
}
