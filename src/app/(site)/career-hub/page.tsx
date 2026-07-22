import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { pillars, categories, articles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getPillarResources } from "@/server/queries/pillar-content";
import { getFeaturedJobResources } from "@/server/queries/career-hub";
import { RESOURCE_ICONS } from "@/lib/category-style";
import { ArrowRight, ArrowUpRight, Briefcase, FileText, TrendingUp, ClipboardList, GraduationCap, Link2 } from "lucide-react";

export const revalidate = 300;

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Career Hub | Men Who Feel" },
  description: "Career guides, job resources, and practical tools for rebuilding stability after job loss or career stress.",
  alternates: { canonical: `${BASE_URL}/career-hub` },
};

// Career Hub belongs ONLY inside Work & Financial Stability, per the
// original brief — this page looks that pillar up once and reuses it,
// rather than being generic/pillar-scoped the way category and topic
// pages are. Career Intel and Career Guides below aren't new content
// types: they're the existing Work & Financial Stability Intel articles
// and Toolkit resources, re-surfaced here rather than duplicated into a
// second content system.
async function getWorkPillarContext() {
  try {
    const [pillar] = await db.select().from(pillars).where(eq(pillars.slug, "work-financial-stability")).limit(1);
    if (!pillar) return null;
    const [category] = await db.select().from(categories).where(eq(categories.pillarId, pillar.id)).limit(1);
    return { pillarId: pillar.id, categoryId: category?.id ?? null };
  } catch (err) {
    console.error("[career-hub] getWorkPillarContext failed:", err);
    return null;
  }
}

async function getCareerArticles(categoryId: number | null) {
  if (!categoryId) return [];
  try {
    return await db
      .select({ id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt })
      .from(articles)
      .where(and(eq(articles.categoryId, categoryId), eq(articles.status, "published")))
      .orderBy(desc(articles.createdAt))
      .limit(4);
  } catch (err) {
    console.error("[career-hub] getCareerArticles failed:", err);
    return [];
  }
}

const JOB_RESOURCE_ICONS: Record<string, typeof Briefcase> = {
  job_board: Briefcase,
  networking: TrendingUp,
  salary_research: FileText,
  company_research: FileText,
  recruiter: Briefcase,
  government_program: ClipboardList,
};

export default async function CareerHubPage() {
  const context = await getWorkPillarContext();
  const [careerArticles, careerGuides, jobResources] = await Promise.all([
    getCareerArticles(context?.categoryId ?? null),
    getPillarResources(context?.pillarId ?? null),
    getFeaturedJobResources(6),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Career Hub",
    description: "Career guides, job resources, and practical tools for rebuilding stability.",
    url: `${BASE_URL}/career-hub`,
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl">

        {/* Hero */}
        <div className="animate-fade-up rounded-2xl border border-border/70 bg-card/70 p-8 sm:p-12 mb-14">
          <p className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            <Briefcase className="h-4 w-4" /> Work &amp; Financial Stability
          </p>
          <h1 className="font-display text-[2.4rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Career Hub
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Career guides, job-search resources, and practical tools — whether you&apos;re rebuilding after a layoff
            or just want more stability than you have now.
          </p>
        </div>

        {/* Job Resources */}
        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Find work</p>
              <h2 className="font-display text-[1.6rem] font-semibold text-foreground sm:text-2xl">Job Resources</h2>
            </div>
          </div>
          {jobResources.length === 0 ? (
            <p className="italic text-muted-foreground">Job resources are being added — check back soon.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {jobResources.map((r) => {
                const Icon = JOB_RESOURCE_ICONS[r.category] ?? Link2;
                return (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                        {r.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                      {r.trustNotes && <p className="mt-1.5 text-xs text-muted-foreground/70">{r.trustNotes}</p>}
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* Career Guides — existing Toolkit content, this pillar only */}
        {careerGuides.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Apply it</p>
                <h2 className="font-display text-[1.6rem] font-semibold text-foreground sm:text-2xl">Career Guides</h2>
              </div>
              <Link href="/guides" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                Full toolkit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {careerGuides.map((resource) => {
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

        {/* Career Intel — existing Intel articles, this pillar only */}
        {careerArticles.length > 0 && (
          <section className="mb-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Learn</p>
                <h2 className="font-display text-[1.6rem] font-semibold text-foreground sm:text-2xl">Career Intel</h2>
              </div>
              <Link href="/intel" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
                All articles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {careerArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/intel/${article.slug}`}
                  className="group rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                >
                  <h3 className="mb-2 line-clamp-2 font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                    {article.title}
                  </h3>
                  {article.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Small Wins cross-link */}
        <section className="mb-14">
          <Link
            href="/small-wins"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 p-6 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-medium text-foreground">Need income now, not eventually?</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">Small Wins — vetted ways to earn while you rebuild.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        </section>

        {/* Resume Builder — real now, linked prominently */}
        <section className="mb-14">
          <Link
            href="/resume-builder"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 p-6 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-medium text-foreground">Resume Builder</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">Build it, get AI help with the wording, download a PDF.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        </section>

        {/* Honest placeholder for what's still not built — not hidden, not overpromised */}
        <section className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
          <GraduationCap className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <h3 className="font-display text-lg text-foreground">More on the way</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            An application tracker and courses are planned for Career Hub but not built yet.
          </p>
        </section>
      </div>
    </div>
  );
}
