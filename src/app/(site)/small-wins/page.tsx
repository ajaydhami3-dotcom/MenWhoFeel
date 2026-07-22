import { Metadata } from "next";
import Link from "next/link";
import { getApprovedSmallWins } from "@/server/queries/career-hub";
import { ArrowUpRight, TrendingUp, Bot, Briefcase, Users, ClipboardCheck, Laptop } from "lucide-react";

export const revalidate = 300;

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Small Wins | Men Who Feel" },
  description: "Vetted, quick ways to earn while you rebuild — manually reviewed, no gimmicks.",
  alternates: { canonical: `${BASE_URL}/small-wins` },
};

const CATEGORY_LABELS: Record<string, string> = {
  ai_training: "AI Training",
  freelance: "Freelance",
  microtasks: "Microtasks",
  crowdsourcing: "Crowdsourcing",
  user_testing: "User Testing",
  remote_work: "Remote Work",
};

const CATEGORY_ICONS: Record<string, typeof Bot> = {
  ai_training: Bot,
  freelance: Briefcase,
  microtasks: ClipboardCheck,
  crowdsourcing: Users,
  user_testing: Laptop,
  remote_work: Laptop,
};

export default async function SmallWinsPage() {
  const wins = await getApprovedSmallWins();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Small Wins",
    description: "Vetted, quick ways to earn while rebuilding.",
    url: `${BASE_URL}/small-wins`,
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl">

        <div className="animate-fade-up rounded-2xl border border-border/70 bg-card/70 p-8 sm:p-12 mb-12">
          <p className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            <TrendingUp className="h-4 w-4" /> Work &amp; Financial Stability
          </p>
          <h1 className="font-display text-[2.4rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Small Wins
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Quick, legitimate ways to earn while you rebuild. Every listing here is reviewed by a person before it
            goes up — nothing automated, nothing pulled from a feed. If it isn&apos;t trustworthy, it isn&apos;t here.
          </p>
          <Link href="/career-hub" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80">
            Looking for a real job instead? Visit Career Hub →
          </Link>
        </div>

        {wins.length === 0 ? (
          <p className="py-16 text-center italic text-muted-foreground">
            We&apos;re still building out this list — check back soon.
          </p>
        ) : (
          <div className="space-y-3">
            {wins.map((win) => {
              const Icon = CATEGORY_ICONS[win.category] ?? Briefcase;
              return (
                <a
                  key={win.id}
                  href={win.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                        {win.title}
                      </h3>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {CATEGORY_LABELS[win.category] ?? win.category}
                      </span>
                      {win.payDetails && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {win.payDetails}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{win.description}</p>
                    {win.requirements && (
                      <p className="mt-1 text-xs text-muted-foreground/70">Needs: {win.requirements}</p>
                    )}
                    {win.trustNotes && (
                      <p className="mt-1 text-xs text-muted-foreground/70 italic">{win.trustNotes}</p>
                    )}
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
