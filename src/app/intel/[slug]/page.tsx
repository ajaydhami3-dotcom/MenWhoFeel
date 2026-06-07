import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, User, BookOpen, MessageSquare, Send } from "lucide-react";
import { db } from "@/db";
import { articles, articleComments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

async function getArticleData(params: Props["params"]) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  if (!rawSlug) return null;
  try {
    const rows = await db.select().from(articles).where(eq(articles.slug, rawSlug)).limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error("Database fetch error in Intel slug page:", error);
    return null;
  }
}

async function getComments(slug: string) {
  try {
    return await db
      .select()
      .from(articleComments)
      .where(eq(articleComments.articleSlug, slug))
      .orderBy(desc(articleComments.createdAt));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getArticleData(params);
  const resolvedParams = await params;
  const BASE_URL = "https://www.menwhofeel.online";
  if (!data) return { title: { absolute: "Article Not Found | Men Who Feel" } };
  const description = data.excerpt || data.content.substring(0, 160) + "...";
  return {
    title: { absolute: `${data.title} | Men Who Feel` },
    description,
    alternates: { canonical: `${BASE_URL}/intel/${resolvedParams.slug}` },
    openGraph: {
      title: data.title,
      description,
      url: `${BASE_URL}/intel/${resolvedParams.slug}`,
      siteName: "Men Who Feel",
      type: "article",
      authors: [data.authorName || "MenWhoFeel Core"],
      publishedTime: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
    },
    twitter: { card: "summary_large_image", title: data.title, description },
  };
}

export default async function SingleIntelPage({ params }: Props) {
  const data = await getArticleData(params);
  if (!data) notFound();

  const comments = await getComments(data.slug);

  return (
    <div className="min-h-screen bg-[#060810] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">

        <Link
          href="/intel"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Intel
        </Link>

        <article className="w-full">
          <header className="mb-10 pb-10 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-blue-500 mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Useful Reads</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight mb-6">
              {data.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                <User className="w-4 h-4" /> {data.authorName || "MenWhoFeel Core"}
              </div>
              <div className="flex items-center gap-2 text-zinc-600 text-xs font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                <time dateTime={data.createdAt ? new Date(data.createdAt).toISOString() : undefined}>
                  {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : ""}
                </time>
              </div>
            </div>
          </header>

          <div className="w-full mb-16">
            <p
              className="text-zinc-300 text-lg leading-[1.9] break-words whitespace-pre-line"
              style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
            >
              {data.content}
            </p>
          </div>
        </article>

        {/* ── COMMENTS SECTION ─────────────────────────────────────── */}
        <section className="mt-16 pt-10 border-t border-zinc-800 w-full">
          <div className="flex items-center gap-2 text-white mb-8">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-black uppercase tracking-tight">Discussion</h2>
            {comments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full">
                {comments.length}
              </span>
            )}
          </div>

          {/* Existing comments */}
          {comments.length > 0 && (
            <div className="space-y-4 mb-10">
              {comments.map((comment: any) => (
                <div key={comment.id} className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                      {comment.authorName || "Anonymous"}
                    </span>
                    <span className="text-zinc-700 text-xs ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add comment form — client island */}
          <CommentForm slug={data.slug} />
        </section>

      </div>
    </div>
  );
}

// ── CLIENT ISLAND for comment submission ──────────────────────────────────────
// Using a separate client component so the page can stay server-rendered
import CommentForm from "./CommentForm";
