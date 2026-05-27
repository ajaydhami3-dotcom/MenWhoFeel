import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Clock } from "lucide-react";
import { db } from "@/db"; 
import { stories } from "@/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

// ============================================================================
// SAFE DB FETCH HELPER (Handles both Async Params and String/Integer IDs)
// ============================================================================
async function getStoryData(params: Props["params"]) {
  // 1. Await params safely to protect against Next.js async rendering rules
  const resolvedParams = await params;
  const rawId = resolvedParams.id;

  if (!rawId) return null;

  // 2. Smart Parsing: If it's a standard number, parse it. If it's a UUID/String, keep it raw.
  const parsedId = parseInt(rawId);
  const lookupId = isNaN(parsedId) ? rawId : parsedId;

  return await db.query.stories.findFirst({
    where: eq(stories.id, lookupId as any),
  });
}

// ============================================================================
// DYNAMIC SEO METADATA 
// ============================================================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await getStoryData(params);

  if (!story) {
    return { title: "Story Not Found | Brotherhood" };
  }

  const description = story.excerpt || story.content.substring(0, 160) + "...";

  return {
    title: `${story.title} | The Archives`,
    description: description,
    openGraph: {
      title: story.title,
      description: description,
      type: "article",
      authors: [story.authorName || "Anonymous"],
      publishedTime: story.createdAt.toISOString(),
    },
    twitter: {
      card: "summary",
      title: story.title,
      description: description,
    },
  };
}

// ============================================================================
// SERVER-RENDERED SINGLE STORY PAGE
// ============================================================================
export default async function SingleStoryPage({ params }: Props) {
  const story = await getStoryData(params);

  // If the lookupId evaluates to NaN or doesn't match an entry, trigger a clean 404
  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#060810] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Navigation */}
        <Link 
          href="/stories" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to the Archives
        </Link>

        {/* Core Content */}
        <article className="w-full">
          
          <header className="mb-10 pb-10 border-b border-zinc-800">
            {story.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded mb-4">
                Featured
              </span>
            )}
            
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight mb-6">
              {story.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                <User className="w-4 h-4" /> {story.authorName || "Anonymous"}
              </div>
              <div className="flex items-center gap-2 text-zinc-600 text-xs font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4" /> 
                <time dateTime={story.createdAt.toISOString()}>
                  {new Date(story.createdAt).toLocaleDateString()}
                </time>
              </div>
            </div>
          </header>

          <div className="w-full">
            <p 
              className="text-zinc-300 text-lg leading-[1.9] break-words whitespace-pre-line"
              style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
            >
              {story.content}
            </p>
          </div>
          
        </article>

      </div>
    </div>
  );
}