// This is a SERVER component — stories are fetched at request time and
// included directly in the HTML that Google crawls. No "Loading stories..." ever.
import { db } from "@/db";
import { stories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import StoriesClient, { type StoryItem } from "./StoriesClient";

// ISR: re-generate the page at most every 5 minutes so new approved
// stories appear without a full deploy.
export const revalidate = 300;

// Seed stories shown when the DB is unreachable or empty.
// Dates are ISO strings so they serialise cleanly across the server→client boundary.
const SEED_STORIES: StoryItem[] = [
  {
    id: -1,
    title: "The day I finally admitted I wasn't okay",
    excerpt:
      "I'd been telling everyone I was fine for about two years. My job was stable, my relationship was fine, nothing was visibly wrong. But every morning I'd wake up and have to actively talk myself into getting out of bed.",
    content:
      "I'd been telling everyone I was fine for about two years. My job was stable, my relationship was fine, nothing was visibly wrong. But every morning I'd wake up and have to actively talk myself into getting out of bed. I didn't know what that was. I just knew something was off.",
    authorName: "anon",
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: -2,
    title: "Redundancy at 43 — what nobody tells you about losing your identity",
    excerpt:
      "The money thing was stressful. But what nobody warned me about was how much of who I thought I was had been wrapped up in what I did.",
    content:
      "The money thing was stressful. But what nobody warned me about was how much of who I thought I was had been wrapped up in what I did. When that went, I didn't know who I was anymore. That was the harder part.",
    authorName: "t_manchester",
    featured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: -3,
    title: "I started therapy and it wasn't what I expected",
    excerpt:
      "I thought I'd be lying on a couch being asked about my childhood. What actually happened was someone asked me a question I'd never considered.",
    content:
      "I thought I'd be lying on a couch being asked about my childhood. What actually happened was someone asked me a question I'd never considered and I realised I'd never really looked at myself. That was uncomfortable in a useful way.",
    authorName: "anon",
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

async function fetchApprovedStories(): Promise<StoryItem[]> {
  try {
    const rows = await db
      .select()
      .from(stories)
      .where(eq(stories.status, "approved"))
      .orderBy(desc(stories.createdAt));

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      excerpt: r.excerpt ?? null,
      content: r.content,
      authorName: r.authorName,
      featured: r.featured ?? false,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (err) {
    // DB unavailable (e.g. missing env var in preview) — fall back to seeds
    console.error("[stories/page] DB fetch failed, using seed stories:", err);
    return [];
  }
}

export default async function StoriesPage() {
  const dbStories = await fetchApprovedStories();
  const displayStories = dbStories.length > 0 ? dbStories : SEED_STORIES;

  // At this point the full list is embedded in the server-rendered HTML.
  // Google will index every title, excerpt, author and date — no JS needed.
  return <StoriesClient initialStories={displayStories} />;
}
