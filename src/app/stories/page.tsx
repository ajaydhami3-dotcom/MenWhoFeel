"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, PenTool, User, Clock, CheckCircle, Send } from "lucide-react";

export default function StoriesPage() {
  const [activeTab, setActiveTab] = useState<"read" | "write">("read");

  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: approvedStories, isLoading } = trpc.stories.getApprovedStories.useQuery();
  const submitMutation = trpc.stories.submitStory.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      setTitle("");
      setAuthorName("");
      setContent("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 3 || content.length < 20) return;
    submitMutation.mutate({ title, content, authorName });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse tracking-tighter text-2xl uppercase italic">
          Loading stories...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060810] text-white p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Brotherhood</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">Stories</h1>
            <p className="text-zinc-400 font-medium mt-3 max-w-xl">
              Real men, real situations. Read how others came through hard times — or share your own so the next man knows he's not alone.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-10 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setActiveTab("read")}
            className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-xl transition-all ${
              activeTab === "read"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <BookOpen className="w-4 h-4" /> The Archives
          </button>
          <button
            onClick={() => { setActiveTab("write"); setIsSubmitted(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-xl transition-all ${
              activeTab === "write"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <PenTool className="w-4 h-4" /> Share your story
          </button>
        </div>

        {/* TAB: READ */}
        {activeTab === "read" && (
          <div className="space-y-6">
            {approvedStories?.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 italic">
                Nothing published yet. Be the first to share something.
              </div>
            ) : (
              approvedStories?.map((story) => (
                <Card key={story.id} className="bg-zinc-900/60 border-zinc-800 backdrop-blur-md hover:border-blue-500/30 transition-all duration-300">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {story.featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded mb-3">
                            Featured
                          </span>
                        )}
                        <CardTitle className="text-2xl font-bold text-white leading-tight">{story.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-zinc-300 leading-relaxed mb-6 whitespace-pre-wrap">{story.content}</p>
                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        <User className="w-4 h-4" /> {story.authorName}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        <Clock className="w-4 h-4" /> {new Date(story.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB: WRITE */}
        {activeTab === "write" && (
          <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-md">
            <CardContent className="p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Your story is in safe hands.</h3>
                  <p className="text-zinc-400 max-w-sm mx-auto">
                    It'll be reviewed before going live. Once it's approved, it'll be here for the next man who needs it.
                  </p>
                  <button
                    onClick={() => setActiveTab("read")}
                    className="mt-8 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all"
                  >
                    Back to stories
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-4 text-sm text-blue-400 mb-4">
                    <p>
                      <strong>Keep it honest.</strong> What actually happened, and how did you get through it. All stories are reviewed before publishing. No spam, no selling.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
                      Give your story a title
                    </label>
                    <Input
                      required
                      placeholder="e.g. How I rebuilt my finances in 6 months"
                      className="bg-black/50 border-zinc-800 text-white h-12 focus:ring-blue-500/50"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
                      Name or handle (optional — leave blank to stay anonymous)
                    </label>
                    <Input
                      placeholder="Anonymous"
                      className="bg-black/50 border-zinc-800 text-white h-12 focus:ring-blue-500/50"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">
                      What happened, and how did you come through it?
                    </label>
                    <textarea
                      required
                      className="w-full h-64 bg-black/50 border border-zinc-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none placeholder:text-zinc-700"
                      placeholder="Be specific. The details are what actually help other men."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending || title.length < 3 || content.length < 20}
                    className="self-end px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center gap-2"
                  >
                    {submitMutation.isPending ? "Sending..." : <><Send className="w-4 h-4" /> Share my story</>}
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
// Note: metadata exported from a separate server layout or via next-seo
// Individual page titles set via document.title in useEffect if needed
