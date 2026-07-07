// Full server component — no tRPC hooks, no "use client".
// Data is fetched directly from the DB at request time and embedded in
// the HTML Google crawls.
//
// STRUCTURE, DELIBERATELY MINIMAL: every section below exists to do
// exactly one of three jobs for a first-time visitor in their first
// ~60 seconds — reduce uncertainty about what this is, build trust that
// it's legitimate and safe, or point to one clear next step. Sections
// that only added polish or platform-breadth (Toolkit preview, Challenges
// preview, a separate Check-In explainer, a Newsletter pitch) were cut
// entirely rather than kept "just in case" — each of those pages is still
// fully live and linked from the navbar, they just don't get a first-visit
// homepage slot competing for attention. See CHANGES.md for the full list
// of what was removed and why.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import HorizonMotif from "@/components/HorizonMotif";
import {
  ArrowRight, MessageSquare,
  Brain, HeartPulse, Dumbbell, Briefcase, Flame, TrendingUp,
} from "lucide-react";
import { db } from "@/db";
import { articles, categories, communityPosts, communityComments } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { formatDistanceToNowStrict } from "date-fns";
import type { ElementType } from "react";

// Swap this for real photography whenever you have it — a real, warm,
// unguarded moment (walking, thinking, somewhere quiet). Until then this
// section renders a tasteful dark gradient + the brand's horizon motif
// instead of an empty box. A good starting point for free, properly
// licensed images: https://unsplash.com/s/photos/man-walking-alone-rain
const HERO_IMAGE_URL = "";

// ─── Static seed content (shown only if the DB has nothing yet) ───────────────

type CommunitySnippet = { title: string; replyCount: number; time: string; href: string };

const COMMUNITY_SEED: CommunitySnippet[] = [
  { title: "I'm exhausted pretending I'm okay.", replyCount: 12, time: "2 hours ago", href: "/community" },
  { title: "Lost my job three months ago. Still haven't told my dad.", replyCount: 8, time: "5 hours ago", href: "/community" },
];

// Category tints — keyed by the literal `color` string stored in the DB
// (unchanged, so existing category rows don't need any data migration),
// remapped to muted, warm-harmonized pairs that hold contrast in both
// light and dark mode.
const CAT_ICONS: Record<string, ElementType> = {
  blue: Brain, rose: HeartPulse, green: Dumbbell,
  emerald: Briefcase, amber: Flame, purple: TrendingUp,
};
const CATEGORY_TINTS: Record<string, { text: string }> = {
  blue:    { text: "text-slate-600 dark:text-slate-300" },
  rose:    { text: "text-rose-700 dark:text-rose-300" },
  green:   { text: "text-teal-700 dark:text-teal-300" },
  emerald: { text: "text-emerald-700 dark:text-emerald-300" },
  amber:   { text: "text-primary" },
  purple:  { text: "text-purple-700 dark:text-purple-300" },
};
const DEFAULT_TINT = CATEGORY_TINTS.blue!;

// ─── Data fetchers ────────────────────────────────────────────────────────────
// Every fetcher follows the file's existing convention: a direct, narrow
// Drizzle select, wrapped in try/catch, falling back to an empty result
// rather than throwing — a missing/unreachable DB degrades the homepage,
// never crashes it. Limits are trimmed to exactly what's displayed now —
// no point fetching four articles to show two.

async function getHomepageCategories() {
  try {
    const cats = await db.select().from(categories).orderBy(categories.sortOrder);
    const counts = await db
      .select({
        categoryId: articles.categoryId,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(articles)
      .where(eq(articles.status, "published"))
      .groupBy(articles.categoryId);

    const countMap = new Map(counts.map((c) => [c.categoryId, c.count]));
    return cats.map((cat) => ({ ...cat, articleCount: countMap.get(cat.id) ?? 0 }));
  } catch {
    return [];
  }
}

async function getHomepageArticles() {
  try {
    return await db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        readingTime: articles.readingTime,
        authorName: articles.authorName,
        createdAt: articles.createdAt,
        publishedAt: articles.publishedAt,
        categoryName: categories.name,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt))
      .limit(2);
  } catch {
    return [];
  }
}

async function getHomepageCommunityPosts(): Promise<CommunitySnippet[]> {
  try {
    const rows = await db
      .select({
        id: communityPosts.id,
        title: communityPosts.title,
        createdAt: communityPosts.createdAt,
        replyCount: sql<number>`cast(count(${communityComments.id}) as int)`,
      })
      .from(communityPosts)
      .leftJoin(
        communityComments,
        and(eq(communityComments.postId, communityPosts.id), eq(communityComments.deleted, false))
      )
      .where(and(eq(communityPosts.deleted, false), eq(communityPosts.flagged, false)))
      .groupBy(communityPosts.id)
      .orderBy(desc(communityPosts.createdAt))
      .limit(2);

    return rows.map((r) => ({
      title: r.title,
      replyCount: r.replyCount,
      time: formatDistanceToNowStrict(new Date(r.createdAt), { addSuffix: true }),
      href: `/community/${r.id}`,
    }));
  } catch {
    return [];
  }
}

// ─── Shared pieces ─────────────────────────────────────────────────────────────

function SectionHeading({
  eyebrow, title, subtitle, href, linkLabel,
}: { eyebrow?: string; title: string; subtitle?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h2 className="font-display text-[1.9rem] font-semibold text-foreground sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
          {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function ArticleMeta({ article, className = "" }: { article: ArticleRow; className?: string }) {
  const date = article.publishedAt ?? article.createdAt;
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground ${className}`}>
      {article.categoryName && <span className="text-primary">{article.categoryName}</span>}
      {article.categoryName && <span className="opacity-50">·</span>}
      <span>{article.authorName ?? "MenWhoFeel"}</span>
      {date && (
        <>
          <span className="opacity-50">·</span>
          <span>{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </>
      )}
      {article.readingTime && (
        <>
          <span className="opacity-50">·</span>
          <span>{article.readingTime} min</span>
        </>
      )}
    </div>
  );
}

type CategoryWithCount = Awaited<ReturnType<typeof getHomepageCategories>>[number];
type ArticleRow = Awaited<ReturnType<typeof getHomepageArticles>>[number];

// ─── 1. Hero — reduce uncertainty about what this is + one dominant CTA ───────
// Fixed warm-dark treatment regardless of site theme (standard for a
// photo-led hero — legibility over a photo shouldn't depend on the
// visitor's light/dark toggle). No-photo fallback uses the same fixed
// dark tones, so contrast holds either way before a real photo is added.

function HeroSection() {
  return (
    <section className="relative flex min-h-[86vh] items-end overflow-hidden sm:min-h-[90vh]">
      <div className="absolute inset-0">
        {HERO_IMAGE_URL ? (
          <img src={HERO_IMAGE_URL} alt="" loading="eager" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#241a10] via-[#1c1710] to-[#141008]">
            <HorizonMotif className="h-full w-full text-[#c98a4b] opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c08] via-[#0f0c08]/55 to-[#0f0c08]/10" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">
            Anonymous · Free · No account needed
          </div>
          <h1 className="font-display text-[2.75rem] font-medium leading-[1.05] tracking-tight text-[#f6f2ea] sm:text-6xl lg:text-7xl">
            The one place
            <br />
            you don&apos;t have to
            <br />
            <span className="italic text-[#e3a463]">explain yourself.</span>
          </h1>
          {/* This line does the concrete "what is this" work the emotional
              headline deliberately doesn't — a guarded first-time visitor
              needs both. */}
          <p className="mt-7 max-w-md text-lg leading-relaxed text-white/70">
            Free, anonymous support for men — no account, ever. Start with a
            two-minute check-in, or just read what other men have shared.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href="/assessment">Check In</Link>
              </Button>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                2 minutes · No score · No diagnosis
              </p>
            </div>
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 underline underline-offset-4 hover:text-white sm:ml-2"
            >
              Or read what men have shared <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 2. What are you dealing with today — reduce uncertainty this fits YOU ────
// Boxless, flowing tiles rather than a bordered grid. Real DB-backed
// categories, not a fixed list — every tile actually goes somewhere.

function StruggleSection({ cats }: { cats: CategoryWithCount[] }) {
  if (cats.length === 0) return null;
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-xl">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Start here</p>
          <h2 className="font-display text-[1.9rem] font-semibold text-foreground sm:text-3xl">
            What are you dealing with today?
          </h2>
          <p className="mt-2 text-[15px] text-muted-foreground">Pick what&apos;s loudest right now. There&apos;s no wrong answer.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {cats.map((cat) => {
            const tint = CATEGORY_TINTS[cat.color ?? "blue"] ?? DEFAULT_TINT;
            const Icon = CAT_ICONS[cat.color ?? "blue"] ?? Brain;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group flex items-center gap-3 rounded-full border-b-2 border-transparent bg-card/70 px-6 py-4 transition-all hover:border-b-primary hover:bg-card"
              >
                <Icon className={`h-4 w-4 ${tint.text}`} />
                <span className="font-display text-base font-medium text-foreground">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── 3. Trust — who built this, and proof real men are actually here ─────────
// Founder note, community snippets, and the hard trust facts used to be
// three separate sections. They're doing the same job (build trust), so
// they're now one section with a single CTA instead of three competing
// for attention.

function TrustSection({ posts }: { posts: CommunitySnippet[] }) {
  const display = (posts.length > 0 ? posts : COMMUNITY_SEED).slice(0, 2);
  return (
    <section className="bg-secondary/25 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why trust this" title="Built by someone who needed it. Used by men who need it now." />
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="font-display text-xl italic leading-snug text-foreground">
              &ldquo;I built this because I needed it, and it didn&apos;t exist.&rdquo;
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              One man carrying too much with nowhere to put it. No investors, no
              clinical jargon — just a space built around how men actually talk.
            </p>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Anonymous · Free forever · No account · Evidence-informed
            </p>
          </div>
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Men are actually here
            </p>
            <div className="space-y-4">
              {display.map((s, i) => (
                <Link key={i} href={s.href} className="group block rounded-2xl bg-card/80 p-5 transition-colors hover:bg-card">
                  <p className="font-display text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                    {s.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
                    <MessageSquare className="h-3 w-3" /> {s.replyCount} replies · {s.time}
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/community" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
              Read more from the community <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. Reading — the lowest-vulnerability next step ──────────────────────────
// Reading requires zero disclosure, zero account, zero interaction with
// anyone — for a visitor who isn't ready for Check-In or Community yet,
// this is the meaningful next step that asks the least of them.

function ReadingSection({ articlesData }: { articlesData: ArticleRow[] }) {
  if (articlesData.length === 0) return null;
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="No pressure"
          title="Or just read for a while"
          subtitle="You don't have to talk to anyone. Reading counts too."
          href="/intel"
          linkLabel="All reads"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {articlesData.map((article) => (
            <Link key={article.id} href={`/intel/${article.slug}`} className="group rounded-2xl bg-card/70 p-6 transition-colors hover:bg-card">
              <ArticleMeta article={article} className="mb-3" />
              <h4 className="font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                {article.title}
              </h4>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 5. Closing — one unambiguous next step, restated ─────────────────────────

function ClosingSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Ready when you are.</h2>
        <p className="mb-7 mt-4 text-[15px] leading-relaxed text-muted-foreground">
          No account, no record, no explaining yourself first.
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/assessment">Check In</Link>
        </Button>
        <p className="mt-4">
          <Link href="/stories" className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
            or read what other men have shared
          </Link>
        </p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [catsData, articlesData, communitySnippets] = await Promise.all([
    getHomepageCategories(),
    getHomepageArticles(),
    getHomepageCommunityPosts(),
  ]);

  return (
    <div>
      <HeroSection />
      <StruggleSection cats={catsData} />
      <TrustSection posts={communitySnippets} />
      <ReadingSection articlesData={articlesData} />
      <ClosingSection />
    </div>
  );
}
