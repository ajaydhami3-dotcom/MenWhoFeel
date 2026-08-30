// Was force-dynamic: re-ran all 6 queries below on every single request,
// including every crawler hit. New articles publish often enough that a
// full day's cache would lag noticeably, but there's no reason this needs
// to be request-fresh — an hour is a fine trade-off between "shows up
// promptly" and "doesn't hit the DB on every Googlebot visit."
export const revalidate = 3600;

import { MetadataRoute } from "next";
import { db } from "@/db";
import { articles, categories, topics, stories, tags, articleTags, journeys } from "@/db/schema";
import { eq, sql, isNull } from "drizzle-orm";

const BASE_URL = "https://www.menwhofeel.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/stories`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/community`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/crisis-helpline`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/intel`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/challenges`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/guides`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/assessment`, changeFrequency: "monthly", priority: 0.8 },
    // NEW (Phase 9–10): Career Hub belongs only inside Work & Financial
    // Stability, but the pages themselves are top-level routes.
    { url: `${BASE_URL}/career-hub`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/small-wins`, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/family-and-friends`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/founders-story`, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/communication`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/rules`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let topicRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];
  let storyRoutes: MetadataRoute.Sitemap = [];
  let tagRoutes: MetadataRoute.Sitemap = [];
  let journeyRoutes: MetadataRoute.Sitemap = [];

  try {
    const [
      allCategories,
      allTopics,
      publishedArticles,
      topicCounts,
      approvedStories,
      allTags,
      tagCounts,
      nativeJourneys,
    ] = await Promise.all([
      db.select({ slug: categories.slug, createdAt: categories.createdAt }).from(categories),
      db.select({ id: topics.id, slug: topics.slug, createdAt: topics.createdAt }).from(topics),
      db
        .select({
          slug: articles.slug,
          createdAt: articles.createdAt,
        })
        .from(articles)
        .where(eq(articles.status, "published")),
      // Grouped count so we can exclude empty topics below in one query
      // instead of one extra query per topic.
      db
        .select({
          topicId: articles.topicId,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(articles)
        .where(eq(articles.status, "published"))
        .groupBy(articles.topicId),
      db
        .select({ id: stories.id, createdAt: stories.createdAt })
        .from(stories)
        .where(eq(stories.status, "approved")),
      // Tag pages existed as a route before this migration touched
      // anything, but were never added to the sitemap — flagged in
      // MIGRATION_PLAN.md Section 2.5 as a pre-existing gap, fixed here.
      db.select({ id: tags.id, slug: tags.slug, createdAt: tags.createdAt }).from(tags),
      // NEW: same "don't submit empty pages" logic topics already had.
      // Goes through articleTags since tags are a many-to-many join, not
      // a direct FK on articles like topicId is.
      db
        .select({
          tagId: articleTags.tagId,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(articleTags)
        .innerJoin(articles, eq(articleTags.articleId, articles.id))
        .where(eq(articles.status, "published"))
        .groupBy(articleTags.tagId),
      // NEW (Phase 7): only journeys with journeyDays of their own get
      // a /challenges/[slug] page — The Forge's registry row has
      // externalHref set instead and lives at /challenges, already in
      // staticRoutes above.
      db
        .select({ slug: journeys.slug, createdAt: journeys.createdAt })
        .from(journeys)
        .where(isNull(journeys.externalHref)),
    ]);

    // None of these tables track updatedAt today, so createdAt is the most
    // honest lastModified available — not perfectly accurate if content
    // gets edited later, but a real, stable date beats new Date() reporting
    // "just changed" on every single sitemap fetch regardless of whether
    // anything did.
    categoryRoutes = allCategories.map((c) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: c.createdAt ? new Date(c.createdAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    // Topics with zero published articles are noindexed on the page itself
    // (see topic/[topicSlug]/page.tsx) — keep them out of the sitemap too,
    // there's no point asking Google to crawl a page we've told it not to
    // index.
    const countByTopicId = new Map(topicCounts.map((r) => [r.topicId, r.count]));
    topicRoutes = allTopics
      .filter((t) => (countByTopicId.get(t.id) ?? 0) > 0)
      .map((t) => ({
        url: `${BASE_URL}/topic/${t.slug}`,
        lastModified: t.createdAt ? new Date(t.createdAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    articleRoutes = publishedArticles.map((a) => ({
      url: `${BASE_URL}/intel/${a.slug}`,
      lastModified: a.createdAt ? new Date(a.createdAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));

    storyRoutes = approvedStories.map((s) => ({
      url: `${BASE_URL}/stories/${s.id}`,
      lastModified: s.createdAt ? new Date(s.createdAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    // Same "don't submit empty pages" reasoning as topics above.
    const countByTagId = new Map(tagCounts.map((r) => [r.tagId, r.count]));
    tagRoutes = allTags
      .filter((t) => (countByTagId.get(t.id) ?? 0) > 0)
      .map((t) => ({
        url: `${BASE_URL}/tag/${t.slug}`,
        lastModified: t.createdAt ? new Date(t.createdAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    journeyRoutes = nativeJourneys.map((j) => ({
      url: `${BASE_URL}/challenges/${j.slug}`,
      lastModified: j.createdAt ? new Date(j.createdAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

    console.log(
      `Sitemap: ${publishedArticles.length} articles, ${approvedStories.length} stories, ` +
        `${categoryRoutes.length} categories, ${topicRoutes.length}/${allTopics.length} topics (non-empty), ` +
        `${tagRoutes.length}/${allTags.length} tags (non-empty), ${journeyRoutes.length} journeys`
    );
  } catch (err) {
    console.error("[sitemap] Error:", err);
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...topicRoutes,
    ...articleRoutes,
    ...storyRoutes,
    ...tagRoutes,
    ...journeyRoutes,
  ];
}
