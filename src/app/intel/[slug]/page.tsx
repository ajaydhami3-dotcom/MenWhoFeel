"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BookOpen, Clock, MessageSquare, Send, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const utils = trpc.useUtils();

  // Content States
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");

  // Queries
  const { data: article, isLoading } = trpc.intel.getArticle.useQuery({ slug });
  const { data: comments } = trpc.intel.getComments.useQuery({ slug });

  // Mutation
  const addCommentMutation = trpc.intel.addComment.useMutation({
    onSuccess: () => {
      setContent("");
      utils.intel.getComments.invalidate({ slug }); // Instantly refreshes the comments list
    }
  });

  const handlePostComment = () => {
    if (!content.trim()) return;
    addCommentMutation.mutate({ slug, authorName, content });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse tracking-tighter text-2xl uppercase italic">
          Decrypting File...
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-4 text-red-500">404: Intel Not Found</h1>
        <p className="text-zinc-500 mb-8">This file has been redacted or does not exist.</p>
        <Link href="/intel" className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 font-bold uppercase text-xs rounded-xl transition-all">
          Return to Archives
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/intel" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8 pb-24">
        
        {/* Article Header */}
        <div className="mb-12 border-b border-white/5 pb-12">
          <div className="flex items-center gap-4 text-zinc-500 text-xs font-black uppercase tracking-widest mb-6">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Intel Brief</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(article.createdAt!).toLocaleDateString()}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[1.1] mb-6">
            {article.title}
          </h1>
          
          <p className="text-xl text-zinc-400 font-medium leading-relaxed border-l-2 border-blue-500 pl-4">
            {article.excerpt}
          </p>
        </div>

        {/* Article Content */}
        <div className="prose prose-invert prose-blue max-w-none mb-16">
          <p className="text-zinc-300 text-lg leading-[1.8] whitespace-pre-wrap font-medium">
            {article.content}
          </p>
        </div>

        {/* ========================================== */}
        {/* DISCUSSION & COMMENTS SECTION              */}
        {/* ========================================== */}
        <div className="border-t border-zinc-800 pt-12">
          <div className="flex items-center gap-2 text-blue-500 mb-8">
            <MessageSquare className="w-5 h-5" />
            <h3 className="text-xl font-black uppercase tracking-widest">Field Discussion</h3>
          </div>

          {/* Comment Input */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-xl mb-10">
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Callsign (Optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-black/50 border-zinc-800 text-white focus:ring-blue-500/50 w-full md:w-1/3 h-12 uppercase text-xs font-bold tracking-widest"
              />
              <textarea
                placeholder="Drop your thoughts on this intel..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-24 bg-black/50 border border-zinc-800 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none placeholder:text-zinc-700 text-sm"
              />
              <button
                onClick={handlePostComment}
                disabled={!content.trim() || addCommentMutation.isPending}
                className="self-end px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                {addCommentMutation.isPending ? "Transmitting..." : <><Send className="w-4 h-4" /> Transmit</>}
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments?.length === 0 ? (
              <p className="text-zinc-500 italic text-sm text-center">No discussion on this file yet. Be the first.</p>
            ) : (
              comments?.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-4 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <User className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-sm font-bold text-zinc-300">{comment.authorName}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        {new Date(comment.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}