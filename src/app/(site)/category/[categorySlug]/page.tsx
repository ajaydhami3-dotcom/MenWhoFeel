import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { categories, topics, articles, pillars } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import Breadcrumb from "@/components/Breadcrumb";
import ChallengesTeaser from "@/components/ChallengesTeaser";
import { CAT_ICONS, CATEGORY_TINTS, DEFAULT_TINT, RESOURCE_ICONS } from "@/lib/category-style";
import { getPillarResources, getPillarCommunityPosts, getPillarStories, getPillarJourney } from "@/server/queries/pillar-content";
import { ArrowRight, Link2, Briefcase, TrendingUp } from "lucide-react";

export const revalidate = 300;

const BASE_URL = "https://www.menwhofeel.online";

type Props = { params: Promise<{ categorySlug: string }> };

async function getCategoryData(slug: string) {
  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        color: categories.color,
        pillarId: categories.pillarId,
        pillarName: pillars.name,
      })
      .from(categories)
      .leftJoin(pillars, eq(categories.pillarId, pillars.id))
      .where(eq(categories.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error(`[category/${slug}] getCategoryData failed:`, err);
    return null;
  }
}

async function getTopicsWithCount(categoryId: number) {
  try {
    const topicRows = await db
      .select()
      .from(topics)
      .where(eq(topics.categoryId, categoryId))
      .orderBy(topics.sortOrder);

    // Single grouped query instead of one COUNT(*) per topic — same fix
    // as getHomepageCategories in page.tsx. The old version here ran an
    // extra round trip per topic (N+1) inside a Promise.all.
    const counts = await db
      .select({ topicId: articles.topicId, count: sql<number>`cast(count(*) as int)` })
      .from(articles)
      .where(eq(articles.status, "published"))
      .groupBy(articles.topicId);
    const countMap = new Map(counts.map((c) => [c.topicId, c.count]));

    return topicRows.map((t) => ({ ...t, articleCount: countMap.get(t.id) ?? 0 }));
  } catch (err) {
    console.error(`[category] getTopicsWithCount(${categoryId}) failed:`, err);
    return [];
  }
}

async function getLatestArticles(categoryId: number) {
  try {
    return await db
      .select({ id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt })
      .from(articles)
      .where(and(eq(articles.categoryId, categoryId), eq(articles.status, "published")))
      .orderBy(desc(articles.createdAt))
      .limit(4);
  } catch (err) {
    console.error(`[category] getLatestArticles(${categoryId}) failed:`, err);
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const rows = await db.select({ slug: categories.slug }).from(categories);
    return rows.map((r) => ({ categorySlug: r.slug }));
  } catch (err) {
    console.error("[category] generateStaticParams failed:", err);
    return [];
  }
}

async function getCategoryArticleCount(categoryId: number) {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(articles)
      .where(and(eq(articles.categoryId, categoryId), eq(articles.status, "published")));
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const cat = await getCategoryData(categorySlug);
  if (!cat) return { title: { absolute: "Category Not Found | Men Who Feel" } };
  const articleCount = await getCategoryArticleCount(cat.id);
  return {
    title: { absolute: `${cat.name} | Men Who Feel` },
    description: cat.description ?? `Explore ${cat.name} articles, tools, and support on Men Who Feel.`,
    alternates: { canonical: `${BASE_URL}/category/${categorySlug}` },
    openGraph: {
      title: `${cat.name} | Men Who Feel`,
      description: cat.description ?? "",
      url: `${BASE_URL}/category/${categorySlug}`,
      siteName: "Men Who Feel",
      type: "website",
    },
    // Safety net: if a category is ever created/empty before content is
    // published under it, don't let a thin "0 articles" page get indexed.
    ...(articleCount === 0 && {
      robots: { index: false, follow: true },
    }),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const cat = await getCategoryData(categorySlug);
  if (!cat) notFound();

  const [topicsData, latestArticles, pillarResources, communitySnippets, pillarStories, pillarJourney] = await Promise.all([
    getTopicsWithCount(cat.id),
    getLatestArticles(cat.id),
    getPillarResources(cat.pillarId),
    getPillarCommunityPosts(cat.pillarId),
    getPillarStories(cat.pillarId),
    getPillarJourney(cat.pillarId),
  ]);

  const totalArticles = topicsData.reduce((sum, t) => sum + (t.articleCount ?? 0), 0);
  const tint = CATEGORY_TINTS[cat.color ?? "blue"] ?? DEFAULT_TINT;
  const Icon = CAT_ICONS[cat.color ?? "blue"] ?? CAT_ICONS.blue!;
  const isEmpty =
    topicsData.length === 0 && latestArticles.length === 0 &&
    pillarResources.length === 0 && communitySnippets.length === 0 && pillarStories.length === 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.name,
    description: cat.description,
    url: `${BASE_URL}/category/${cat.slug}`,
    publisher: { "@type": "Organization", name: "Men Who Feel", url: BASE_URL },
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl">

        {/* No longer nested under "Useful Reads" (/intel) — this page now
            aggregates Toolkit, Challenges, and Community too, so it sits
            as its own top-level hub rather than being filed under Intel. */}
        <Breadcrumb crumbs={[
          { label: "Home", href: "/" },
          { label: cat.name },
        ]} />

        {/* Hero */}
        <div className="animate-fade-up rounded-2xl border border-border/70 bg-card/70 p-8 sm:p-12 mb-14">
          <div className={`mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] ${tint.text}`}>
            <Icon className="h-4 w-4" />
            {cat.pillarName ?? "Category"}
          </div>
          <h1 className="font-display text-[2.4rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            {cat.name}
          </h1>
          {cat.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {cat.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              {topicsData.length} topic{topicsData.length !== 1 ? "s" : ""}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              {totalArticles} article{totalArticles !== 1 ? "s" : ""}
            </span>
            {pillarResources.length > 0 && (
              <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                {pillarResources.length} toolkit resource{pillarResources.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Career Hub + Small Wins — pillar-exclusive, per the original
            brief ("Career Hub belongs ONLY inside Work & Financial
            Stability"). Not a generic pillar-page section like Toolkit/
            Challenges/Stories/Community below, so it's gated on the
            pillar name directly rather than being part of the shared
            pattern every category page gets. */}
        {cat.pillarName === "Work & Financial Stability" && (
          <section className="mb-14 grid gap-4 sm:grid-cols-2">
            <Link
              href="/career-hub"
              className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-6 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-medium text-foreground">Career Hub</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">Guides, job resources, and career Intel in one place.</p>
              </div>
            </Link>
            <Link
              href="/small-wins"
              className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card/70 p-6 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-medium text-foreground">Small Wins</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">Vetted ways to earn quickly while you rebuild.</p>
              </div>
            </Link>
          </section>
        )}

        {/* Topics */}
        {topicsData.length > 0 && (
          <section className="mb-14">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Explore</p>
            <h2 className="mb-6 font-display text-[1.6rem] font-semibold text-foreground sm:text-2xl">Topics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topicsData.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topic/${topic.slug}`}
                  className="group rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                >
                  <h3 className="mb-2 font-display font-medium leading-tight text-foreground transition-colors group-hover:text-primary">
                    {topic.name}
                  </h3>
                  {topic.description && (
                    <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {topic.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {topic.articleCount} article{topic.articleCount !== 1 ? "s" : ""}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest Intel articles */}
        {latestArticles.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Read</p>
                <h2 className="font-display text-[1.6rem] font-semibold text-foreground sm:text-2xl">Latest Intel</h2>
              </div>
              <Link href="/intel" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                All articles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {latestArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/intel/${article.slug}`}
                  className="group rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                >
                  <h3 className="mb-2 line-clamp-2 font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* NEW — Toolkit: practical resources for this pillar */}
        {pillarResources.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Apply it</p>
                <h2 className="font-display text-[1.6rem] font-semibold text-foreground sm:text-2xl">From the Toolkit</h2>
              </div>
              <Link href="/guides" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                Full toolkit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {pillarResources.map((resource) => {
                const ResIcon = RESOURCE_ICONS[resource.type] ?? Link2;
                return (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ResIcon className="h-4 w-4" />
                    </div>
                    <span className="font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                      {resource.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-14">
          <ChallengesTeaser journey={pillarJourney} />
        </section>

        {/* NEW — Stories: real experiences from men in this pillar. Real
            pillarId query, but expect this to be empty on most pillars
            for a while — unlike resources, there was no existing signal
            to backfill stories from, so it only fills in as new
            submissions tag themselves or editorial review catches up. */}
        {pillarStories.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Hear from others</p>
                <h2 className="font-display text-[1.6rem] font-semibold text-foreground sm:text-2xl">Stories</h2>
              </div>
              <Link href="/stories" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                All stories <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {pillarStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="group rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                >
                  <h3 className="mb-2 line-clamp-2 font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                    {story.title}
                  </h3>
                  {story.excerpt && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {story.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* NEW — Community: contextual discussions for this pillar */}
        {communitySnippets.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Connect</p>
                <h2 className="font-display text-[1.6rem] font-semibold text-foreground sm:text-2xl">From the Community</h2>
              </div>
              <Link href="/community" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                All discussions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {communitySnippets.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="group rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                >
                  <p className="line-clamp-3 font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {isEmpty && (
          <p className="py-16 text-center italic text-muted-foreground">
            Content for this pillar is coming soon. Check back shortly.
          </p>
        )}
      </div>
    </div>
  );
}
