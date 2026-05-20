"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

// Seed articles shown when DB has no content yet
const SEED_ARTICLES = [
  {
    id: "seed-1",
    slug: null,
    title: "Why men don't ask for help — and what actually changes that",
    excerpt: "It's not pride. It's not ego. Research shows the barrier is more nuanced — and more fixable — than most people assume.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "seed-2",
    slug: null,
    title: "The quiet cost of holding it together all the time",
    excerpt: "What chronic emotional suppression actually does to the body — and the first small step most men never take.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "seed-3",
    slug: null,
    title: "Anger as a secondary emotion: what's usually underneath it",
    excerpt: "Most men know when they're angry. Very few have been taught to look at what came just before the anger did.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "seed-4",
    slug: null,
    title: "Financial stress and mental health — the link men don't talk about",
    excerpt: "Money problems and mental health spiral together more than any other stressor for men under 45. Here's why and what to do first.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
];

export default function IntelLibraryPage() {
  const { data: articles, isLoading } = trpc.intel.getLibrary.useQuery();

  const displayArticles = articles && articles.length > 0 ? articles : SEED_ARTICLES;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Useful Reads</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Articles</h1>
          <p className="text-zinc-500 font-medium mt-3 max-w-xl">
            No fluff. No life-coach filler. Reads worth your time on mental health, stress, money, and getting through hard things.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 rounded-xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayArticles.map((article: any) => (
              article.slug ? (
                <Link href={`/intel/${article.slug}`} key={article.id} className="block group">
                  <ArticleCard article={article} />
                </Link>
              ) : (
                // Seed articles aren't in DB yet — show as non-linked teasers
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

function ArticleCard({ article, teaser }: { article: any; teaser?: boolean }) {
  return (
    <Card className="h-full bg-zinc-900/60 border-zinc-800 backdrop-blur-md transition-all duration-300 group-hover:border-blue-500/50 group-hover:bg-zinc-900">
      <CardContent className="p-8 flex flex-col h-full">
        <div className="mb-auto">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">
            <FileText className="w-3 h-3" />
            {new Date(article.createdAt!).toLocaleDateString()}
            {teaser && <span className="ml-auto text-blue-500/60">Coming soon</span>}
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors">
            {article.title}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {article.excerpt}
          </p>
        </div>
        
        {!teaser && (
          <div className="mt-8 flex items-center gap-2 text-blue-500 font-black uppercase text-xs tracking-widest">
            Read article <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
