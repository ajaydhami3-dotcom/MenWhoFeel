"use client";

import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PlayCircle, FileText, Briefcase, Brain,
  HeartPulse, Dumbbell, Stethoscope, Handshake, Lock, BookOpen,
  Search, LayoutGrid, ChevronRight, ArrowLeft, ExternalLink, Loader2,
} from "lucide-react";
import Link from "next/link";

// ─── Seed data with updated category names ───────────────────────────────────
const SEED_RESOURCES: Record<string, Array<{ id: string; name: string; url: string; type: string; category: string }>> = {
  "Mental & Emotional Health": [
    { id: "s1", name: "How to process difficult emotions — a practical guide", url: "https://www.headspace.com/mindfulness/emotional-wellness", type: "link", category: "Mental & Emotional Health" },
    { id: "s2", name: "Man Therapy — humour-forward mental health resource for men", url: "https://mantherapy.org", type: "link", category: "Mental & Emotional Health" },
    { id: "s3", name: "Lost Connections by Johann Hari — why we get depressed and how to reconnect", url: "https://www.goodreads.com/book/show/34921573", type: "book", category: "Mental & Emotional Health" },
    { id: "s13", name: "Emotional intelligence in men — what it actually means and why it matters", url: "https://www.psychologytoday.com/us/basics/emotional-intelligence", type: "link", category: "Mental & Emotional Health" },
  ],
  "Work & Financial Stability": [
    { id: "s4", name: "Budgeting for people who hate budgeting — simple framework", url: "https://www.moneysavingexpert.com/banking/budget-planning", type: "link", category: "Work & Financial Stability" },
    { id: "s5", name: "The Total Money Makeover by Dave Ramsey — debt-free plan", url: "https://www.goodreads.com/book/show/78427", type: "book", category: "Work & Financial Stability" },
    { id: "s6", name: "Free Introduction to Personal Finance — Khan Academy", url: "https://www.khanacademy.org/college-careers-more/personal-finance", type: "video", category: "Work & Financial Stability" },
    { id: "s14", name: "Workplace stress and burnout — when work stops feeling worth it", url: "https://www.mind.org.uk/information-support/tips-for-everyday-living/work/work-and-mental-health", type: "link", category: "Work & Financial Stability" },
  ],
  "Relationships & Stress": [
    { id: "s7", name: "4-7-8 breathing explained — simple panic reset", url: "https://www.healthline.com/health/4-7-8-breathing", type: "link", category: "Relationships & Stress" },
    { id: "s8", name: "How to stop a fight before it starts — communication basics", url: "https://www.gottman.com/blog/manage-conflict-in-relationships", type: "link", category: "Relationships & Stress" },
    { id: "s9", name: "Why Men Don't Ask for Help — Andrew Fuller (TEDx)", url: "https://www.youtube.com/results?search_query=why+men+dont+ask+for+help+tedx", type: "video", category: "Relationships & Stress" },
    { id: "s15", name: "Anger management that actually works — beyond counting to 10", url: "https://www.apa.org/topics/anger/control", type: "link", category: "Relationships & Stress" },
  ],
  "Physical Wellbeing": [
    { id: "s10", name: "Sleep hygiene — what actually works and what doesn't", url: "https://www.sleepfoundation.org/sleep-hygiene", type: "link", category: "Physical Wellbeing" },
    { id: "s11", name: "5-minute morning movement — no gym required", url: "https://www.youtube.com/results?search_query=5+minute+morning+stretch+men", type: "video", category: "Physical Wellbeing" },
    { id: "s12", name: "Why exercise is the closest thing to a mental health cure", url: "https://www.apa.org/topics/exercise-fitness/stress", type: "link", category: "Physical Wellbeing" },
    { id: "s16", name: "Testosterone, diet, and lifestyle — what the evidence actually says", url: "https://www.healthline.com/nutrition/8-ways-to-boost-testosterone", type: "link", category: "Physical Wellbeing" },
  ],
};

const CATEGORY_CONFIG = {
  "Mental & Emotional Health": {
    icon: Brain,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    gradient: "from-blue-500/20 to-transparent",
    description: "Understand your mind, manage your emotions, build real resilience.",
  },
  "Work & Financial Stability": {
    icon: Briefcase,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    gradient: "from-emerald-500/20 to-transparent",
    description: "Take control of your money, your career, and your sense of security.",
  },
  "Relationships & Stress": {
    icon: HeartPulse,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    gradient: "from-rose-500/20 to-transparent",
    description: "Navigate pressure, conflict, and connection without burning out.",
  },
  "Physical Wellbeing": {
    icon: Dumbbell,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    gradient: "from-amber-500/20 to-transparent",
    description: "Sleep, movement, energy — the physical foundation everything else runs on.",
  },
};

const TYPE_ICONS = { video: PlayCircle, pdf: FileText, book: BookOpen, link: LayoutGrid };
const TYPE_COLORS: Record<string, string> = {
  video: "bg-blue-500 text-white",
  pdf: "bg-rose-500 text-white",
  book: "bg-amber-500 text-white",
  link: "bg-zinc-600 text-white",
};
const CATEGORIES = Object.keys(CATEGORY_CONFIG);
const PAGE_SIZE = 12;

// ─── Category drill-down view ─────────────────────────────────────────────────
function CategoryView({ category, onBack, usingSeed, seedItems }: {
  category: string;
  onBack: () => void;
  usingSeed: boolean;
  seedItems: any[];
}) {
  const [activeType, setActiveType] = useState<"all" | "video" | "pdf" | "book" | "link">("all");
  const [offset, setOffset] = useState(0);

  useEffect(() => { setOffset(0); }, [activeType]);

  const { data, isFetching } = trpc.guides.getResourcesByCategory.useQuery(
    { category, type: activeType, limit: PAGE_SIZE, offset },
    { enabled: !usingSeed, keepPreviousData: true }
  );

  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
  const Icon = config?.icon ?? Brain;

  const items = usingSeed
    ? seedItems.filter((i) => activeType === "all" || i.type === activeType)
    : (data?.items ?? []);
  const total = usingSeed ? items.length : (data?.total ?? 0);
  const hasMore = usingSeed ? false : (data?.hasMore ?? false);

  const typeCounts = usingSeed
    ? {
        video: seedItems.filter((i) => i.type === "video").length,
        pdf: seedItems.filter((i) => i.type === "pdf").length,
        book: seedItems.filter((i) => i.type === "book").length,
        link: seedItems.filter((i) => i.type === "link").length,
      }
    : { video: 0, pdf: 0, book: 0, link: 0 };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Support & Growth
      </button>

      <div className={`rounded-2xl border ${config?.border} ${config?.bg} p-6 mb-8`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-card/60 shrink-0`}>
            <Icon className={`h-7 w-7 ${config?.color}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{category}</h2>
            <p className="text-sm text-muted-foreground mt-1">{config?.description}</p>
          </div>
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "video", "pdf", "book", "link"] as const).map((t) => {
          const TabIcon = t === "all" ? LayoutGrid : TYPE_ICONS[t];
          const count = t === "all" ? total : typeCounts[t];
          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeType === t
                  ? (t === "all" ? "bg-primary text-primary-foreground" : TYPE_COLORS[t])
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {!usingSeed && t !== "all" && <span className="opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      {isFetching && offset === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 border border-dashed border-border/40 rounded-xl text-center text-muted-foreground italic">
          Nothing in this category yet.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => {
            const ItemIcon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] ?? LayoutGrid;
            return (
              <Link
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-transparent hover:border-border/40 hover:bg-secondary/30 transition-all"
              >
                <div className={`p-1.5 rounded-lg ${TYPE_COLORS[item.type] ?? "bg-zinc-700 text-white"} shrink-0`}>
                  <ItemIcon className="h-3.5 w-3.5" />
                </div>
                <p className="text-sm font-medium flex-1 group-hover:text-primary transition-colors leading-snug">
                  {item.name}
                </p>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {!usingSeed && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/20">
          <span className="text-xs text-muted-foreground">
            Showing {Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex gap-2">
            {offset > 0 && (
              <button
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                Previous
              </button>
            )}
            {hasMore && (
              <button
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                disabled={isFetching}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
              >
                {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Load more
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Search results panel ─────────────────────────────────────────────────────
function SearchResults({ term }: { term: string }) {
  const { data: results, isFetching } = trpc.guides.searchResources.useQuery(
    { term },
    { enabled: term.length > 1 }
  );

  if (isFetching) return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
      <Loader2 className="w-4 h-4 animate-spin" /> Searching...
    </div>
  );
  if (!results?.length) return (
    <p className="text-muted-foreground italic text-sm py-8">No results for "{term}"</p>
  );

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-4">{results.length} result{results.length !== 1 ? "s" : ""}</p>
      {results.map((item: any) => {
        const ItemIcon = TYPE_ICONS[item.type as keyof typeof TYPE_ICONS] ?? LayoutGrid;
        return (
          <Link
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-3.5 rounded-xl border border-transparent hover:border-border/40 hover:bg-secondary/30 transition-all"
          >
            <div className={`p-1.5 rounded-lg ${TYPE_COLORS[item.type] ?? "bg-zinc-700 text-white"} shrink-0`}>
              <ItemIcon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors leading-snug">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const { data: resources, isLoading } = trpc.guides.getAllResources.useQuery();
  const { data: summaries } = trpc.guides.getCategorySummaries.useQuery();

  const usingSeed = !resources || resources.length === 0;

  const categoryCounts = useMemo(() => {
    const result: Record<string, { total: number; byType: Record<string, number> }> = {};
    if (summaries && summaries.length > 0) {
      for (const s of summaries) result[s.category] = { total: s.total, byType: s.byType };
    } else {
      for (const [cat, items] of Object.entries(SEED_RESOURCES)) {
        const byType: Record<string, number> = {};
        for (const item of items) byType[item.type] = (byType[item.type] ?? 0) + 1;
        result[cat] = { total: items.length, byType };
      }
    }
    return result;
  }, [summaries, usingSeed]);

  const isSearching = searchTerm.length > 1;

  if (openCategory) {
    const seedItems = SEED_RESOURCES[openCategory] ?? [];
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="mx-auto max-w-3xl">
          <CategoryView
            category={openCategory}
            onBack={() => setOpenCategory(null)}
            usingSeed={usingSeed}
            seedItems={seedItems}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Free resources</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-gradient">Support & Growth</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            Curated resources across mental health, money, stress, and physical wellbeing. No sign-up. No paywall. Just useful things.
          </p>
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search videos, books, topics..."
              className="pl-10 h-12 bg-secondary/30 border-border/50 text-base rounded-xl focus-visible:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isSearching ? (
          <div className="mb-16">
            <h2 className="text-lg font-semibold mb-4">Search results</h2>
            <SearchResults term={searchTerm} />
          </div>
        ) : (
          <>
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-semibold">Available now</h2>
                <span className="px-3 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full border border-primary/30">
                  Free
                </span>
              </div>

              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-40 rounded-2xl bg-card/40 border border-border/40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-5">
                  {CATEGORIES.map((cat) => {
                    const config = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
                    const Icon = config.icon;
                    const counts = categoryCounts[cat] ?? { total: 0, byType: {} };
                    const typeEntries = Object.entries(counts.byType).filter(([, v]) => v > 0);

                    return (
                      <button
                        key={cat}
                        onClick={() => setOpenCategory(cat)}
                        className={`group text-left w-full rounded-2xl border ${config.border} bg-card/40 hover:bg-card/70 backdrop-blur-sm transition-all duration-200 hover:shadow-lg overflow-hidden`}
                      >
                        {/* Top gradient accent */}
                        <div className={`h-1 w-full bg-gradient-to-r ${config.gradient}`} />
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-start gap-3.5">
                              <div className={`p-2.5 rounded-xl ${config.bg} shrink-0`}>
                                <Icon className={`h-5 w-5 ${config.color}`} />
                              </div>
                              <div>
                                <h3 className="font-bold text-base leading-tight text-foreground">{cat}</h3>
                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{config.description}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap pt-4 border-t border-border/20">
                            {counts.total === 0 ? (
                              <span className="text-xs text-muted-foreground italic">No resources yet</span>
                            ) : (
                              <>
                                {typeEntries.map(([type, count]) => {
                                  const TIcon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] ?? LayoutGrid;
                                  return (
                                    <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary/60 text-muted-foreground">
                                      <TIcon className="h-3 w-3" /> {count} {type}{Number(count) !== 1 ? "s" : ""}
                                    </span>
                                  );
                                })}
                                <span className={`ml-auto text-xs font-semibold ${config.color}`}>
                                  {counts.total} total →
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Coming soon */}
            <div className="border-t border-border/20 pt-12">
              <h2 className="text-xl font-semibold mb-6 text-muted-foreground">Coming soon</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <ComingSoonCard
                  icon={Stethoscope}
                  title="Professional Counselling"
                  description="Affordable, confidential one-on-one counselling directly through the platform."
                />
                <ComingSoonCard
                  icon={Handshake}
                  title="Career & Skills Board"
                  description="Helping men learn marketable skills and find work that pays the bills."
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ComingSoonCard({ icon: Icon, title, description }: any) {
  return (
    <Card className="bg-card/20 backdrop-blur-sm border-border/20 relative overflow-hidden opacity-60">
      <div className="absolute top-4 right-4">
        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-secondary text-muted-foreground rounded-full border border-border/50">
          <Lock className="h-3 w-3" /> Coming soon
        </span>
      </div>
      <CardContent className="p-7">
        <div className="p-3.5 rounded-xl bg-secondary/30 inline-block mb-5">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
