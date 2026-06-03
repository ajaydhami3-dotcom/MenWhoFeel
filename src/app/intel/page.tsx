"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen, ChevronRight, FileText, Search,
  Brain, HeartPulse, Briefcase, Dumbbell, LayoutGrid, X,
} from "lucide-react";
import Link from "next/link";

// ─── Seed articles with categories ──────────────────────────────────────────
const SEED_ARTICLES = [
  {
    id: "seed-1",
    slug: null,
    title: "Why men don't ask for help — and what actually changes that",
    excerpt: "It's not pride. It's not ego. Research shows the barrier is more nuanced — and more fixable — than most people assume.",
    category: "Mental Health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "seed-2",
    slug: null,
    title: "The quiet cost of holding it together all the time",
    excerpt: "What chronic emotional suppression actually does to the body — and the first small step most men never take.",
    category: "Mental Health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "seed-3",
    slug: null,
    title: "Anger as a secondary emotion: what's usually underneath it",
    excerpt: "Most men know when they're angry. Very few have been taught to look at what came just before the anger did.",
    category: "Mental Health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "seed-4",
    slug: null,
    title: "Financial stress and mental health — the link men don't talk about",
    excerpt: "Money problems and mental health spiral together more than any other stressor for men under 45. Here's why and what to do first.",
    category: "Money & Work",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
  {
    id: "seed-5",
    slug: null,
    title: "How to talk to someone when you don't know where to start",
    excerpt: "The first conversation is always the hardest. Here's a framework for getting the real thing out — without needing to have it all figured out first.",
    category: "Stress & Relationships",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
  },
  {
    id: "seed-6",
    slug: null,
    title: "Sleep, testosterone, and mental health — what the evidence actually says",
    excerpt: "Poor sleep doesn't just make you tired. The downstream effects on mood, focus, and hormonal balance are more significant than most men realise.",
    category: "Physical Health",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27).toISOString(),
  },
];

// ─── Category config ─────────────────────────────────────────────────────────
type Category = "All" | "Mental Health" | "Stress & Relationships" | "Money & Work" | "Physical Health";

const CATEGORY_CONFIG: Record<Exclude<Category, "All">, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  "Mental Health": {
    icon: Brain,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
  },
  "Stress & Relationships": {
    icon: HeartPulse,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/30",
  },
  "Money & Work": {
    icon: Briefcase,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
  },
  "Physical Health": {
    icon: Dumbbell,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
  },
};

const CATEGORIES: Category[] = ["All", "Mental Health", "Stress & Relationships", "Money & Work", "Physical Health"];

// ─── Infer category from title/excerpt for DB articles ──────────────────────
function inferCategory(title: string, excerpt?: string | null): Category {
  const text = (title + " " + (excerpt ?? "")).toLowerCase();
  if (/money|financial|work|job|debt|salary|budget|career|income/.test(text)) return "Money & Work";
  if (/sleep|exercise|physical|body|movement|testosterone|gym|diet|fitness/.test(text)) return "Physical Health";
  if (/stress|relationship|anger|partner|conflict|fight|pressure|communicate|talk to/.test(text)) return "Stress & Relationships";
  return "Mental Health";
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function IntelLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const { data: articles, isLoading } = trpc.intel.getLibrary.useQuery();

  // Merge DB articles with seed, assign categories
  const enrichedArticles = useMemo(() => {
    const base = articles && articles.length > 0
      ? articles.map((a: any) => ({ ...a, category: inferCategory(a.title, a.excerpt) }))
      : SEED_ARTICLES;
    return base;
  }, [articles]);

  // Filter by search term and category
  const filtered = useMemo(() => {
    let result = enrichedArticles;
    if (activeCategory !== "All") {
      result = result.filter((a: any) => a.category === activeCategory);
    }
    if (searchTerm.trim().length > 1) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a: any) =>
          a.title.toLowerCase().includes(term) ||
          (a.excerpt ?? "").toLowerCase().includes(term)
      );
    }
    return result;
  }, [enrichedArticles, activeCategory, searchTerm]);

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of enrichedArticles as any[]) {
      counts[a.category] = (counts[a.category] ?? 0) + 1;
    }
    return counts;
  }, [enrichedArticles]);

  const hasSearch = searchTerm.trim().length > 1;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Useful Reads</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-3">Articles</h1>
          <p className="text-zinc-500 font-medium max-w-xl">
            No fluff. No life-coach filler. Reads worth your time on mental health, stress, money, and getting through hard things.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-xl mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search articles..."
            className="pl-10 h-12 bg-zinc-900/60 border-zinc-800 text-base rounded-xl focus-visible:ring-blue-500/50 text-white placeholder:text-zinc-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {hasSearch && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category filter chips */}
        {!hasSearch && (
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const count = cat === "All"
                ? enrichedArticles.length
                : (categoryCounts[cat] ?? 0);
              const config = cat !== "All" ? CATEGORY_CONFIG[cat as Exclude<Category, "All">] : null;
              const CatIcon = config?.icon ?? LayoutGrid;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border ${
                    isActive
                      ? config
                        ? `${config.bg} ${config.color} ${config.border}`
                        : "bg-blue-600 text-white border-blue-500"
                      : "bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:bg-zinc-800/80"
                  }`}
                >
                  {cat !== "All" ? (
                    <CatIcon className="w-3.5 h-3.5" />
                  ) : (
                    <LayoutGrid className="w-3.5 h-3.5" />
                  )}
                  {cat}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-white/20 text-inherit"
                      : "bg-zinc-800 text-zinc-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search result header */}
        {hasSearch && (
          <div className="flex items-center gap-3 mb-6">
            <p className="text-zinc-400 text-sm">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
              <span className="text-white font-semibold">&quot;{searchTerm}&quot;</span>
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Category header (when filtered) */}
        {!hasSearch && activeCategory !== "All" && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${CATEGORY_CONFIG[activeCategory as Exclude<Category,"All">].bg} ${CATEGORY_CONFIG[activeCategory as Exclude<Category,"All">].border}`}>
            {(() => {
              const config = CATEGORY_CONFIG[activeCategory as Exclude<Category, "All">];
              const Icon = config.icon;
              return <Icon className={`w-5 h-5 ${config.color}`} />;
            })()}
            <span className={`text-sm font-bold ${CATEGORY_CONFIG[activeCategory as Exclude<Category,"All">].color}`}>
              {activeCategory}
            </span>
            <span className="text-zinc-600 text-xs ml-auto">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Article grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 rounded-xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-600 italic">
              {hasSearch
                ? `No articles found for "${searchTerm}".`
                : "No articles in this category yet."}
            </p>
            {(hasSearch || activeCategory !== "All") && (
              <button
                onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
                className="mt-3 text-xs text-blue-500 hover:text-blue-400 transition-colors"
              >
                Show all articles
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(filtered as any[]).map((article) => (
              article.slug ? (
                <Link href={`/intel/${article.slug}`} key={article.id} className="block group">
                  <ArticleCard article={article} />
                </Link>
              ) : (
                <div key={article.id} className="group">
                  <ArticleCard article={article} teaser />
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Article card ─────────────────────────────────────────────────────────────
function ArticleCard({ article, teaser }: { article: any; teaser?: boolean }) {
  const config = article.category && CATEGORY_CONFIG[article.category as Exclude<Category, "All">];
  const CatIcon = config?.icon;

  return (
    <Card className="h-full bg-zinc-900/60 border-zinc-800 backdrop-blur-md transition-all duration-300 group-hover:border-blue-500/50 group-hover:bg-zinc-900">
      <CardContent className="p-7 flex flex-col h-full">
        <div className="mb-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <FileText className="w-3 h-3" />
              {new Date(article.createdAt!).toLocaleDateString()}
            </div>
            {config && CatIcon && (
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${config.bg} ${config.color}`}>
                <CatIcon className="w-3 h-3" />
                {article.category}
              </span>
            )}
            {teaser && <span className="text-blue-500/60 text-[10px] font-bold uppercase">Coming soon</span>}
          </div>
          <h2 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors">
            {article.title}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {!teaser && (
          <div className="mt-7 flex items-center gap-2 text-blue-500 font-black uppercase text-xs tracking-widest">
            Read article <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
