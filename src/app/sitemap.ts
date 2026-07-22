export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";
import { db } from "@/db";
import { articles, categories, topics, stories, tags, journeys } from "@/db/schema";
import { eq, sql, isNull } from "drizzle-orm";

const BASE_URL = "https://www.menwhofeel.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/stories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/crisis-helpline`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/intel`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/challenges`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/assessment`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // NEW (Phase 9–10): Career Hub belongs only inside Work & Financial
    // Stability, but the pages themselves are top-level routes.
    { url: `${BASE_URL}/career-hub`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/small-wins`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/family-and-friends`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/founders-story`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/communication`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/rules`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let topicRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];
  let storyRoutes: MetadataRoute.Sitemap = [];
  let tagRoutes: MetadataRoute.Sitemap = [];
  let journeyRoutes: MetadataRoute.Sitemap = [];

  try {
    const [allCategories, allTopics, publishedArticles, topicCounts, approvedStories, allTags, nativeJourneys] =
      await Promise.all([
        db.select({ slug: categories.slug }).from(categories),
        db.select({ id: topics.id, slug: topics.slug }).from(topics),
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
        // NEW: tag pages existed as a route before this migration touched
        // anything, but were never added to the sitemap — flagged in
        // MIGRATION_PLAN.md Section 2.5 as a pre-existing gap, fixed here
        // in the QA pass rather than left for "later." Unlike topics,
        // tag/[tagSlug]/page.tsx has no noindex-if-empty safety net of
        // its own, so this doesn't filter empty tags out either — it
        // matches the page's own current behavior rather than adding new
        // logic that page doesn't have.
        db.select({ slug: tags.slug }).from(tags),
        // NEW (Phase 7): only journeys with journeyDays of their own get
        // a /challenges/[slug] page — The Forge's registry row has
        // externalHref set instead and lives at /challenges, already in
        // staticRoutes above.
        db.select({ slug: journeys.slug }).from(journeys).where(isNull(journeys.externalHref)),
      ]);

    categoryRoutes = allCategories.map((c) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: new Date(),
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
        lastModified: new Date(),
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

    tagRoutes = allTags.map((t) => ({
      url: `${BASE_URL}/tag/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    journeyRoutes = nativeJourneys.map((j) => ({
      url: `${BASE_URL}/challenges/${j.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

    console.log(
      `Sitemap: ${publishedArticles.length} articles, ${approvedStories.length} stories, ` +
        `${categoryRoutes.length} categories, ${topicRoutes.length}/${allTopics.length} topics (non-empty), ` +
        `${tagRoutes.length} tags, ${journeyRoutes.length} journeys`
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
