import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { categories, topics, articles, pillars } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import Breadcrumb from "@/components/Breadcrumb";
import ChallengesTeaser from "@/components/ChallengesTeaser";
import CheckInTeaser from "@/components/CheckInTeaser";
import { CATEGORY_TINTS, DEFAULT_TINT, RESOURCE_ICONS } from "@/lib/category-style";
import { getPillarResources, getPillarCommunityPosts, getPillarStories, getPillarJourney } from "@/server/queries/pillar-content";
import { BookOpen, ChevronRight, FileText, ArrowRight, Link2 } from "lucide-react";

export const revalidate = 300;

const BASE_URL = "https://www.menwhofeel.online";

type Props = { params: Promise<{ topicSlug: string }> };
type KeyArea = { title: string; summary: string };

async function getTopicData(slug: string) {
  try {
    const rows = await db
      .select({
        id: topics.id, name: topics.name, slug: topics.slug,
        description: topics.description, overview: topics.overview,
        whyItMatters: topics.whyItMatters, keyAreas: topics.keyAreas,
        categoryId: topics.categoryId,
        categoryName: categories.name, categorySlug: categories.slug,
        categoryColor: categories.color,
        // Pillar context, reached through the topic's parent category
        // (topics don't get their own pillarId — they inherit it from
        // categories, which got pillarId in the Phase 0 migration).
        // Community's real pillarId column shipped in Phase 6, so plain
        // pillarId is enough for every pillar-scoped *query* this page
        // calls — but the Check-In teaser (Phase 12) needs the pillar's
        // slug/name to build its link and label, so this re-adds a join
        // to `pillars`, same as the category page.
        pillarId: categories.pillarId,
        pillarName: pillars.name,
        pillarSlug: pillars.slug,
      })
      .from(topics)
      .leftJoin(categories, eq(topics.categoryId, categories.id))
      .leftJoin(pillars, eq(categories.pillarId, pillars.id))
      .where(eq(topics.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error(`[topic/${slug}] getTopicData failed:`, err);
    return null;
  }
}

async function getTopicArticles(topicId: number) {
  try {
    return await db
      .select({ id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt, createdAt: articles.createdAt, featured: articles.featured })
      .from(articles)
      .where(and(eq(articles.topicId, topicId), eq(articles.status, "published")))
      .orderBy(desc(articles.createdAt));
  } catch (err) {
    console.error(`[topic] getTopicArticles(${topicId}) failed:`, err);
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const rows = await db.select({ slug: topics.slug }).from(topics);
    return rows.map((r) => ({ topicSlug: r.slug }));
  } catch (err) {
    console.error("[topic] generateStaticParams failed:", err);
    return [];
  }
}

async function getTopicArticleCount(topicId: number) {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(articles)
      .where(and(eq(articles.topicId, topicId), eq(articles.status, "published")));
    return count ?? 0;
  } catch (err) {
    console.error(`[topic] getTopicArticleCount(${topicId}) failed:`, err);
    return 0;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicSlug } = await params;
  const topic = await getTopicData(topicSlug);
  if (!topic) return { title: { absolute: "Topic Not Found | Men Who Feel" } };
  const desc = topic.description ?? `Explore ${topic.name} articles on Men Who Feel.`;
  const articleCount = await getTopicArticleCount(topic.id);

  return {
    title: { absolute: `${topic.name} | Men Who Feel` },
    description: desc,
    alternates: { canonical: `${BASE_URL}/topic/${topicSlug}` },
    openGraph: {
      title: `${topic.name} | Men Who Feel`,
      description: desc,
      url: `${BASE_URL}/topic/${topicSlug}`,
      siteName: "Men Who Feel",
      type: "website",
    },
    // Topics with no published articles yet ("coming soon") are real pages
    // for visitors but shouldn't be indexed as thin/empty content — once an
    // article is published under this topic this will index automatically.
    ...(articleCount === 0 && {
      robots: { index: false, follow: true },
    }),
  };
}

export default async function TopicPage({ params }: Props) {
  const { topicSlug } = await params;
  const topic = await getTopicData(topicSlug);
  if (!topic) notFound();

  const [allArticles, pillarResources, communitySnippets, pillarStories, pillarJourney] = await Promise.all([
    getTopicArticles(topic.id),
    getPillarResources(topic.pillarId, topic.id),
    getPillarCommunityPosts(topic.pillarId),
    getPillarStories(topic.pillarId, topic.id),
    getPillarJourney(topic.pillarId),
  ]);
  const featuredArticles = allArticles.filter((a) => a.featured);
  const keyAreas = topic.keyAreas as KeyArea[] | null;
  const tint = CATEGORY_TINTS[topic.categoryColor ?? "blue"] ?? DEFAULT_TINT;
  const isEmpty =
    allArticles.length === 0 && pillarResources.length === 0 &&
    communitySnippets.length === 0 && pillarStories.length === 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.name,
    description: topic.description,
    url: `${BASE_URL}/topic/${topic.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: topic.categoryName ?? "Category", item: `${BASE_URL}/category/${topic.categorySlug}` },
        { "@type": "ListItem", position: 3, name: topic.name, item: `${BASE_URL}/topic/${topic.slug}` },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl">

        <Breadcrumb crumbs={[
          { label: "Home", href: "/" },
          ...(topic.categoryName && topic.categorySlug
            ? [{ label: topic.categoryName, href: `/category/${topic.categorySlug}` }]
            : []),
          { label: topic.name },
        ]} />

        {/* Hero */}
        <div className="animate-fade-up rounded-2xl border border-border/70 bg-card/70 p-8 sm:p-12 mb-12">
          {topic.categoryName && (
            <Link
              href={`/category/${topic.categorySlug}`}
              className={`mb-4 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] ${tint.text} transition-opacity hover:opacity-80`}
            >
              ← {topic.categoryName}
            </Link>
          )}
          <h1 className="font-display text-[2.4rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            {topic.name}
          </h1>
          {topic.description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {topic.description}
            </p>
          )}
          <span className="mt-6 inline-block rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
            {allArticles.length} article{allArticles.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Overview */}
        {topic.overview && (
          <section className="mb-12 rounded-xl border border-border/70 bg-card/70 p-7">
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Overview</h2>
            <p className="text-base leading-relaxed text-foreground/90">{topic.overview}</p>
          </section>
        )}

        {/* Why it matters */}
        {topic.whyItMatters && (
          <section className="mb-12 rounded-xl border border-border/70 bg-card/70 p-7">
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Why It Matters</h2>
            <p className="text-base leading-relaxed text-foreground/90">{topic.whyItMatters}</p>
          </section>
        )}

        {/* Key areas */}
        {keyAreas && keyAreas.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Key Areas</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {keyAreas.map((area, i) => (
                <div key={i} className="rounded-xl border border-border/70 bg-card/70 p-5">
                  {/* Uniform primary dot instead of a per-category one:
                      the old version derived it by string-replacing
                      "text-" with "bg-" on the accent class, which broke
                      the moment that class gained a dark: variant (only
                      the first "text-" in the string got replaced). Not
                      worth reintroducing for a decorative bullet. */}
                  <div className="mb-3 h-1.5 w-1.5 rounded-full bg-primary" />
                  <h3 className="mb-2 font-display font-medium leading-snug text-foreground">{area.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{area.summary}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular / featured articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Popular Articles</h2>
            <div className="space-y-3">
              {featuredArticles.map((a) => (
                <Link
                  key={a.id}
                  href={`/intel/${a.slug}`}
                  className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                >
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 line-clamp-2 font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                      {a.title}
                    </h3>
                    {a.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>}
                  </div>
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All articles */}
        {allArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              All Articles ({allArticles.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {allArticles.map((a) => (
                <Link
                  key={a.id}
                  href={`/intel/${a.slug}`}
                  className="group rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                >
                  <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
                  </div>
                  <h3 className="mb-2 line-clamp-2 font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{a.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* NEW — Toolkit: practical resources for this topic's pillar.
            Pillar-level, not topic-level — resources are tagged by pillar
            only (4 buckets), not by each of the 38 topics, so the same
            handful of resources can appear across every topic in a given
            pillar. Still a real improvement over the previous dead end. */}
        {pillarResources.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">From the Toolkit</h2>
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

        {/* NEW — Challenges + Check-In: same honest, degrade-gracefully
            cross-links used on the category pages (see
            ChallengesTeaser.tsx / CheckInTeaser.tsx). */}
        <section className="mb-12 grid gap-4 sm:grid-cols-2">
          <ChallengesTeaser journey={pillarJourney} />
          <CheckInTeaser pillarSlug={topic.pillarSlug} pillarName={topic.pillarName} />
        </section>

        {/* NEW — Stories: real experiences from men in this topic's
            pillar. Expect this empty for a while on most topics — no
            existing signal to backfill stories from, unlike resources. */}
        {pillarStories.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Stories</h2>
              <Link href="/stories" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                All stories <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{story.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* NEW — Community: contextual discussions for this topic's pillar */}
        {communitySnippets.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">From the Community</h2>
              <Link href="/community" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                All discussions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
            Articles on this topic are coming soon.
          </p>
        )}
      </div>
    </div>
  );
}
