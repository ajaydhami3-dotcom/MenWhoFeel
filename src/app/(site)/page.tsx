// Full server component — no tRPC hooks, no "use client".
// Data is fetched directly from the DB at request time and embedded in
// the HTML Google crawls.
//
// STRUCTURE, v2.3 — HYBRID: the v2.2 rule still holds for everything
// above the fold — reduce uncertainty about what this is, build trust
// that it's legitimate and safe, point to one clear next step. Check-In
// stays the single dominant CTA, unchanged, in the hero and at the close.
// See CHANGES.md for that full history.
//
// What's new in v2.3: the platform has grown a lot since v2.2 was written
// (Career Hub, Resume Builder, Small Wins, and Journeys didn't exist yet —
// none of them are mentioned in the v2.2 changelog). So below that proven
// opening, the page now does a second job for the visitor who scrolls
// past it wanting to know "is this actually a whole platform" — Pillars,
// Featured Tools, and a fuller Community moment. Every section still
// answers exactly one question; nothing was added "just in case."

import type { ElementType } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HorizonMotif from "@/components/HorizonMotif";
import {
  ArrowRight, MessageSquare, Brain, Briefcase, FileText, BookOpen, Compass,
  TrendingUp, Infinity as InfinityIcon, EyeOff, Sparkles, DoorOpen,
} from "lucide-react";
import { db } from "@/db";
import { articles, categories, communityPosts, communityComments, pillars, stories } from "@/db/schema";
import { eq, desc, sql, and, isNotNull } from "drizzle-orm";
import { formatDistanceToNowStrict } from "date-fns";
import { CATEGORY_TINTS, DEFAULT_TINT, PILLAR_ICONS, PILLAR_BG_TINTS } from "@/lib/category-style";

// Computed once at module evaluation, not inside a component body —
// Date.now() inside render is flagged as an impure call by React's
// purity rule (react-hooks/purity). "New" article badges below are a
// few days off in edge cases (a request that reuses a stale module
// instance) rather than wrong every render.
const NOW = Date.now();

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

// NEW (v2.3): a story's natural preview is its excerpt, not a reply
// count — a different content type from a community post, so it gets
// its own snippet shape instead of being forced into CommunitySnippet.
type StorySnippet = { title: string; excerpt: string; time: string; href: string };

const STORY_SEED: StorySnippet[] = [
  {
    title: "I finally told my brother I wasn't okay.",
    excerpt: "Three years of pretending, undone in one phone call I almost didn't make.",
    time: "1 day ago",
    href: "/stories",
  },
  {
    title: "What getting laid off actually taught me.",
    excerpt: "Not a comeback story. Just what the six months in between were really like.",
    time: "4 days ago",
    href: "/stories",
  },
];

// CATEGORY_TINTS / DEFAULT_TINT / PILLAR_ICONS now live in
// @/lib/category-style — shared with the category hub pages so a given
// category or pillar reads as the same color/icon everywhere it appears,
// not just here.

// ─── Data fetchers ────────────────────────────────────────────────────────────
// Every fetcher follows the file's existing convention: a direct, narrow
// Drizzle select, wrapped in try/catch, falling back to an empty result
// rather than throwing — a missing/unreachable DB degrades the homepage,
// never crashes it. Limits are trimmed to exactly what's displayed now —
// no point fetching four articles to show two.

// NEW (v2.3): powers PillarsSection. There's no dedicated pillar landing
// page yet (pillars only surface today through category/topic pages), so
// each card links to its pillar's *lead* category — resolved dynamically
// by sortOrder rather than hardcoded slugs, since Mental & Emotional
// Health alone currently has two categories under it (mental-health,
// emotions) and hardcoding would silently drift if that ever changes.
// A pillar with zero categories (shouldn't happen for the 4 seeded rows)
// is filtered out rather than rendered with a dead link.
async function getHomepagePillars() {
  try {
    const [pillarRows, categoryRows] = await Promise.all([
      db.select().from(pillars).orderBy(pillars.sortOrder),
      db
        .select({ id: categories.id, slug: categories.slug, pillarId: categories.pillarId })
        .from(categories)
        .where(isNotNull(categories.pillarId))
        .orderBy(categories.sortOrder),
    ]);

    // categoryRows is already ordered by sortOrder, so the first row seen
    // per pillarId is that pillar's lead category.
    const leadSlugByPillar = new Map<number, string>();
    for (const cat of categoryRows) {
      if (cat.pillarId != null && !leadSlugByPillar.has(cat.pillarId)) {
        leadSlugByPillar.set(cat.pillarId, cat.slug);
      }
    }

    return pillarRows
      .map((p) => ({ ...p, categorySlug: leadSlugByPillar.get(p.id) ?? null }))
      .filter((p): p is typeof p & { categorySlug: string } => p.categorySlug !== null);
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
        // Phase 12: prefer the pillar's color over the category's own
        // (same reasoning as the category/topic hero fix — the two
        // columns aren't kept in sync automatically).
        categoryColor: categories.color,
        pillarColor: pillars.color,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(pillars, eq(categories.pillarId, pillars.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt))
      .limit(3);
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

// NEW (v2.3): powers the Stories column in the expanded Trust/Community
// section. Featured stories first, then most recent — same ordering
// principle already used for weekly challenges elsewhere in the app.
// Stories route on id, not slug (see src/app/(site)/stories/[id]).
async function getHomepageStories(): Promise<StorySnippet[]> {
  try {
    const rows = await db
      .select({
        id: stories.id,
        title: stories.title,
        excerpt: stories.excerpt,
        content: stories.content,
        createdAt: stories.createdAt,
      })
      .from(stories)
      .where(eq(stories.status, "approved"))
      .orderBy(desc(stories.featured), desc(stories.createdAt))
      .limit(2);

    return rows.map((r) => ({
      title: r.title,
      excerpt: r.excerpt ?? `${r.content.slice(0, 140).trim()}…`,
      time: formatDistanceToNowStrict(new Date(r.createdAt), { addSuffix: true }),
      href: `/stories/${r.id}`,
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
  const effectiveColor = article.pillarColor ?? article.categoryColor ?? null;
  const tint = effectiveColor ? (CATEGORY_TINTS[effectiveColor] ?? DEFAULT_TINT) : null;
  const bgTint = effectiveColor ? (PILLAR_BG_TINTS[effectiveColor] ?? null) : null;
  const isNew = date ? (NOW - new Date(date).getTime()) / (1000 * 60 * 60 * 24) <= 14 : false;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {article.categoryName && tint && (
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] ${tint.text} ${bgTint?.bg ?? "bg-secondary"}`}
        >
          {article.categoryName}
        </span>
      )}
      {isNew && (
        <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-primary">
          New
        </span>
      )}
      <div className="flex flex-wrap items-center gap-x-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/80">
        {date && <span>{new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
        {article.readingTime && (
          <>
            {date && <span className="opacity-50">·</span>}
            <span>{article.readingTime} min</span>
          </>
        )}
      </div>
    </div>
  );
}

type PillarWithCategory = Awaited<ReturnType<typeof getHomepagePillars>>[number];
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
          // No real photography yet (see HERO_IMAGE_URL comment above) —
          // this is a richer stand-in for it, not a claim that it's a
          // photo: a layered dusk gradient plus the horizon motif reads
          // closer to the mockup's mood (a lone figure against a skyline
          // at dusk) than the previous flatter two-tone version, while
          // staying honest that it's still a placeholder.
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a1f14] via-[#1c1710] to-[#0f0c08]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(227,164,99,0.16),transparent_60%)]" />
            <HorizonMotif className="h-full w-full text-[#c98a4b] opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c08] via-[#0f0c08]/55 to-[#0f0c08]/10" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70">
            A platform built for modern men
          </span>
          {/* v2.3: promoted from tagline to mission headline (see
              CHANGES.md). The original headline is demoted below to an
              emotional subheading rather than dropped — a guarded
              first-time visitor still needs both the "what" and the
              "why here." The trust pill that used to sit here now lives
              in its own strip right below the hero (TrustBar) instead of
              competing with the headline for space. */}
          <h1 className="mt-5 font-display text-[2rem] font-medium leading-[1.15] tracking-tight text-[#f6f2ea] sm:text-5xl lg:text-6xl">
            Helping men build stronger minds, careers, relationships, and lives.
          </h1>
          <p className="mt-4 font-display text-xl italic leading-snug text-[#e3a463] sm:text-2xl">
            The one place you don&apos;t have to explain yourself.
          </p>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
            Free, anonymous support for men — no account, ever.
          </p>
          {/* Check-In stays the one dominant action — it's still first,
              still the only filled button, still the one with its own
              reassurance line. "Explore" sits beside it as a genuinely
              secondary, lower-commitment option for a visitor who wants
              to look around before deciding anything, not a competing
              decision of equal weight. */}
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href="/assessment">Check In</Link>
              </Button>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                2 minutes · No score · No diagnosis
              </p>
            </div>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full border border-white/25 px-7 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#pillars">Explore MenWhoFeel</Link>
            </Button>
          </div>
          <Link
            href="/stories"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/80 underline underline-offset-4 hover:text-white"
          >
            Or read what men have shared <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── 1b. Trust bar — a compact, scannable restatement ────────────────────────
// NEW (v2.3). Deliberately a thin strip with no heading of its own, not a
// full section — it restates facts the visitor already half-knows from
// the hero, in a more scannable form, without asking for a new decision.

const TRUST_ITEMS: { icon: ElementType; label: string }[] = [
  { icon: InfinityIcon, label: "Free forever" },
  { icon: EyeOff, label: "Anonymous" },
  { icon: Sparkles, label: "AI powered" },
  { icon: DoorOpen, label: "No account required" },
];

function TrustBar() {
  return (
    <section className="border-y border-border/40 py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 sm:justify-between sm:px-6 lg:px-8">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4 text-primary" />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── 2. The four pillars — reduce uncertainty this fits YOU ──────────────────
// Replaces the old StruggleSection's category pills — same job (help a
// visitor self-select into what's relevant), one level up the taxonomy,
// as large premium cards instead of small tiles. Running this *and* a
// separate category-pill section would be two mechanisms competing for
// the same decision, which is exactly what v2.2 was written to avoid, so
// this replaces it rather than joining it. No dedicated pillar landing
// page exists yet, so each card links to that pillar's lead category
// (see getHomepagePillars above).

function PillarsSection({ pillarsData }: { pillarsData: PillarWithCategory[] }) {
  if (pillarsData.length === 0) return null;
  return (
    <section id="pillars" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The four pillars"
          title="Everything here starts with one of four things"
          subtitle="Pick the one that's loudest right now — the rest connects from there."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          {pillarsData.map((pillar) => {
            const tint = CATEGORY_TINTS[pillar.color ?? "blue"] ?? DEFAULT_TINT;
            const bgTint = PILLAR_BG_TINTS[pillar.color ?? ""] ?? PILLAR_BG_TINTS.amber!;
            const Icon = PILLAR_ICONS[pillar.icon ?? ""] ?? Brain;
            return (
              <Link
                key={pillar.id}
                href={`/category/${pillar.categorySlug}`}
                className={`group rounded-2xl border ${bgTint.border} bg-card/70 p-8 transition-colors hover:bg-card`}
              >
                <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${bgTint.bg}`}>
                  <Icon className={`h-5 w-5 ${tint.text}`} />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">{pillar.name}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{pillar.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── 3. Featured tools — reduce uncertainty this is a whole platform ─────────
// NEW (v2.3). This is what v2.2 called "Toolkit preview and Challenges
// preview" and cut for competing with the one dominant CTA — added back
// deliberately now, because the platform has grown enough since then
// (Career Hub, Resume Builder, and Small Wins didn't exist yet) that
// "what else is here" has become a real question worth a section. Static
// copy, not DB-backed — this describes the tools themselves, which don't
// change day to day, not content that does. "Journeys" links to
// /challenges — there's no dedicated overview page for the three new
// pillar journeys yet, only their individual detail pages.

type FeaturedTool = { icon: ElementType; title: string; description: string; href: string; badge?: string };

const FEATURED_TOOLS: FeaturedTool[] = [
  {
    icon: FileText,
    title: "Resume Builder",
    description: "Fill it in, get AI help tightening the wording, download a clean PDF. No sign-up required to start.",
    href: "/resume-builder",
    badge: "AI",
  },
  {
    icon: BookOpen,
    title: "Toolkit",
    description: "Curated resources across every pillar — videos, guides, worksheets. No paywall, just useful things.",
    href: "/guides",
  },
  {
    icon: Briefcase,
    title: "Career Hub",
    description: "Job leads, interview prep, and practical career tools — for rebuilding after a layoff or just wanting more stability.",
    href: "/career-hub",
  },
  {
    icon: Compass,
    title: "Journeys",
    description: "Structured 21-day paths built around real pillars — one small, doable thing each day.",
    href: "/challenges",
  },
  {
    icon: TrendingUp,
    title: "Small Wins",
    description: "Quick, legitimate ways to earn while you rebuild — every listing reviewed by a person, nothing automated.",
    href: "/small-wins",
  },
];

function FeaturedToolsSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Built to be used"
          title="The tools, not just the talk"
          subtitle="Everything below is live right now — no waitlist, nothing gated."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl border border-border/60 bg-card/70 p-7 transition-colors hover:bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <tool.icon className="h-5 w-5 text-primary" />
                </div>
                {tool.badge && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                    {tool.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{tool.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 4. Trust — who built this, and proof real men are actually here ─────────
// Founder note, community snippets, and the hard trust facts used to be
// three separate sections; v2.2 merged them into one so they weren't
// competing for attention. v2.3 adds a third column — recent stories —
// alongside the existing founder note and community discussions, rather
// than giving Stories and Founder Mission their own full-width sections
// each. Same reasoning as v2.2: one section, one job (build trust), just
// with a third kind of proof now that Stories exist as tagged, approved
// content worth surfacing here.

function TrustSection({ posts, storiesData }: { posts: CommunitySnippet[]; storiesData: StorySnippet[] }) {
  const display = (posts.length > 0 ? posts : COMMUNITY_SEED).slice(0, 2);
  const displayStories = (storiesData.length > 0 ? storiesData : STORY_SEED).slice(0, 2);
  return (
    <section className="bg-secondary/25 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why trust this" title="Built by someone who needed it. Used by men who need it now." />
        <div className="grid gap-12 lg:grid-cols-3">
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
            <Link href="/founders-story" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
              Read the full story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Recent stories
            </p>
            <div className="space-y-4">
              {displayStories.map((s, i) => (
                <Link key={i} href={s.href} className="group block rounded-2xl border border-border/60 bg-card/80 p-5 transition-colors hover:bg-card">
                  <p className="font-display text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                    {s.title}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{s.excerpt}</p>
                  <div className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">{s.time}</div>
                </Link>
              ))}
            </div>
            <Link href="/stories" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
              Read more stories <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Men are actually here
            </p>
            <div className="space-y-4">
              {display.map((s, i) => (
                <Link key={i} href={s.href} className="group block rounded-2xl border border-border/60 bg-card/80 p-5 transition-colors hover:bg-card">
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

// ─── 5. Reading — the lowest-vulnerability next step ──────────────────────────
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
        <div className="grid gap-4 sm:grid-cols-3">
          {articlesData.map((article) => (
            <Link key={article.id} href={`/intel/${article.slug}`} className="group rounded-2xl border border-border/60 bg-card/70 p-6 transition-colors hover:bg-card">
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

// ─── 6. Closing — one unambiguous next step, restated ─────────────────────────

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
  const [pillarsData, articlesData, communitySnippets, storiesData] = await Promise.all([
    getHomepagePillars(),
    getHomepageArticles(),
    getHomepageCommunityPosts(),
    getHomepageStories(),
  ]);

  return (
    <div>
      <HeroSection />
      <TrustBar />
      <PillarsSection pillarsData={pillarsData} />
      <FeaturedToolsSection />
      <TrustSection posts={communitySnippets} storiesData={storiesData} />
      <ReadingSection articlesData={articlesData} />
      <ClosingSection />
    </div>
  );
}