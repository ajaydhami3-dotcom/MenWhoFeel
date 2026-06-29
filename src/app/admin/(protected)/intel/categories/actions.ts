"use server";

import { revalidatePath } from "next/cache";
import { eq, ne, and, count } from "drizzle-orm";
import { db } from "@/db";
import { categories, articles, topics } from "@/db/schema";
import { verifyAdminSession } from "@/lib/admin/dal";
import { slugify } from "@/lib/slug";

export interface CategoryInput {
  id?: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
}

export type CategoryActionResult =
  | { success: true; id: number }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

async function categorySlugExists(slug: string, excludeId?: number): Promise<boolean> {
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(excludeId ? and(eq(categories.slug, slug), ne(categories.id, excludeId)) : eq(categories.slug, slug))
    .limit(1);
  return rows.length > 0;
}

export async function upsertCategoryAction(input: CategoryInput): Promise<CategoryActionResult> {
  await verifyAdminSession();

  const name = input.name.trim();
  const slug = (input.slug.trim() || slugify(name)).trim();
  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = "Name is required.";
  if (!slug) fieldErrors.slug = "Slug is required.";
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  if (await categorySlugExists(slug, input.id)) {
    return { success: false, error: "That slug is already in use.", fieldErrors: { slug: "Already taken" } };
  }

  const values = {
    name,
    slug,
    description: input.description?.trim() || null,
    color: input.color?.trim() || null,
    icon: input.icon?.trim() || null,
  };

  if (input.id) {
    await db.update(categories).set(values).where(eq(categories.id, input.id));
    revalidatePath("/admin/intel/categories");
    return { success: true, id: input.id };
  }

  const [inserted] = await db.insert(categories).values(values).returning({ id: categories.id });
  revalidatePath("/admin/intel/categories");
  return { success: true, id: inserted.id };
}

export interface DeleteCategoryResult {
  success: boolean;
  error?: string;
  /** Set when the category still has articles, so the UI can offer to reassign them instead of just failing. */
  articleCount?: number;
}

export async function deleteCategoryAction(
  id: number,
  reassignToId?: number | null
): Promise<DeleteCategoryResult> {
  await verifyAdminSession();

  const [{ value: articleCount }] = await db
    .select({ value: count() })
    .from(articles)
    .where(eq(articles.categoryId, id));

  if (articleCount > 0 && !reassignToId) {
    return {
      success: false,
      error: `${articleCount} article${articleCount === 1 ? "" : "s"} still use this category. Reassign them first.`,
      articleCount,
    };
  }

  const [{ value: topicCount }] = await db.select({ value: count() }).from(topics).where(eq(topics.categoryId, id));
  if (topicCount > 0) {
    return {
      success: false,
      error: `${topicCount} topic${topicCount === 1 ? "" : "s"} still live under this category. Move or delete them first.`,
    };
  }

  if (articleCount > 0 && reassignToId) {
    if (reassignToId === id) {
      return { success: false, error: "Pick a different category to reassign to." };
    }
    await db.update(articles).set({ categoryId: reassignToId }).where(eq(articles.categoryId, id));
  }

  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/intel/categories");
  revalidatePath("/intel");
  return { success: true };
}
