import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, User, BookOpen, MessageSquare } from "lucide-react";
import { db } from "@/db"; 
import { articles } from "@/db/schema"; 
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

// ============================================================================
// SAFE DB FETCH HELPER (Queries by SLUG and includes Comments relation)
// ============================================================================
async function getArticleData(params: Props["params"]) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;

  if (!rawSlug) return null;

  // Querying directly via the 'slug' string column to fix the Postgres type crash.
  // We use Drizzle's 'with' keyword to cleanly pull your comments relation out of the box.
  return await db.query.articles.findFirst({
    where: eq(articles.slug, rawSlug),
    with: {
      comments: true, // Restores your comments data stream
    },
  });
}

// ============================================================================
// DYNAMIC SEO METADATA 
// ============================================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getArticleData(params);

  if (!data) {
    return { title: "Article Not Found | Brotherhood" };
  }

  const description = data.excerpt || data.content.substring(0, 160) + "...";

  return {
    title: `${data.title} | Intel`,
    description: description,
    openGraph: {
      title: data.title,
      description: description,
      type: "article",
      authors: [data.authorName || "MenWhoFeel Core"],
      publishedTime: data.createdAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: description,
    },
  };
}

// ============================================================================
// SERVER-RENDERED ARTICLE PAGE WITH COMMENTS
// ============================================================================
export default async function SingleIntelPage({ params }: Props) {
  const data = await getArticleData(params);

  if (!data) {
    notFound();
  }

  // Typecast or fallback to an array safely if no comments exist yet
  const articleComments = (data as any).comments || [];

  return (
    <div className="min-h-screen bg-[#060810] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Navigation */}
        <Link 
          href="/intel" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Intel
        </Link>

        {/* Core Article Content */}
        <article className="w-full">
          <header className="mb-10 pb-10 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-blue-500 mb-6">
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Useful Reads
              </span>
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
                <time dateTime={data.createdAt.toISOString()}>
                  {new Date(data.createdAt).toLocaleDateString()}
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

        {/* ============================================================================
            COMMENTS SECTION
           ============================================================================ */}
        <section className="mt-16 pt-10 border-t border-zinc-800 w-full">
          <div className="flex items-center gap-2 text-white mb-8">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-black uppercase tracking-tight">
              Discussion ({articleComments.length})
            </h2>
          </div>

          {/* Comments Render List */}
          <div className="space-y-4 mb-8">
            {articleComments.length === 0 ? (
              <p className="text-zinc-500 text-sm italic p-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                No thoughts shared yet. Drop your input below.
              </p>
            ) : (
              articleComments.map((comment: any) => (
                <div key={comment.id} className="p-5 border border-zinc-800 bg-zinc-900/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3 text-xs text-zinc-500 font-bold uppercase tracking-wide">
                    <span className="text-zinc-400">{comment.userName || "Anonymous Brother"}</span>
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Info notice or placeholder for comment mutation */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-zinc-400">
            Comments are loaded dynamically from the repository database. Use your frontend comment input fields to commit additions.
          </div>
        </section>

      </div>
    </div>
  );
}