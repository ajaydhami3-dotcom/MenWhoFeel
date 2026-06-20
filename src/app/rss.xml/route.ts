/**
 * RSS 2.0 feed for Men Who Feel
 * Route: /rss.xml
 *
 * Drop this file at:  src/app/rss.xml/route.ts
 *
 * Fetches the 50 most-recent published articles from the DB and
 * returns valid RSS 2.0 XML, matching the same pattern used by
 * the existing sitemap.ts.
 *
 * Then add the autodiscovery <link> to src/app/layout.tsx:
 *
 *   export const metadata: Metadata = {
 *     ...
 *     alternates: {
 *       canonical: BASE_URL,
 *       types: { "application/rss+xml": `${BASE_URL}/rss.xml` },
 *     },
 *   };
 */

export const dynamic = "force-dynamic";

import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const BASE_URL = "https://www.menwhofeel.online";

const FEED_TITLE = "Men Who Feel — Men's Mental Health Intel";
const FEED_DESCRIPTION =
  "Practical, honest articles on men's mental health — emotions, relationships, " +
  "finances, physical wellbeing, and more. No account needed. " +
  "Part of the anonymous Men Who Feel community.";

/** Escape the five XML special characters. */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  // ── 1. Fetch published articles ─────────────────────────────────────────────
  type Row = {
    slug: string;
    title: string;
    excerpt: string;
    createdAt: Date | null;
    categoryName: string | null;
    featuredImage: string | null;
    authorName: string | null;
  };

  let rows: Row[] = [];

  try {
    rows = await db
      .select({
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        createdAt: articles.createdAt,
        categoryName: categories.name,
        featuredImage: articles.featuredImage,
        authorName: articles.authorName,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt))
      .limit(50);
  } catch (err) {
    console.error("[rss.xml] DB fetch failed:", err);
    // Return an empty-but-valid feed rather than a 500
  }

  // ── 2. Build <item> blocks ───────────────────────────────────────────────────
  const now = new Date().toUTCString();

  const itemsXml = rows
    .map((row) => {
      const url = `${BASE_URL}/intel/${row.slug}`;
      const pubDate = row.createdAt ? new Date(row.createdAt).toUTCString() : now;
      const author = row.authorName ?? "MenWhoFeel Core";

      // Optional elements — only emit when data is present
      const categoryTag = row.categoryName
        ? `\n      <category>${esc(row.categoryName)}</category>`
        : "";

      // Enclosure lets podcast/RSS apps show a thumbnail
      const enclosureTag =
        row.featuredImage && row.featuredImage.startsWith("http")
          ? `\n      <enclosure url="${esc(row.featuredImage)}" length="0" type="image/jpeg" />`
          : "";

      return `
    <item>
      <title>${esc(row.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(row.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${esc(author)}</dc:creator>${categoryTag}${enclosureTag}
    </item>`;
    })
    .join("");

  // ── 3. Assemble the feed ─────────────────────────────────────────────────────
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">

  <channel>
    <title>${esc(FEED_TITLE)}</title>
    <link>${BASE_URL}</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${esc(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <managingEditor>support@menwhofeel.online (Men Who Feel)</managingEditor>
    <webMaster>support@menwhofeel.online (Men Who Feel)</webMaster>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>300</ttl>
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>${esc(FEED_TITLE)}</title>
      <link>${BASE_URL}</link>
      <width>512</width>
      <height>512</height>
    </image>
${itemsXml}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache for 5 min at the CDN edge; serve stale while revalidating
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
