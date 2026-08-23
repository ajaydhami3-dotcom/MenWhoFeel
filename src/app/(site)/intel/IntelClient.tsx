"use client";

import { useState, useMemo } from "react";
import {
  BookOpen, ChevronRight, FileText, Search,
  Brain, HeartPulse, Briefcase, Dumbbell, LayoutGrid, X, Flame, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ArticleItem = {
  id: string;
  slug: string | null;
  title: string;
  excerpt?: string | null;
  category: string;          // DB-driven category name
  categorySlug: string | null;
  createdAt: string;         // ISO string — serialisable from server
};

interface Props {
  initialArticles: ArticleItem[];
}

// ─── Category config (covers all 6 DB categories) ────────────────────────────
// All class names are stored as complete strings so Tailwind v4 doesn't purge them.

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType }> = {
  "Mental Health": { icon: Brain },
  "Relationships": { icon: HeartPulse },
  "Physical Wellbeing": { icon: Dumbbell },
  "Finances & Career": { icon: Briefcase },
  "Emotions": { icon: Flame },
  "Self Improvement": { icon: TrendingUp },
};

const DEFAULT_CONFIG = { icon: LayoutGrid };

// ─── Main client component ────────────────────────────────────────────────────

export default function IntelClient({ initialArticles }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Derive available categories from the articles (only shows categories with content)
  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    for (const a of initialArticles) catSet.add(a.category);
    return ["All", ...Array.from(catSet).sort()];
  }, [initialArticles]);

  // Filter by search term and category
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
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-primary mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Useful Reads</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-3">Articles</h1>
          <p className="text-muted-foreground font-medium max-w-xl">
            No fluff. No life-coach filler. Reads worth your time on mental health, stress, money, and getting through hard things.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-xl mb-8">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search articles..."
            className="pl-10 h-12 text-base rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {hasSearch && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category filter chips */}
        {!hasSearch && (
          <div className="flex flex-wrap gap-2 mb-8">
            {availableCategories.map((cat) => {
              const isActive = activeCategory === cat;
              const count = cat === "All" ? initialArticles.length : (categoryCounts[cat] ?? 0);
              const config = cat !== "All" ? (CATEGORY_CONFIG[cat] ?? DEFAULT_CONFIG) : null;
              const CatIcon = config?.icon ?? LayoutGrid;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border ${
                    isActive
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {cat}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? "bg-primary/30 text-primary" : "bg-secondary text-muted-foreground"
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
            <p className="text-muted-foreground text-sm">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
              <span className="text-foreground font-semibold">&quot;{searchTerm}&quot;</span>
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Active category header */}
        {!hasSearch && activeCategory !== "All" && (() => {
          const config = CATEGORY_CONFIG[activeCategory] ?? DEFAULT_CONFIG;
          const Icon = config.icon;
          return (
            <div className="flex items-center gap-3 p-4 rounded-xl border mb-6 bg-primary/10 border-primary/30">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary">{activeCategory}</span>
              <span className="text-muted-foreground text-xs ml-auto">
                {filtered.length} article{filtered.length !== 1 ? "s" : ""}
              </span>
              {/* Link to full category page */}
              <Link
                href={`/category/${initialArticles.find(a => a.category === activeCategory)?.categorySlug ?? ""}`}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
              >
                View category →
              </Link>
            </div>
          );
        })()}

        {/* Article grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground italic">
              {hasSearch
                ? `No articles found for "${searchTerm}".`
                : "No articles in this category yet."}
            </p>
            {(hasSearch || activeCategory !== "All") && (
              <button
                onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
                className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors"
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
  const router = useRouter();
  const config = CATEGORY_CONFIG[article.category] ?? DEFAULT_CONFIG;
  const CatIcon = config.icon;

  return (
    <Card className="h-full bg-card/60 border-border backdrop-blur-md transition-all duration-300 group-hover:border-primary/50 group-hover:bg-card">
      <CardContent className="p-7 flex flex-col h-full">
        <div className="mb-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              <FileText className="w-3 h-3" />
              {new Date(article.createdAt).toLocaleDateString()}
            </div>
            {article.categorySlug ? (
              // Was a nested <Link> (an <a> inside the card's own outer
              // <a> from the .map() above) — invalid HTML, and the actual
              // cause of the whole card being unclickable: browsers close
              // the outer anchor early when they hit a nested one, which
              // breaks its click target with no JS error to show for it.
              // stopPropagation() alone never fixed that, since it's a
              // parsing-level issue, not an event-bubbling one. This is a
              // real, separately-clickable target without ever rendering
              // a real nested <a>.
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/category/${article.categorySlug}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/category/${article.categorySlug}`);
                  }
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide cursor-pointer bg-secondary text-muted-foreground hover:opacity-80 transition-opacity"
              >
                <CatIcon className="w-3 h-3" />
                {article.category}
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-secondary text-muted-foreground">
                <CatIcon className="w-3 h-3" />
                {article.category}
              </span>
            )}
            {teaser && (
              <span className="text-primary/60 text-[10px] font-bold uppercase">Coming soon</span>
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground leading-tight mb-3 group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{article.excerpt}</p>
        </div>

        {!teaser && (
          <div className="mt-7 flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
            Read article{" "}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
