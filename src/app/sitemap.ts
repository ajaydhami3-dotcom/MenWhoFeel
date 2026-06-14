import { MetadataRoute } from "next";
import { db } from "@/db";
import { articles, categories, topics, tags } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://www.menwhofeel.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                             lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/stories`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/community`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/crisis-helpline`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/intel`,                  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/challenges`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/guides`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/assessment`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/founders-story`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/about`,                  lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/policy`,                 lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/rules`,                  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/disclaimer`,             lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/privacy-policy`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  let categoryRoutes: MetadataRoute.Sitemap = [];
  let topicRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];
  let tagRoutes: MetadataRoute.Sitemap = [];

  try {
    const [allCategories, allTopics, publishedArticles, allTags] = await Promise.all([
      db.select({ slug: categories.slug }).from(categories),
      db.select({ slug: topics.slug }).from(topics),
      db.select({ slug: articles.slug, createdAt: articles.createdAt })
        .from(articles)
        .where(eq(articles.status, "published")),
      db.select({ slug: tags.slug }).from(tags),
    ]);

    categoryRoutes = allCategories.map((c) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    topicRoutes = allTopics.map((t) => ({
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

    tagRoutes = allTags.map((t) => ({
      url: `${BASE_URL}/tag/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    // DB unavailable during static build — return static routes only.
    console.error("[sitemap] DB unavailable, returning static routes only:", err);
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...topicRoutes,
    ...articleRoutes,
    ...tagRoutes,
  ];
}
