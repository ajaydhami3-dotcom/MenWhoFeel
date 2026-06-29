import { eq, and, ilike, asc, desc, count, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories, topics, tags, articleTags } from "@/db/schema";

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [[totalRow], [publishedRow], [draftRow], [scheduledRow], lastEdited] = await Promise.all([
    db.select({ value: count() }).from(articles),
    db.select({ value: count() }).from(articles).where(eq(articles.status, "published")),
    db.select({ value: count() }).from(articles).where(eq(articles.status, "draft")),
    db.select({ value: count() }).from(articles).where(eq(articles.status, "scheduled")),
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        status: articles.status,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .orderBy(desc(articles.updatedAt))
      .limit(5),
  ]);

  return {
    total: totalRow.value,
    published: publishedRow.value,
    drafts: draftRow.value,
    scheduled: scheduledRow.value,
    lastEdited,
  };
}

// ─── Lookups for selects ────────────────────────────────────────────────────

export async function getCategoriesForSelect() {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getTopicsForSelect() {
  return db
    .select({ id: topics.id, name: topics.name, categoryId: topics.categoryId })
    .from(topics)
    .orderBy(asc(topics.sortOrder), asc(topics.name));
}

export async function getAllTagNames() {
  const rows = await db.select({ name: tags.name }).from(tags).orderBy(asc(tags.name));
  return rows.map((r) => r.name);
}

export async function getArticleTagNames(articleId: number) {
  const rows = await db
    .select({ name: tags.name })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, articleId));
  return rows.map((r) => r.name);
}

export async function getArticleById(id: number) {
  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return row ?? null;
}

// ─── Intel list (search / filter / sort / paginate) ────────────────────────

export type IntelSort = "updated" | "newest" | "oldest" | "title";

export interface IntelListParams {
  search?: string;
  status?: string;
  categoryId?: number;
  sort?: IntelSort;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

export async function getIntelList(params: IntelListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const conditions: SQL[] = [];
  if (params.search?.trim()) {
    conditions.push(ilike(articles.title, `%${params.search.trim()}%`));
  }
  if (params.status) {
    conditions.push(eq(articles.status, params.status));
  }
  if (params.categoryId) {
    conditions.push(eq(articles.categoryId, params.categoryId));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    params.sort === "title"
      ? [asc(articles.title)]
      : params.sort === "oldest"
        ? [asc(articles.createdAt)]
        : params.sort === "newest"
          ? [desc(articles.createdAt)]
          : [desc(articles.updatedAt)]; // "updated" (default)

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        status: articles.status,
        authorName: articles.authorName,
        updatedAt: articles.updatedAt,
        createdAt: articles.createdAt,
        categoryName: categories.name,
        categoryId: articles.categoryId,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(articles).where(where),
  ]);

  return { rows, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

// ─── Categories with article counts ────────────────────────────────────────

export async function getCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      color: categories.color,
      icon: categories.icon,
      articleCount: count(articles.id),
    })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

// ─── Tags with usage counts ─────────────────────────────────────────────────

export async function getTagsWithCounts() {
  return db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      usageCount: count(articleTags.articleId),
    })
    .from(tags)
    .leftJoin(articleTags, eq(articleTags.tagId, tags.id))
    .groupBy(tags.id)
    .orderBy(asc(tags.name));
}
