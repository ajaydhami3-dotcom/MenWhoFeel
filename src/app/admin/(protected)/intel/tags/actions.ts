"use server";

import { revalidatePath } from "next/cache";
import { eq, ne, and, count } from "drizzle-orm";
import { db } from "@/db";
import { tags, articleTags } from "@/db/schema";
import { verifyAdminSession } from "@/lib/admin/dal";
import { slugify } from "@/lib/slug";

export interface TagInput {
  id?: number;
  name: string;
  slug: string;
}

export type TagActionResult =
  | { success: true; id: number }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function tagSlugExists(slug: string, excludeId?: number): Promise<boolean> {
  const rows = await db
    .select({ id: tags.id })
    .from(tags)
    .where(excludeId ? and(eq(tags.slug, slug), ne(tags.id, excludeId)) : eq(tags.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function upsertTagAction(input: TagInput): Promise<TagActionResult> {
  await verifyAdminSession();

  const name = input.name.trim();
  const slug = (input.slug.trim() || slugify(name)).trim();

  if (!name || !slug) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { ...(!name && { name: "Name is required." }), ...(!slug && { slug: "Slug is required." }) },
    };
  }

  if (await tagSlugExists(slug, input.id)) {
    return { success: false, error: "That slug is already in use.", fieldErrors: { slug: "Already taken" } };
  }

  if (input.id) {
    await db.update(tags).set({ name, slug }).where(eq(tags.id, input.id));
    revalidatePath("/admin/intel/tags");
    return { success: true, id: input.id };
  }

  const [inserted] = await db.insert(tags).values({ name, slug }).returning({ id: tags.id });
  revalidatePath("/admin/intel/tags");
  return { success: true, id: inserted.id };
}

export async function getTagUsageCount(id: number): Promise<number> {
  await verifyAdminSession();
  const [{ value }] = await db.select({ value: count() }).from(articleTags).where(eq(articleTags.tagId, id));
  return value;
}

export async function deleteTagAction(id: number): Promise<{ success: boolean; error?: string }> {
  await verifyAdminSession();
  await db.delete(tags).where(eq(tags.id, id)); // article_tags rows cascade via FK
  revalidatePath("/admin/intel/tags");
  revalidatePath("/admin/intel");
  return { success: true };
}
