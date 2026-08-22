"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, PenTool, User, Clock, CheckCircle, Send } from "lucide-react";

export type StoryItem = {
  id: number;
  title: string;
  excerpt?: string | null;
  content: string;
  authorName: string;
  featured: boolean;
  createdAt: string; // ISO string — serializable from server
};

export type PillarOption = { id: number; name: string };

interface Props {
  initialStories: StoryItem[];
  pillars: PillarOption[];
}

export default function StoriesClient({ initialStories, pillars }: Props) {
  const [activeTab, setActiveTab] = useState<"read" | "write">("read");

  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [pillarId, setPillarId] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = trpc.stories.submitStory.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      setTitle("");
      setAuthorName("");
      setContent("");
      setPillarId("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 3 || content.length < 20) return;
    submitMutation.mutate({
      title,
      content,
      authorName,
      pillarId: pillarId ? Number(pillarId) : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-primary mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Brotherhood</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Stories</h1>
          <p className="text-muted-foreground font-medium mt-3 max-w-xl">
            Real men, real situations. Read how others came through hard times — or share your own so the next man knows he&apos;s not alone.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-10 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab("read")}
            className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-xl transition-all ${
              activeTab === "read"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <BookOpen className="w-4 h-4" /> The Archives
          </button>
          <button
            onClick={() => { setActiveTab("write"); setIsSubmitted(false); }}
            className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-xl transition-all ${
              activeTab === "write"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <PenTool className="w-4 h-4" /> Share your story
          </button>
        </div>

        {/* TAB: READ — server-pre-rendered story list, no loading state */}
        {activeTab === "read" && (
          <div className="space-y-6">
            {initialStories.map((story) => {
              const preview = story.excerpt || story.content.substring(0, 240);
              const isLong = story.content.length > 240;

              return (
                <Card
                  key={story.id}
                  className="bg-card/60 border-border backdrop-blur-md hover:border-primary/30 transition-all duration-300"
                >
                  <CardHeader className="pb-2 border-b border-foreground/5">
                    {story.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded mb-2 w-fit">
                        Featured
                      </span>
                    )}
                    <CardTitle className="text-2xl font-bold text-foreground leading-tight">
                      {story.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <p
                      className="text-muted-foreground leading-relaxed mb-5 break-words"
                      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                    >
                      {preview}{isLong && !story.excerpt ? "…" : ""}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                          <User className="w-4 h-4" /> {story.authorName}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                          <Clock className="w-4 h-4" />
                          {new Date(story.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <Link
                        href={`/stories/${story.id}`}
                        className="px-4 py-2 bg-primary/20 hover:bg-primary border border-primary/30 hover:border-primary text-primary hover:text-primary-foreground text-xs font-black uppercase tracking-widest rounded-lg transition-all"
                      >
                        Read story →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB: WRITE */}
        {activeTab === "write" && (
          <Card className="bg-card/60 border-border backdrop-blur-md">
            <CardContent className="p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-foreground mb-2">
                    Your story is in safe hands.
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    It&apos;ll be reviewed before going live. Once it&apos;s approved, it&apos;ll be here for the next man who needs it.
                  </p>
                  <button
                    onClick={() => setActiveTab("read")}
                    className="mt-8 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold uppercase tracking-widest text-xs rounded-xl transition-all"
                  >
                    Back to stories
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-sm text-primary mb-4">
                    <p>
                      <strong>Keep it honest.</strong> What actually happened, and how did you get through it. All stories are reviewed before publishing. No spam, no selling.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                      Give your story a title
                    </label>
                    <Input
                      required
                      placeholder="e.g. How I rebuilt my finances in 6 months"
                      className="h-12"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                      Name or handle (optional — leave blank to stay anonymous)
                    </label>
                    <Input
                      placeholder="Anonymous"
                      className="h-12"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
                  </div>

                  {pillars.length > 0 && (
                    <div>
                      <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                        Which area does this relate to? (optional)
                      </label>
                      <select
                        className="w-full h-12 bg-secondary border border-border rounded-xl px-4 text-foreground focus:ring-2 focus:ring-ring/50 focus:border-ring outline-none"
                        value={pillarId}
                        onChange={(e) => setPillarId(e.target.value)}
                      >
                        <option value="">Not sure / prefer not to say</option>
                        {pillars.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                      What happened, and how did you come through it?
                    </label>
                    <textarea
                      required
                      className="w-full h-64 bg-secondary border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-ring/50 focus:border-ring outline-none resize-none placeholder:text-muted-foreground"
                      placeholder="Be specific. The details are what actually help other men."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending || title.length < 3 || content.length < 20}
                    className="self-end px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-primary flex items-center gap-2"
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
