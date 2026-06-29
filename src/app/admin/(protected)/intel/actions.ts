"use server";

import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleTags, tags } from "@/db/schema";
import { verifyAdminSession } from "@/lib/admin/dal";
import { slugify } from "@/lib/slug";
import { uploadArticleImage, deleteArticleImage } from "@/lib/storage";

export type ArticleStatus = "draft" | "published" | "scheduled";

export interface ArticleInput {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number | null;
  topicId: number | null;
  tagNames: string[];
  featuredImage: string | null;
  authorName: string;
  readingTime: number | null;
  status: ArticleStatus;
  publishedAt: string | null; // ISO string, or null
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  focusKeyword: string | null;
}

export type ArticleActionResult =
  | { success: true; id: number; slug: string }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

// ─── Shared helpers ─────────────────────────────────────────────────────────

async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
  const rows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(excludeId ? and(eq(articles.slug, slug), ne(articles.id, excludeId)) : eq(articles.slug, slug))
    .limit(1);
  return rows.length > 0;
}

/** Looks up tags by name, creating any that don't exist yet, returns their ids. */
async function upsertTagsByName(tagNames: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const raw of tagNames) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugify(name).slice(0, 50) || `tag-${Date.now()}`;

    const existing = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, slug)).limit(1);
    if (existing[0]) {
      ids.push(existing[0].id);
      continue;
    }
    const [inserted] = await db
      .insert(tags)
      .values({ name: name.slice(0, 50), slug })
      .returning({ id: tags.id });
    ids.push(inserted.id);
  }
  return ids;
}

async function replaceArticleTags(articleId: number, tagNames: string[]) {
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));
  const tagIds = await upsertTagsByName(tagNames);
  if (tagIds.length > 0) {
    await db.insert(articleTags).values(tagIds.map((tagId) => ({ articleId, tagId })));
  }
}

function resolvePublishedAt(
  status: ArticleStatus,
  publishedAtInput: string | null,
  existingPublishedAt: Date | null
): Date | null {
  if (status === "draft") return existingPublishedAt; // preserve publish history if any
  if (status === "scheduled") return publishedAtInput ? new Date(publishedAtInput) : null;
  return publishedAtInput ? new Date(publishedAtInput) : existingPublishedAt ?? new Date();
}

function revalidateIntel(slugs: Array<string | null | undefined>) {
  revalidatePath("/intel");
  revalidatePath("/admin");
  revalidatePath("/admin/intel");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/intel/${slug}`);
  }
}

// ─── Validation ─────────────────────────────────────────────────────────────

function validateArticle(input: ArticleInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.title.trim()) errors.title = "Title is required.";
  if (!input.slug.trim()) errors.slug = "Slug is required.";
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug.trim())) {
    errors.slug = "Use lowercase letters, numbers, and hyphens only.";
  }
  if (!input.excerpt.trim()) errors.excerpt = "Excerpt is required.";
  if (!input.content.trim()) {
    errors.content = "Article content is required.";
  }
  if (!input.authorName.trim()) errors.authorName = "Author is required.";

  if (input.status === "scheduled") {
    if (!input.publishedAt) {
      errors.publishedAt = "Scheduled articles need a publish date.";
    } else if (new Date(input.publishedAt) <= new Date()) {
      errors.publishedAt = "Scheduled date must be in the future — use Published for now.";
    }
  }

  return errors;
}

// ─── Create / Update ────────────────────────────────────────────────────────

export async function saveArticleAction(input: ArticleInput): Promise<ArticleActionResult> {
  await verifyAdminSession();

  const fieldErrors = validateArticle(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const slug = input.slug.trim();
  if (await slugExists(slug, input.id)) {
    return {
      success: false,
      error: "That slug is already in use by another article.",
      fieldErrors: { slug: "Already taken" },
    };
  }

  const values = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content,
    status: input.status,
    categoryId: input.categoryId,
    topicId: input.topicId,
    featuredImage: input.featuredImage || null,
    authorName: input.authorName.trim(),
    readingTime: input.readingTime ?? null,
    seoTitle: input.seoTitle?.trim() || null,
    metaDescription: input.metaDescription?.trim() || null,
    canonicalUrl: input.canonicalUrl?.trim() || null,
    ogImage: input.ogImage?.trim() || null,
    focusKeyword: input.focusKeyword?.trim() || null,
  };

  if (input.id) {
    const [existing] = await db
      .select({ slug: articles.slug, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.id, input.id))
      .limit(1);

    if (!existing) return { success: false, error: "Article not found." };

    const publishedAt = resolvePublishedAt(input.status, input.publishedAt, existing.publishedAt);

    await db.update(articles).set({ ...values, publishedAt }).where(eq(articles.id, input.id));
    await replaceArticleTags(input.id, input.tagNames);

    revalidateIntel([existing.slug, slug]);
    return { success: true, id: input.id, slug };
  }

  const publishedAt = resolvePublishedAt(input.status, input.publishedAt, null);

  const [inserted] = await db
    .insert(articles)
    .values({ ...values, publishedAt })
    .returning({ id: articles.id });

  await replaceArticleTags(inserted.id, input.tagNames);
  revalidateIntel([slug]);

  return { success: true, id: inserted.id, slug };
}

// ─── Autosave (drafts only) ─────────────────────────────────────────────────

export interface AutosaveInput {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: number | null;
  topicId: number | null;
  featuredImage: string | null;
  authorName: string;
  readingTime: number | null;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  focusKeyword: string | null;
}

export type AutosaveResult =
  | { success: true; id: number; slug: string }
  | { success: false; error: string };

/**
 * Periodic background save. Deliberately lenient (no field validation) and
 * deliberately scoped to drafts only — see spec point 9, "never overwrite
 * published content accidentally." If the article on record isn't a draft,
 * this is a no-op; the admin has to hit Update/Publish explicitly instead.
 */
export async function autosaveArticleAction(input: AutosaveInput): Promise<AutosaveResult> {
  await verifyAdminSession();

  const title = input.title.trim() || "Untitled draft";
  const baseSlug = (input.slug.trim() || slugify(title)).trim() || `draft-${Date.now()}`;

  const shared = {
    title,
    excerpt: input.excerpt,
    content: input.content,
    categoryId: input.categoryId,
    topicId: input.topicId,
    featuredImage: input.featuredImage || null,
    authorName: input.authorName.trim() || "MenWhoFeel Core",
    readingTime: input.readingTime ?? null,
    seoTitle: input.seoTitle?.trim() || null,
    metaDescription: input.metaDescription?.trim() || null,
    canonicalUrl: input.canonicalUrl?.trim() || null,
    ogImage: input.ogImage?.trim() || null,
    focusKeyword: input.focusKeyword?.trim() || null,
  };

  if (input.id) {
    const [existing] = await db
      .select({ status: articles.status, slug: articles.slug })
      .from(articles)
      .where(eq(articles.id, input.id))
      .limit(1);

    if (!existing) return { success: false, error: "Article not found." };
    if (existing.status !== "draft") return { success: false, error: "Only drafts autosave." };

    // Slug intentionally stays put during autosave, even if the title
    // changed — an explicit Save commits a new slug, autosave never does.
    await db.update(articles).set(shared).where(eq(articles.id, input.id));
    revalidatePath("/admin/intel");
    return { success: true, id: input.id, slug: existing.slug };
  }

  // First autosave for a brand-new article — create it as a draft.
  let uniqueSlug = baseSlug;
  let suffix = 1;
  while (await slugExists(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${++suffix}`;
  }

  const [inserted] = await db
    .insert(articles)
    .values({ ...shared, slug: uniqueSlug, status: "draft" })
    .returning({ id: articles.id });

  revalidatePath("/admin/intel");
  return { success: true, id: inserted.id, slug: uniqueSlug };
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export async function deleteArticleAction(id: number): Promise<{ success: boolean; error?: string }> {
  await verifyAdminSession();

  const [existing] = await db
    .select({ slug: articles.slug, featuredImage: articles.featuredImage })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!existing) return { success: false, error: "Article not found." };

  await db.delete(articles).where(eq(articles.id, id)); // article_tags cascades via FK

  if (existing.featuredImage) {
    await deleteArticleImage(existing.featuredImage).catch(() => {
      // Best-effort cleanup — a stuck Storage object shouldn't block a delete.
    });
  }

  revalidateIntel([existing.slug]);
  return { success: true };
}

// ─── Featured image ─────────────────────────────────────────────────────────

export async function uploadFeaturedImageAction(
  file: File
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  await verifyAdminSession();

  if (!file || file.size === 0) return { success: false, error: "No file provided." };
  if (!file.type.startsWith("image/")) return { success: false, error: "File must be an image." };
  if (file.size > 5 * 1024 * 1024) return { success: false, error: "Image must be under 5MB." };

  try {
    const url = await uploadArticleImage(file);
    return { success: true, url };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Upload failed." };
  }
}

export async function removeFeaturedImageAction(url: string): Promise<{ success: true }> {
  await verifyAdminSession();
  await deleteArticleImage(url).catch(() => {});
  return { success: true };
}
