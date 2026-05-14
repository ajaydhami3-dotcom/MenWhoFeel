"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";

export default function IntelLibraryPage() {
  const { data: articles, isLoading } = trpc.intel.getLibrary.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse tracking-tighter text-2xl uppercase italic">
          Accessing Archives...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">The Library</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Intel Briefs</h1>
          <p className="text-zinc-500 font-medium mt-3 max-w-xl">
            Deep-dive philosophy, tactical guides, and operational theory. Read the manuals before you enter the Forge.
          </p>
        </div>

        {/* The Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles?.length === 0 ? (
             <div className="col-span-full p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 italic">No intel has been declassified yet.</div>
          ) : (
            articles?.map((article) => (
              <Link href={`/intel/${article.slug}`} key={article.id} className="block group">
                <Card className="h-full bg-zinc-900/60 border-zinc-800 backdrop-blur-md transition-all duration-300 group-hover:border-blue-500/50 group-hover:bg-zinc-900">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="mb-auto">
                      <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        <FileText className="w-3 h-3" />
                        {new Date(article.createdAt!).toLocaleDateString()}
                      </div>
                      <h2 className="text-2xl font-bold text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                    
                    <div className="mt-8 flex items-center gap-2 text-blue-500 font-black uppercase text-xs tracking-widest">
                      Read Brief <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

      </div>
    </div>
  );
}