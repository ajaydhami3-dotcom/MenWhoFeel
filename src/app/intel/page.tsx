// SERVER component — articles are fetched at request time and included
// directly in the HTML that Google crawls. No "Loading articles..." ever.
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import IntelClient, { type ArticleItem } from "./IntelClient";

// ISR: re-generate at most every 5 minutes so new published articles
// appear without a full deploy.
export const revalidate = 300;

// Seed articles shown when the DB is unreachable or empty.
// createdAt values are ISO strings so they serialise across the server→client boundary.
const SEED_ARTICLES: ArticleItem[] = [
  {
    id: "seed-1",
    slug: null,
    title: "Why men don't ask for help — and what actually changes that",
    excerpt:
      "It's not pride. It's not ego. Research shows the barrier is more nuanced — and more fixable — than most people assume.",
    category: "Mental Health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "seed-2",
    slug: null,
    title: "The quiet cost of holding it together all the time",
    excerpt:
      "What chronic emotional suppression actually does to the body — and the first small step most men never take.",
    category: "Mental Health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "seed-3",
    slug: null,
    title: "Anger as a secondary emotion: what's usually underneath it",
    excerpt:
      "Most men know when they're angry. Very few have been taught to look at what came just before the anger did.",
    category: "Mental Health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "seed-4",
    slug: null,
    title: "Financial stress and mental health — the link men don't talk about",
    excerpt:
      "Money problems and mental health spiral together more than any other stressor for men under 45. Here's why and what to do first.",
    category: "Money & Work",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
  {
    id: "seed-5",
    slug: null,
    title: "How to talk to someone when you don't know where to start",
    excerpt:
      "The first conversation is always the hardest. Here's a framework for getting the real thing out — without needing to have it all figured out first.",
    category: "Stress & Relationships",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
  },
  {
    id: "seed-6",
    slug: null,
    title: "Sleep, testosterone, and mental health — what the evidence actually says",
    excerpt:
      "Poor sleep doesn't just make you tired. The downstream effects on mood, focus, and hormonal balance are more significant than most men realise.",
    category: "Physical Health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27).toISOString(),
  },
];

// Infer category on the server so the client receives pre-categorised data.
function inferCategory(title: string, excerpt?: string | null): ArticleItem["category"] {
  const text = (title + " " + (excerpt ?? "")).toLowerCase();
  if (/money|financial|work|job|debt|salary|budget|career|income/.test(text))
    return "Money & Work";
  if (/sleep|exercise|physical|body|movement|testosterone|gym|diet|fitness/.test(text))
    return "Physical Health";
  if (/stress|relationship|anger|partner|conflict|fight|pressure|communicate|talk to/.test(text))
    return "Stress & Relationships";
  return "Mental Health";
}

async function fetchPublishedArticles(): Promise<ArticleItem[]> {
  try {
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt));

    return rows.map((r) => ({
      id: String(r.id),
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt ?? null,
      category: inferCategory(r.title, r.excerpt),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    // DB unavailable (e.g. missing env var in preview) — fall back to seeds.
    console.error("[intel/page] DB fetch failed, using seed articles:", err);
    return [];
  }
}

export default async function IntelLibraryPage() {
  const dbArticles = await fetchPublishedArticles();
  const initialArticles = dbArticles.length > 0 ? dbArticles : SEED_ARTICLES;

  // At this point every article title, excerpt, and category is embedded in
  // the server-rendered HTML. Google sees real content immediately — no JS
  // required to populate the page.
  return <IntelClient initialArticles={initialArticles} />;
}
