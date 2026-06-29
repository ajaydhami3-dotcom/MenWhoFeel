"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PlayCircle, FileText, Briefcase, Brain,
  HeartPulse, Dumbbell, BookOpen,
  Search, LayoutGrid, ChevronRight, ArrowLeft, ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResourceItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  category: string;
};

interface Props {
  initialResources: ResourceItem[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  gradient: string;
  description: string;
}> = {
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

const TYPE_ICONS: Record<string, React.ElementType> = {
  video: PlayCircle,
  pdf: FileText,
  book: BookOpen,
  link: LayoutGrid,
};

const TYPE_COLORS: Record<string, string> = {
  video: "bg-blue-500 text-white",
  pdf: "bg-rose-500 text-white",
  book: "bg-amber-500 text-white",
  link: "bg-zinc-600 text-white",
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

// ─── Category drill-down view ─────────────────────────────────────────────────
// Uses the already-loaded initialResources — no tRPC, no loading state.

function CategoryView({
  category,
  items,
  onBack,
}: {
  category: string;
  items: ResourceItem[];
  onBack: () => void;
}) {
  const [activeType, setActiveType] = useState<"all" | "video" | "pdf" | "book" | "link">("all");

  // Reset type filter when category changes
  useEffect(() => { setActiveType("all"); }, [category]);

  const config = CATEGORY_CONFIG[category];
  const Icon = config?.icon ?? Brain;

  const filtered = activeType === "all" ? items : items.filter((i) => i.type === activeType);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.type] = (counts[item.type] ?? 0) + 1;
    }
    return counts;
  }, [items]);

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
          <div className="p-3 rounded-xl bg-card/60 shrink-0">
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
          const count = t === "all" ? items.length : (typeCounts[t] ?? 0);
          if (t !== "all" && count === 0) return null;
          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeType === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {t === "all" ? "All" : t}
              <span className="ml-0.5 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Resource list */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground italic">
          No {activeType} resources in this category yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const TIcon = TYPE_ICONS[item.type] ?? LayoutGrid;
            const colorClass = TYPE_COLORS[item.type] ?? "bg-zinc-600 text-white";
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-card/40 border border-border/40 hover:bg-card/70 hover:border-border/80 transition-all group"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <TIcon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex-1 leading-snug">
                  {item.name}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Search results ───────────────────────────────────────────────────────────
// Client-side search across all server-preloaded resources.

function SearchResults({ term, resources }: { term: string; resources: ResourceItem[] }) {
  const results = useMemo(() => {
    const t = term.toLowerCase();
    return resources.filter(
      (r) => r.name.toLowerCase().includes(t) || r.category.toLowerCase().includes(t)
    );
  }, [term, resources]);

  if (results.length === 0) {
    return (
      <p className="text-muted-foreground italic text-sm">
        No resources found for &quot;{term}&quot;.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((item) => {
        const TIcon = TYPE_ICONS[item.type] ?? LayoutGrid;
        const colorClass = TYPE_COLORS[item.type] ?? "bg-zinc-600 text-white";
        const config = CATEGORY_CONFIG[item.category];
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-card/40 border border-border/40 hover:bg-card/70 hover:border-border/80 transition-all group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
              <TIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                {item.name}
              </p>
              <p className={`text-xs mt-0.5 ${config?.color ?? "text-muted-foreground"}`}>
                {item.category}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </a>
        );
      })}
    </div>
  );
}

// ─── Main client component ────────────────────────────────────────────────────
// Receives initialResources pre-populated from the server. Category names,
// resource titles, and counts all appear in the raw HTML — no JS needed.

export default function GuidesClient({ initialResources }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Group resources by category
  const byCategory = useMemo(() => {
    const map: Record<string, ResourceItem[]> = {};
    for (const r of initialResources) {
      if (!map[r.category]) map[r.category] = [];
      map[r.category].push(r);
    }
    return map;
  }, [initialResources]);

  // Count totals + byType per category for the folder cards
  const categoryCounts = useMemo(() => {
    const result: Record<string, { total: number; byType: Record<string, number> }> = {};
    for (const [cat, items] of Object.entries(byCategory)) {
      const byType: Record<string, number> = {};
      for (const item of items) byType[item.type] = (byType[item.type] ?? 0) + 1;
      result[cat] = { total: items.length, byType };
    }
    return result;
  }, [byCategory]);

  const isSearching = searchTerm.length > 1;

  // Category drill-down view
  if (openCategory) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="mx-auto max-w-3xl">
          <CategoryView
            category={openCategory}
            items={byCategory[openCategory] ?? []}
            onBack={() => setOpenCategory(null)}
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
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            Free resources
          </p>
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
            <SearchResults term={searchTerm} resources={initialResources} />
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

              {/* Category folder cards — names and counts in the HTML */}
              <div className="grid md:grid-cols-2 gap-5">
                {CATEGORIES.map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  const Icon = config.icon;
                  const counts = categoryCounts[cat] ?? { total: 0, byType: {} };
                  const typeEntries = Object.entries(counts.byType).filter(([, v]) => v > 0);

                  return (
                    <button
                      key={cat}
                      onClick={() => setOpenCategory(cat)}
                      className={`group text-left w-full rounded-2xl border ${config.border} bg-card/40 hover:bg-card/70 backdrop-blur-sm transition-all duration-200 hover:shadow-lg overflow-hidden`}
                    >
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
                                const TIcon = TYPE_ICONS[type] ?? LayoutGrid;
                                return (
                                  <span
                                    key={type}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-secondary/60 text-muted-foreground"
                                  >
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
            </div>

            {/* Coming soon */}
            <div className="border-t border-border/20 pt-12">
              <h2 className="text-xl font-semibold mb-6 text-muted-foreground">Coming soon</h2>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { label: "Peer support groups", desc: "Moderated spaces to connect with men in similar situations." },
                  { label: "Practitioner directory", desc: "Vetted therapists and counsellors who work with men." },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/30 bg-card/20 p-6 opacity-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">{item.label}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
