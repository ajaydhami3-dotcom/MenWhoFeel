// Full server component — no tRPC hooks, no "use client".
// Data is fetched directly from the DB at request time and embedded in
// the HTML Google crawls.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import NewsletterForm from "@/components/NewsletterForm";
import HorizonMotif from "@/components/HorizonMotif";
import {
  BookOpen, ArrowRight, MessageSquare,
  Brain, HeartPulse, Dumbbell, Briefcase, Flame, TrendingUp,
  CheckCircle2, Clock,
} from "lucide-react";
import { db } from "@/db";
import { articles, categories, communityPosts, communityComments, challenges, selfHelpGuides } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { formatDistanceToNowStrict } from "date-fns";
import type { ElementType } from "react";

// Swap this for real photography whenever you have it — a real, warm,
// unguarded moment (walking, thinking, somewhere quiet). Until then this
// section renders a tasteful dark gradient + the brand's horizon motif
// instead of an empty box. A good starting point for free, properly
// licensed images: https://unsplash.com/s/photos/man-walking-alone-rain
// or https://unsplash.com/s/photos/man-mountain-solitude
const HERO_IMAGE_URL = "";

// ─── Static seed content (shown only if the DB has nothing yet) ───────────────

type CommunitySnippet = { title: string; excerpt: string; replyCount: number; time: string; href: string };

const COMMUNITY_SEED: CommunitySnippet[] = [
  { title: "I'm exhausted pretending I'm okay.", excerpt: "Everyone depends on me and I don't know who I'm allowed to depend on. Feels like the moment I stop, everything stops.", replyCount: 12, time: "2 hours ago", href: "/community" },
  { title: "Lost my job three months ago. Still haven't told my dad.", excerpt: "Not sure why I'm ashamed. He'd probably understand more than I'm giving him credit for.", replyCount: 8, time: "5 hours ago", href: "/community" },
  { title: "Therapy felt too clinical. This felt like talking to someone who actually gets it.", excerpt: "First time I've said any of this out loud, anonymous or not.", replyCount: 21, time: "yesterday", href: "/community" },
  { title: "Small improvements matter more than I expected.", excerpt: "Started sleeping 7 hours a night. Didn't fix everything. Changed something, though.", replyCount: 6, time: "1 day ago", href: "/community" },
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

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function truncateWords(text: string, maxLen: number): string {
  const clean = text.trim();
  if (clean.length <= maxLen) return clean;
  const trimmed = clean.slice(0, maxLen);
  const lastSpace = trimmed.lastIndexOf(" ");
  return (lastSpace > 20 ? trimmed.slice(0, lastSpace) : trimmed).trim() + "…";
}

// ─── Data fetchers ────────────────────────────────────────────────────────────
// Every fetcher follows the file's existing convention: a direct, narrow
// Drizzle select, wrapped in try/catch, falling back to an empty result
// rather than throwing — a missing/unreachable DB degrades the homepage,
// never crashes it.

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
        featuredImage: articles.featuredImage,
        readingTime: articles.readingTime,
        authorName: articles.authorName,
        createdAt: articles.createdAt,
        publishedAt: articles.publishedAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt))
      .limit(4);
  } catch {
    return [];
  }
}

async function getHomepageChallenges() {
  try {
    return await db
      .select({ id: challenges.id, title: challenges.title, description: challenges.description, category: challenges.category })
      .from(challenges)
      .where(eq(challenges.active, true))
      .orderBy(desc(challenges.createdAt))
      .limit(3);
  } catch {
    return [];
  }
}

async function getHomepageGuides() {
  try {
    const cols = {
      id: selfHelpGuides.id,
      title: selfHelpGuides.title,
      category: selfHelpGuides.category,
      difficulty: selfHelpGuides.difficulty,
      estimatedMinutes: selfHelpGuides.estimatedMinutes,
    };
    const featured = await db.select(cols).from(selfHelpGuides).where(eq(selfHelpGuides.featured, true)).limit(4);
    if (featured.length > 0) return featured;
    return await db.select(cols).from(selfHelpGuides).orderBy(desc(selfHelpGuides.createdAt)).limit(4);
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
        content: communityPosts.content,
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
      .limit(4);

    return rows.map((r) => ({
      title: r.title,
      excerpt: truncateWords(r.content, 110),
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

type CategoryWithCount = Awaited<ReturnType<typeof getHomepageCategories>>[number];
type ArticleRow = Awaited<ReturnType<typeof getHomepageArticles>>[number];
type ChallengeRow = Awaited<ReturnType<typeof getHomepageChallenges>>[number];
type GuideRow = Awaited<ReturnType<typeof getHomepageGuides>>[number];

const HOMEPAGE_SEED_CHALLENGES: ChallengeRow[] = [
  { id: -1, title: "Write it down", description: "Spend 5 minutes writing whatever's in your head. No structure, no goal — just get it out of your head and onto paper.", category: "daily" as ChallengeRow["category"] },
  { id: -2, title: "One honest conversation", description: "Tell someone — anyone — one true thing about how you're actually doing. Doesn't have to be deep. Just honest.", category: "daily" as ChallengeRow["category"] },
  { id: -3, title: "No phone for one hour", description: "Pick an hour today and put the phone in another room. Notice what fills the space.", category: "daily" as ChallengeRow["category"] },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
// This section intentionally sits outside the site's light/dark tokens —
// like most photo-led editorial heroes, it's a fixed warm-dark treatment
// so a headline over a photo stays legible regardless of site theme. The
// no-photo fallback uses the same fixed dark tones (not the light theme
// background) so contrast holds either way, before a real photo is added.

function HeroSection() {
  return (
    <section className="relative flex min-h-[88vh] items-end overflow-hidden sm:min-h-[92vh]">
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
          <p className="mt-7 max-w-md text-lg leading-relaxed text-white/70">
            Share what&apos;s real. Find your footing. You&apos;re not alone.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link href="/assessment">Check In</Link>
            </Button>
            <Link
              href="/stories"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <BookOpen className="h-4 w-4" /> Read Stories
            </Link>
          </div>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
            Free forever · No judgment · Private · Evidence-informed
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── What are you dealing with today ───────────────────────────────────────────
// Deliberately boxless — a flowing wrap of tiles rather than a bordered
// grid, per the "less component-library, more flow" direction. Tiles are
// real DB-backed categories, not a fixed hardcoded list, so every one
// actually goes somewhere.

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

// ─── Community — moved up, built to feel alive rather than like a forum ───────

function CommunityPulseSection({ posts }: { posts: CommunitySnippet[] }) {
  const display = posts.length > 0 ? posts : COMMUNITY_SEED;
  return (
    <section className="bg-secondary/25 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Community"
          title="Men are talking, right now"
          subtitle="Anonymous. Unfiltered. Ongoing."
          href="/community"
          linkLabel="Join the conversation"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {display.slice(0, 4).map((s, i) => (
            <Link key={i} href={s.href} className="group flex flex-col gap-3 rounded-2xl bg-card/80 p-6 transition-colors hover:bg-card">
              <p className="font-display text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                {s.title}
              </p>
              {s.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{s.excerpt}</p>}
              <div className="mt-1 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {s.replyCount} replies</span>
                <span className="opacity-50">·</span>
                <span>{s.time}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Intel — mixed "magazine" layout instead of repeated identical cards ──────

function ArticleMeta({ article, tone = "default", className = "" }: { article: ArticleRow; tone?: "default" | "onPhoto"; className?: string }) {
  const date = article.publishedAt ?? article.createdAt;
  const base = tone === "onPhoto" ? "text-white/65" : "text-muted-foreground";
  const catColor = tone === "onPhoto" ? "text-[#e3a463]" : "text-primary";
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] ${base} ${className}`}>
      {article.categoryName && <span className={catColor}>{article.categoryName}</span>}
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

function IntelMagazineSection({ articlesData }: { articlesData: ArticleRow[] }) {
  if (articlesData.length === 0) return null;
  const [feature, imageLeft, ...textOnly] = articlesData;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Intel" title="Useful reads" subtitle="No fluff. Written for men navigating real things." href="/intel" linkLabel="All reads" />

        {/* Large featured — image (or fixed dark gradient fallback) with
            bottom-aligned text, same legibility treatment as the hero. */}
        <Link
          href={`/intel/${feature!.slug}`}
          className="group relative mb-6 flex min-h-[24rem] flex-col justify-end overflow-hidden rounded-3xl p-8 sm:min-h-[28rem] sm:p-12"
        >
          {feature!.featuredImage ? (
            <img
              src={feature!.featuredImage}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#241a10] via-[#1c1710] to-[#141008]">
              <HorizonMotif className="h-full w-full text-[#c98a4b] opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c08] via-[#0f0c08]/45 to-transparent" />
          <ArticleMeta article={feature!} tone="onPhoto" className="relative mb-3" />
          <h3 className="relative max-w-2xl font-display text-3xl font-semibold leading-tight text-[#f6f2ea] transition-colors sm:text-4xl">
            {feature!.title}
          </h3>
          <p className="relative mt-2.5 max-w-xl text-[15px] text-white/70">{feature!.excerpt}</p>
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image-left half-width entry */}
          {imageLeft && (
            <Link href={`/intel/${imageLeft.slug}`} className="group flex overflow-hidden rounded-2xl bg-secondary/40">
              <div className="relative hidden w-2/5 shrink-0 sm:block">
                {imageLeft.featuredImage ? (
                  <img src={imageLeft.featuredImage} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-accent/50 to-secondary" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center p-6">
                <ArticleMeta article={imageLeft} className="mb-2.5" />
                <h4 className="font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {imageLeft.title}
                </h4>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{imageLeft.excerpt}</p>
              </div>
            </Link>
          )}

          {/* Text-only compact entries */}
          {textOnly.length > 0 && (
            <div className="flex flex-col divide-y divide-border/60 rounded-2xl bg-card/40 px-6">
              {textOnly.map((article) => (
                <Link key={article.id} href={`/intel/${article.slug}`} className="group py-5">
                  <ArticleMeta article={article} className="mb-2" />
                  <h4 className="font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {article.title}
                  </h4>
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{article.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Toolkit / Challenges / Check-in / Founder / Newsletter / Closing ─────────

function ToolkitPreviewSection({ guidesData }: { guidesData: GuideRow[] }) {
  if (guidesData.length === 0) return null;
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Toolkit" title="Something to actually do about it" subtitle="Short, practical guides — not another 40-minute video." href="/guides" linkLabel="Browse the toolkit" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {guidesData.slice(0, 4).map((guide) => (
            <Link key={guide.id} href="/guides" className="group flex flex-col rounded-2xl bg-card/70 p-5 transition-colors hover:bg-card">
              <span className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {String(guide.category).replace(/-/g, " ")}
              </span>
              <h4 className="mb-3 flex-1 font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                {guide.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {guide.estimatedMinutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {guide.estimatedMinutes} min</span>}
                {guide.difficulty && <span>{DIFFICULTY_LABEL[guide.difficulty] ?? guide.difficulty}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChallengesTeaserSection({ challengesData }: { challengesData: ChallengeRow[] }) {
  const displayChallenges = challengesData.length > 0 ? challengesData : HOMEPAGE_SEED_CHALLENGES;
  return (
    <section className="bg-secondary/25 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Take action" title="Small challenges, real momentum" subtitle="Feeling it is one thing. Doing something with it is another." href="/challenges" linkLabel="All challenges" />
        <div className="grid gap-5 md:grid-cols-3">
          {displayChallenges.slice(0, 3).map((challenge) => (
            <Link key={challenge.id} href="/challenges" className="group flex h-full flex-col rounded-2xl bg-pine/[0.07] p-6 transition-colors hover:bg-pine/[0.12]">
              <span className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-pine">{challenge.category}</span>
              <h4 className="mb-2.5 font-display text-base font-semibold leading-snug text-foreground">{challenge.title}</h4>
              <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{challenge.description}</p>
              <p className="flex items-center gap-1.5 text-xs font-medium text-pine">
                <CheckCircle2 className="h-3.5 w-3.5" /> Start this challenge
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CheckInSection() {
  const questions = [
    "Have you been keeping things to yourself lately?",
    "Do small things feel heavier than usual?",
    "Do you feel connected to yourself lately?",
    "When did you last feel genuinely okay?",
  ];
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Two minutes, in private</p>
          <h2 className="font-display text-[1.9rem] font-semibold text-foreground sm:text-3xl">Daily reflection</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            A short check-in — no diagnosis, no score. Just honest questions to help you understand where you&apos;re at.
          </p>
          <div className="mb-8 mt-7 space-y-3">
            {questions.map((q) => (
              <div key={q} className="flex items-start gap-3">
                <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <p className="text-sm text-muted-foreground">{q}</p>
              </div>
            ))}
          </div>
          <Button asChild size="lg" className="rounded-full px-7">
            <Link href="/assessment">Begin reflection</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FounderNoteSection() {
  return (
    <section className="bg-secondary/25 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">From the founder</p>
        <blockquote className="font-display text-2xl italic leading-snug text-foreground sm:text-[2rem]">
          &ldquo;I built this because I needed it — and it didn&apos;t exist.&rdquo;
        </blockquote>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Men Who Feel started as one man carrying too much with nowhere to put it. No drama.
          No big moment. Just the quiet realisation that most men are feeling things they&apos;ve
          never said out loud.
        </p>
        <Link href="/founders-story" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
          Read the full story <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Join, without joining anything</p>
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          A short note, once in a while
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          One new guide, one new challenge, and whatever else felt worth sending. That&apos;s the
          whole list — nothing to unsubscribe from in a hurry.
        </p>
        <div className="mt-7 flex justify-center">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
          You&apos;ve read this far. That means something.
        </h2>
        <p className="mb-7 mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Take one more step. No account, no record, no explaining yourself first.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/assessment">Start here</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link href="/stories">Read what others have shared</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// Order follows the requested flow: hero → what you're dealing with →
// community → intel → toolkit → challenges → newsletter → footer, with
// a private check-in and the founder's note as connective tissue in
// between rather than isolated stops. Stories still has its own full page
// and nav link — it's just no longer duplicated here, to keep this list
// tight rather than stacking on yet another near-identical section.

export default async function Home() {
  const [catsData, articlesData, challengesData, guidesData, communitySnippets] = await Promise.all([
    getHomepageCategories(),
    getHomepageArticles(),
    getHomepageChallenges(),
    getHomepageGuides(),
    getHomepageCommunityPosts(),
  ]);

  return (
    <div>
      <HeroSection />
      <StruggleSection cats={catsData} />
      <CommunityPulseSection posts={communitySnippets} />
      <IntelMagazineSection articlesData={articlesData} />
      <ToolkitPreviewSection guidesData={guidesData} />
      <ChallengesTeaserSection challengesData={challengesData} />
      <CheckInSection />
      <FounderNoteSection />
      <NewsletterSection />
      <FooterCTA />
    </div>
  );
}
