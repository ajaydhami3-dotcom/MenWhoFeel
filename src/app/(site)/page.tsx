// Full server component — no tRPC hooks, no "use client".
// Stories and articles are now fetched directly from the DB at request time
// and embedded in the HTML Google crawls.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen, MessageSquare, ArrowRight, Shield, Lock,
  Quote, Brain, HeartPulse, Dumbbell, Briefcase, Flame, TrendingUp,
  Target, CheckCircle2,
} from "lucide-react";
import { db } from "@/db";
import { stories, articles, categories, topics, challenges } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { ElementType } from "react";

// ─── Static content ───────────────────────────────────────────────────────────

const HERO_SNIPPETS = [
  { quote: "I'm exhausted pretending I'm okay.", handle: "anonymous", age: 31 },
  { quote: "Everyone depends on me and I'm tired.", handle: "anonymous", age: 28 },
  { quote: "I don't know how to talk about what's going on.", handle: "anonymous", age: 35 },
  { quote: "I can't remember the last time I felt calm.", handle: "anonymous", age: 42 },
];

const COMMUNITY_SNIPPETS = [
  { quote: "Some days holding yourself together takes everything. I finally said it out loud and it helped.", handle: "m_uk", age: 34, time: "2 hours ago" },
  { quote: "Lost my job three months ago. Still haven't told my dad. Not sure why I'm ashamed.", handle: "anon", age: 29, time: "5 hours ago" },
  { quote: "Therapy felt too clinical. This felt like talking to someone who actually gets it.", handle: "anon", age: 38, time: "yesterday" },
  { quote: "Small improvements matter. I just started sleeping 7 hours and it changed something.", handle: "dk_anon", age: 25, time: "1 day ago" },
  { quote: "You don't have to carry everything silently. I learned that here.", handle: "anon", age: 44, time: "2 days ago" },
  { quote: "I don't know what I'm doing but at least I know I'm not the only one who doesn't.", handle: "anon", age: 31, time: "3 days ago" },
];

// Category icons — complete class strings for Tailwind v4 scanner
const CAT_ICONS: Record<string, ElementType> = {
  blue: Brain, rose: HeartPulse, green: Dumbbell,
  emerald: Briefcase, amber: Flame, purple: TrendingUp,
};
const CAT_STYLE: Record<string, { accent: string; bg: string; border: string; icon: string }> = {
  blue:    { accent: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    icon: "text-blue-400" },
  rose:    { accent: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20",    icon: "text-rose-400" },
  green:   { accent: "text-green-400",   bg: "bg-green-400/10",   border: "border-green-400/20",   icon: "text-green-400" },
  emerald: { accent: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: "text-emerald-400" },
  amber:   { accent: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   icon: "text-amber-400" },
  purple:  { accent: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20",  icon: "text-purple-400" },
};
const DEFAULT_CAT_STYLE = CAT_STYLE.blue!;

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getHomepageCategories() {
  try {
    const cats = await db
      .select()
      .from(categories)
      .orderBy(categories.sortOrder);

    // Single query for all article counts by category
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

async function getHomepageTopics() {
  try {
    return await db
      .select({
        id: topics.id,
        name: topics.name,
        slug: topics.slug,
        description: topics.description,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryColor: categories.color,
      })
      .from(topics)
      .leftJoin(categories, eq(topics.categoryId, categories.id))
      // sortOrder = 1 gives us the "primary" topic from each category (6 total)
      .where(eq(topics.sortOrder, 1))
      .orderBy(categories.sortOrder);
  } catch {
    return [];
  }
}

async function getHomepageStories() {
  try {
    return await db
      .select({
        id: stories.id,
        title: stories.title,
        excerpt: stories.excerpt,
        authorName: stories.authorName,
      })
      .from(stories)
      .where(eq(stories.status, "approved"))
      .orderBy(desc(stories.createdAt))
      .limit(3);
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
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt))
      .limit(3);
  } catch {
    return [];
  }
}

async function getHomepageChallenges() {
  try {
    return await db
      .select({
        id: challenges.id,
        title: challenges.title,
        description: challenges.description,
        category: challenges.category,
      })
      .from(challenges)
      .where(eq(challenges.active, true))
      .orderBy(desc(challenges.createdAt))
      .limit(3);
  } catch {
    return [];
  }
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
              Anonymous · Free · No account needed
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5 text-foreground">
              The one place you don&apos;t have to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                explain yourself.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-5 leading-relaxed max-w-lg">
              Share what&apos;s real. Find your footing. You&apos;re not alone.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-8">
              <Lock className="h-3 w-3" />
              Anonymous. No account. Nothing tied to you.
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/assessment">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold px-7 py-5 shadow-lg shadow-blue-500/20 transition-all">
                  Check In
                </Button>
              </Link>
              <Link href="/stories">
                <Button size="lg" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-7 py-5">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Read Stories
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HERO_SNIPPETS.map((s, i) => (
              <Card key={i} className="bg-card/70 backdrop-blur-sm border-border/40 card-glow">
                <CardContent className="p-5">
                  <Quote className="h-4 w-4 text-blue-500/40 mb-2" />
                  <p className="text-sm text-foreground leading-relaxed mb-3 font-medium">&ldquo;{s.quote}&rdquo;</p>
                  <p className="text-xs text-muted-foreground">{s.handle}, {s.age}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type CategoryWithCount = Awaited<ReturnType<typeof getHomepageCategories>>[number];
type TopicRow = Awaited<ReturnType<typeof getHomepageTopics>>[number];
type StoryRow = Awaited<ReturnType<typeof getHomepageStories>>[number];
type ArticleRow = Awaited<ReturnType<typeof getHomepageArticles>>[number];
type ChallengeRow = Awaited<ReturnType<typeof getHomepageChallenges>>[number];

const HOMEPAGE_SEED_CHALLENGES: ChallengeRow[] = [
  { id: -1, title: "Write it down", description: "Spend 5 minutes writing whatever's in your head. No structure, no goal — just get it out of your head and onto paper.", category: "daily" },
  { id: -2, title: "One honest conversation", description: "Tell someone — anyone — one true thing about how you're actually doing. Doesn't have to be deep. Just honest.", category: "daily" },
  { id: -3, title: "No phone for one hour", description: "Pick an hour today and put the phone in another room. Notice what fills the space.", category: "daily" },
];

function CategoryExplorer({ cats }: { cats: CategoryWithCount[] }) {
  if (cats.length === 0) return null;
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#060810]/60 border-y border-border/10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Explore by topic</h2>
          <p className="text-muted-foreground mt-1 text-sm">Find what you need. No need to explain why.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((cat) => {
            const s = CAT_STYLE[cat.color ?? "blue"] ?? DEFAULT_CAT_STYLE;
            const Icon = CAT_ICONS[cat.color ?? "blue"] ?? Brain;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`p-6 rounded-xl border ${s.bg} ${s.border} hover:opacity-90 transition-all group`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={`w-5 h-5 ${s.icon}`} />
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${s.accent}`}>
                    {cat.articleCount} article{cat.articleCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-white transition-colors mb-2 leading-tight">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TopicsExplorer({ topicsData }: { topicsData: TopicRow[] }) {
  if (topicsData.length === 0) return null;
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Where do you want to start?</h2>
            <p className="text-muted-foreground mt-1 text-sm">Pick a topic. Everything inside it was written for you.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicsData.map((topic) => {
            const s = CAT_STYLE[topic.categoryColor ?? "blue"] ?? DEFAULT_CAT_STYLE;
            return (
              <Link
                key={topic.id}
                href={`/topic/${topic.slug}`}
                className="p-5 rounded-xl bg-card/60 border border-border/30 hover:border-blue-500/30 transition-all group"
              >
                {topic.categoryName && (
                  <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${s.accent} mb-2 block`}>
                    {topic.categoryName}
                  </span>
                )}
                <h3 className="font-bold text-foreground group-hover:text-white transition-colors mb-2 leading-snug">
                  {topic.name}
                </h3>
                {topic.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LatestArticlesSection({ articlesData }: { articlesData: ArticleRow[] }) {
  if (articlesData.length === 0) return null;
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#060810]/60 border-y border-border/10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Useful Reads</h2>
            <p className="text-muted-foreground mt-1 text-sm">No fluff. Written for men navigating real things.</p>
          </div>
          <Link href="/intel">
            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              All reads <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {articlesData.map((article) => (
            <Link key={article.id} href={`/intel/${article.slug}`}>
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.01] card-glow flex flex-col">
                <CardHeader className="pb-2">
                  {article.categoryName && article.categorySlug && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 block">
                      {article.categoryName}
                    </span>
                  )}
                  <CardTitle className="text-base font-semibold line-clamp-2 text-foreground">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <p className="text-xs text-blue-400 font-medium">Read article</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const HOMEPAGE_SEED_STORIES = [
  { id: -1, title: "The day I finally admitted I wasn't okay", excerpt: "I'd been telling everyone I was fine for about two years. Nothing was visibly wrong. But something was off.", authorName: "anon" },
  { id: -2, title: "Redundancy at 43 — what nobody tells you", excerpt: "The money thing was stressful. But nobody warned me about losing my identity along with the job.", authorName: "t_manchester" },
  { id: -3, title: "I started therapy and it wasn't what I expected", excerpt: "I thought I'd be lying on a couch. What happened was someone asked a question I'd never considered before.", authorName: "anon" },
];

function StoriesSection({ storiesData }: { storiesData: StoryRow[] }) {
  const displayStories = storiesData.length > 0 ? storiesData : HOMEPAGE_SEED_STORIES;
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Men talking honestly</h2>
            <p className="text-muted-foreground mt-1 text-sm">Real situations. No polish.</p>
          </div>
          <Link href="/stories">
            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              All stories <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {displayStories.slice(0, 3).map((story) => (
            <Link key={story.id} href={story.id > 0 ? `/stories/${story.id}` : "/stories"}>
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.01] card-glow flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold line-clamp-2 text-foreground">
                    {story.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {story.excerpt}
                  </p>
                  <p className="text-xs text-muted-foreground">By {story.authorName}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderStoryTeaser() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-[#060810] to-teal-950/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-teal-500/5 pointer-events-none" />
          <div className="relative grid lg:grid-cols-2 gap-0 items-stretch">
            <div className="p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-blue-500/10">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-blue-400 mb-5">From the founder</p>
              <blockquote className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-5">
                &ldquo;I built this because I needed it — and it didn&apos;t exist.&rdquo;
              </blockquote>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Men Who Feel started as one man carrying too much with nowhere to put it. No drama.
                No big moment. Just the quiet realisation that most men are feeling things they&apos;ve
                never said out loud — and that maybe a space with no name attached could change that.
              </p>
              <Link href="/founders-story">
                <Button variant="outline" className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 group">
                  Read the full story
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="p-8 sm:p-10 flex flex-col justify-center gap-5">
              {[
                { label: "Built anonymously", desc: "No brand agenda. No investors to please. Built by someone who needed it." },
                { label: "No clinical jargon", desc: "This isn't therapy. It's a space — honest, private, and built around how men actually talk." },
                { label: "Still here for a reason", desc: "Men keep coming back because it's the one place they don't have to explain themselves first." },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-0.5">{item.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunitySnippetsSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#060810]/60 border-y border-border/10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-foreground">What men talk about here</h2>
          <p className="text-muted-foreground mt-1 text-sm">Anonymous. Unfiltered. Ongoing.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMUNITY_SNIPPETS.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-card/60 border border-border/30 hover:border-blue-500/20 transition-colors">
              <p className="text-sm text-foreground leading-relaxed mb-3">&ldquo;{s.quote}&rdquo;</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.handle}, {s.age}</span>
                <span className="text-xs text-muted-foreground/50">{s.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/community">
            <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              <MessageSquare className="h-4 w-4 mr-2" />
              Join the conversation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CheckInSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-2">Daily Reflection</h2>
          <p className="text-muted-foreground mb-1 text-sm leading-relaxed">
            A short check-in — no diagnosis, no score. Just honest questions to help you understand where you&apos;re at.
          </p>
          <p className="text-muted-foreground mb-5 text-xs">Takes 2 minutes. No diagnosis.</p>
          <div className="space-y-2 mb-6">
            {[
              "Have you been keeping things to yourself lately?",
              "Do small things feel heavier than usual?",
              "Do you feel connected to yourself lately?",
              "When did you last feel genuinely okay?",
            ].map((q) => (
              <div key={q} className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/20">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <p className="text-sm text-muted-foreground">{q}</p>
              </div>
            ))}
          </div>
          <Link href="/assessment">
            <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold shadow-md shadow-blue-500/20">
              Begin Reflection
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ChallengesTeaserSection({ challengesData }: { challengesData: ChallengeRow[] }) {
  const displayChallenges = challengesData.length > 0 ? challengesData : HOMEPAGE_SEED_CHALLENGES;
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#060810]/60 border-y border-border/10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                Take action
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">Small challenges, real momentum</h2>
            <p className="text-muted-foreground mt-1 text-sm">Feeling it is one thing. Doing something with it is another.</p>
          </div>
          <Link href="/challenges">
            <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              All challenges <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {displayChallenges.slice(0, 3).map((challenge) => (
            <Link key={challenge.id} href="/challenges">
              <Card className="h-full bg-card/80 backdrop-blur-sm border-border/40 hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.01] card-glow flex flex-col">
                <CardHeader className="pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">
                    {challenge.category}
                  </span>
                  <CardTitle className="text-base font-semibold line-clamp-2 text-foreground">
                    {challenge.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {challenge.description}
                  </p>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Start this challenge
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border/20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-5">
          <Shield className="h-3 w-3" />
          Anonymous. Free. Always.
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          You&apos;ve read this far. That means something.
        </h2>
        <p className="text-muted-foreground mb-7 leading-relaxed text-sm">
          Take one more step. No account, no record, no explaining yourself first.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/assessment">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold px-8 shadow-lg shadow-blue-500/20">
              Start here
            </Button>
          </Link>
          <Link href="/stories">
            <Button size="lg" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-8">
              Read what others have shared
            </Button>
          </Link>
        </div>
        <p className="mt-10 text-xs text-muted-foreground/50">
          This space is free and always will be.{" "}
          <a
            href="https://ko-fi.com/menwhofeel"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
          >
            If it&apos;s helped, you&apos;re welcome to keep it going →
          </a>
        </p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [catsData, topicsData, storiesData, articlesData, challengesData] = await Promise.all([
    getHomepageCategories(),
    getHomepageTopics(),
    getHomepageStories(),
    getHomepageArticles(),
    getHomepageChallenges(),
  ]);

  return (
    <div className="space-y-0">
      <HeroSection />
      <CategoryExplorer cats={catsData} />
      <LatestArticlesSection articlesData={articlesData} />
      <TopicsExplorer topicsData={topicsData} />
      <StoriesSection storiesData={storiesData} />
      <FounderStoryTeaser />
      <CommunitySnippetsSection />
      <CheckInSection />
      <ChallengesTeaserSection challengesData={challengesData} />
      <FooterCTA />
    </div>
  );
}
