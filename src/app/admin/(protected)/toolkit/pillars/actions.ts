"use server";

import { revalidatePath } from "next/cache";
import { eq, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { pillars } from "@/db/schema";
import { verifyAdminSession } from "@/lib/admin/dal";
import { slugify } from "@/lib/slug";

// No create/delete actions here, unlike categories' upsertCategoryAction.
// Pillars are a fixed architectural set of 4 (see MIGRATION_PLAN.md
// 4.5/4.9 — "these are NOT categories... the core architecture of
// MenWhoFeel"), not a growable taxonomy. Adding a 5th or removing one of
// the 4 would break assumptions baked into GuidesClient.tsx, the
// homepage's struggle picker, and the category→pillar mapping — none of
// which belongs in a Server Action's judgment to silently allow. This is
// edit-only by design.

export interface PillarInput {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
}

export type PillarActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function pillarSlugExists(slug: string, excludeId: number): Promise<boolean> {
  const rows = await db
    .select({ id: pillars.id })
    .from(pillars)
    .where(and(eq(pillars.slug, slug), ne(pillars.id, excludeId)))
    .limit(1);
  return rows.length > 0;
}

export async function updatePillarAction(input: PillarInput): Promise<PillarActionResult> {
  await verifyAdminSession();

  const name = input.name.trim();
  const slug = (input.slug.trim() || slugify(name)).trim();
  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = "Name is required.";
  if (!slug) fieldErrors.slug = "Slug is required.";
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  if (await pillarSlugExists(slug, input.id)) {
    return { success: false, error: "That slug is already in use.", fieldErrors: { slug: "Already taken" } };
  }

  await db
    .update(pillars)
    .set({
      name,
      slug,
      description: input.description?.trim() || null,
      color: input.color?.trim() || null,
      icon: input.icon?.trim() || null,
      sortOrder: input.sortOrder,
    })
    .where(eq(pillars.id, input.id));

  revalidatePath("/admin/toolkit/pillars");
  // Name/description are read live by the public Toolkit page and every
  // category/topic/article page's Toolkit section — those revalidate on
  // their own 300s ISR window, so no further action needed here.
  return { success: true };
}
