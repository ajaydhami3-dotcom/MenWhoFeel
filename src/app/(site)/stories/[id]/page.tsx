import { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Clock, MessageSquare } from "lucide-react";
import { db } from "@/db";
import { stories, storyComments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

// Wrapped in React's cache() — generateMetadata and the page body below
// both call this with the same params promise, so without it every story
// view ran this query twice per request.
const getStoryData = cache(async (params: Props["params"]) => {
  const resolvedParams = await params;
  const rawId = resolvedParams.id;
  if (!rawId) return null;

  const parsedId = parseInt(rawId);
  const lookupId = isNaN(parsedId) ? rawId : parsedId;

  try {
    return await db.query.stories.findFirst({
      where: eq(stories.id, lookupId as any),
    });
  } catch {
    return null;
  }
});

async function getStoryComments(storyId: number) {
  try {
    return await db
      .select()
      .from(storyComments)
      .where(eq(storyComments.storyId, storyId))
      .orderBy(desc(storyComments.createdAt));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await getStoryData(params);
  const resolvedParams = await params;
  const BASE_URL = "https://www.menwhofeel.online";
  if (!story) return { title: { absolute: "Story Not Found | Men Who Feel" } };
  const description = story.excerpt || story.content.substring(0, 160) + "...";
  return {
    title: { absolute: `${story.title} | Men Who Feel` },
    description,
    alternates: { canonical: `${BASE_URL}/stories/${resolvedParams.id}` },
    openGraph: {
      title: story.title,
      description,
      url: `${BASE_URL}/stories/${resolvedParams.id}`,
      siteName: "Men Who Feel",
      type: "article",
      authors: [story.authorName || "Anonymous"],
      publishedTime: story.createdAt.toISOString(),
    },
    twitter: { card: "summary", title: story.title, description },
  };
}

export default async function SingleStoryPage({ params }: Props) {
  const story = await getStoryData(params);
  if (!story) notFound();

  const comments = await getStoryComments(story.id);

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">

        <Link
          href="/stories"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-widest transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to the Archives
        </Link>

        <article className="w-full">
          <header className="mb-10 pb-10 border-b border-border">
            {story.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded mb-4">
                Featured
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-foreground leading-tight mb-6">
              {story.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                <User className="w-4 h-4" /> {story.authorName || "Anonymous"}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                <time dateTime={story.createdAt.toISOString()}>
                  {new Date(story.createdAt).toLocaleDateString()}
                </time>
              </div>
            </div>
          </header>

          <div className="w-full mb-16">
            <p
              className="text-foreground text-lg leading-[1.9] break-words whitespace-pre-line"
              style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
            >
              {story.content}
            </p>
          </div>
        </article>

        {/* ── COMMENTS ──────────────────────────────────────────────── */}
        <section className="mt-16 pt-10 border-t border-border">
          <div className="flex items-center gap-2 text-foreground mb-8">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black uppercase tracking-tight">Responses</h2>
            {comments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full">
                {comments.length}
              </span>
            )}
          </div>

          {comments.length > 0 && (
            <div className="space-y-4 mb-10">
              {comments.map((comment: any) => (
                <div key={comment.id} className="p-5 bg-card/60 border border-border rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {comment.authorName || "Anonymous"}
                    </span>
                    <span className="text-muted-foreground text-xs ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          <StoryCommentForm storyId={story.id} />
        </section>

      </div>
    </div>
  );
}

import StoryCommentForm from "./StoryCommentForm";
