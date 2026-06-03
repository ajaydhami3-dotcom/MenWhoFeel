"use client";

import { useState, useMemo } from "react";
import {
  BookOpen, ChevronRight, FileText, Search,
  Brain, HeartPulse, Briefcase, Dumbbell, LayoutGrid, X,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = "All" | "Mental Health" | "Stress & Relationships" | "Money & Work" | "Physical Health";

export type ArticleItem = {
  id: string;
  slug: string | null;
  title: string;
  excerpt?: string | null;
  category: Exclude<Category, "All">;
  createdAt: string; // ISO string — serialisable from server
};

interface Props {
  initialArticles: ArticleItem[];
}

// ─── Category config ──────────────────────────────────────────────────────────

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

const CATEGORIES: Category[] = [
  "All",
  "Mental Health",
  "Stress & Relationships",
  "Money & Work",
  "Physical Health",
];

// ─── Main client component ────────────────────────────────────────────────────
// Receives initialArticles pre-populated from the server — no useQuery, no
// loading state, no shimmer. The read tab has actual content from first paint.

export default function IntelClient({ initialArticles }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  // Filter by search term and category — all client-side from server-preloaded data
  const filtered = useMemo(() => {
    let result = initialArticles;
    if (activeCategory !== "All") {
      result = result.filter((a) => a.category === activeCategory);
    }
    if (searchTerm.trim().length > 1) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          (a.excerpt ?? "").toLowerCase().includes(term)
      );
    }
    return result;
  }, [initialArticles, activeCategory, searchTerm]);

  // Count per category for the filter chips
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of initialArticles) {
      counts[a.category] = (counts[a.category] ?? 0) + 1;
    }
    return counts;
  }, [initialArticles]);

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
              const count =
                cat === "All"
                  ? initialArticles.length
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
                  <CatIcon className="w-3.5 h-3.5" />
                  {cat}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? "bg-white/20 text-inherit" : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
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
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${CATEGORY_CONFIG[activeCategory as Exclude<Category, "All">].bg} ${CATEGORY_CONFIG[activeCategory as Exclude<Category, "All">].border}`}
          >
            {(() => {
              const config = CATEGORY_CONFIG[activeCategory as Exclude<Category, "All">];
              const Icon = config.icon;
              return <Icon className={`w-5 h-5 ${config.color}`} />;
            })()}
            <span className={`text-sm font-bold ${CATEGORY_CONFIG[activeCategory as Exclude<Category, "All">].color}`}>
              {activeCategory}
            </span>
            <span className="text-zinc-600 text-xs ml-auto">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Article grid — populated from server data, visible on first paint */}
        {filtered.length === 0 ? (
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
            {filtered.map((article) =>
              article.slug ? (
                <Link href={`/intel/${article.slug}`} key={article.id} className="block group">
                  <ArticleCard article={article} />
                </Link>
              ) : (
                <div key={article.id} className="group">
                  <ArticleCard article={article} teaser />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Article card ─────────────────────────────────────────────────────────────

function ArticleCard({ article, teaser }: { article: ArticleItem; teaser?: boolean }) {
  const config = CATEGORY_CONFIG[article.category];
  const CatIcon = config?.icon;

  return (
    <Card className="h-full bg-zinc-900/60 border-zinc-800 backdrop-blur-md transition-all duration-300 group-hover:border-blue-500/50 group-hover:bg-zinc-900">
      <CardContent className="p-7 flex flex-col h-full">
        <div className="mb-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              <FileText className="w-3 h-3" />
              {new Date(article.createdAt).toLocaleDateString()}
            </div>
            {config && CatIcon && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${config.bg} ${config.color}`}
              >
                <CatIcon className="w-3 h-3" />
                {article.category}
              </span>
            )}
            {teaser && (
              <span className="text-blue-500/60 text-[10px] font-bold uppercase">Coming soon</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors">
            {article.title}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{article.excerpt}</p>
        </div>

        {!teaser && (
          <div className="mt-7 flex items-center gap-2 text-blue-500 font-black uppercase text-xs tracking-widest">
            Read article{" "}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
