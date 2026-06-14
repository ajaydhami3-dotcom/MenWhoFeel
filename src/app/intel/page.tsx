// SERVER component — articles are fetched at request time and included
// directly in the HTML that Google crawls. No "Loading articles..." ever.
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import IntelClient, { type ArticleItem } from "./IntelClient";

export const revalidate = 300;

// Fallback articles shown when the DB is unreachable (e.g. missing env var in preview).
// Categories now use the new DB-driven names.
const SEED_ARTICLES: ArticleItem[] = [
  {
    id: "seed-1",
    slug: null,
    title: "Why men don't ask for help — and what actually changes that",
    excerpt: "It's not pride. It's not ego. Research shows the barrier is more nuanced — and more fixable — than most people assume.",
    category: "Mental Health",
    categorySlug: "mental-health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "seed-2",
    slug: null,
    title: "The quiet cost of holding it together all the time",
    excerpt: "What chronic emotional suppression actually does to the body — and the first small step most men never take.",
    category: "Mental Health",
    categorySlug: "mental-health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "seed-3",
    slug: null,
    title: "Anger as a secondary emotion: what's usually underneath it",
    excerpt: "Most men know when they're angry. Very few have been taught to look at what came just before the anger did.",
    category: "Emotions",
    categorySlug: "emotions",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "seed-4",
    slug: null,
    title: "Financial stress and mental health — the link men don't talk about",
    excerpt: "Money problems and mental health spiral together more than any other stressor for men under 45. Here's why and what to do first.",
    category: "Finances & Career",
    categorySlug: "finances-career",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
  {
    id: "seed-5",
    slug: null,
    title: "How to talk to someone when you don't know where to start",
    excerpt: "The first conversation is always the hardest. Here's a framework for getting the real thing out — without needing to have it all figured out first.",
    category: "Relationships",
    categorySlug: "relationships",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
  },
  {
    id: "seed-6",
    slug: null,
    title: "Sleep, testosterone, and mental health — what the evidence actually says",
    excerpt: "Poor sleep doesn't just make you tired. The downstream effects on mood, focus, and hormonal balance are more significant than most men realise.",
    category: "Physical Wellbeing",
    categorySlug: "physical-wellbeing",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27).toISOString(),
  },
];

async function fetchPublishedArticles(): Promise<ArticleItem[]> {
  try {
    const rows = await db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        createdAt: articles.createdAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt));

    return rows.map((r) => ({
      id: String(r.id),
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt ?? null,
      // Fall back to "Mental Health" if article has no category yet (pre-migration articles)
      category: r.categoryName ?? "Mental Health",
      categorySlug: r.categorySlug ?? "mental-health",
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error("[intel/page] DB fetch failed, using seed articles:", err);
    return [];
  }
}

export default async function IntelLibraryPage() {
  const dbArticles = await fetchPublishedArticles();
  const initialArticles = dbArticles.length > 0 ? dbArticles : SEED_ARTICLES;

  return <IntelClient initialArticles={initialArticles} />;
}
