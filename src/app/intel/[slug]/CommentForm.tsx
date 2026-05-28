"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Send, User } from "lucide-react";

export default function CommentForm({ slug }: { slug: string }) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const addComment = trpc.intel.addComment.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setContent("");
      setAuthorName("");
    },
  });

  if (submitted) {
    return (
      <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
        <p className="text-emerald-400 font-black uppercase tracking-widest text-sm">Comment posted.</p>
        <p className="text-zinc-500 text-xs mt-2">Your voice is part of this now.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors"
        >
          Add another comment
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-5">Add your take</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">
            Name or handle (optional)
          </label>
          <input
            type="text"
            placeholder="Anonymous"
            className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={80}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">
            Your comment
          </label>
          <textarea
            rows={4}
            placeholder="What this brought up for you..."
            className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-3 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
          />
          <p className="text-xs text-zinc-700 mt-1 text-right">{content.length}/1000</p>
        </div>

        <button
          onClick={() => {
            if (content.trim().length < 2) return;
            addComment.mutate({ slug, authorName: authorName || undefined, content: content.trim() });
          }}
          disabled={addComment.isPending || content.trim().length < 2}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
          {addComment.isPending ? "Posting..." : "Post comment"}
        </button>
      </div>
    </div>
  );
}
