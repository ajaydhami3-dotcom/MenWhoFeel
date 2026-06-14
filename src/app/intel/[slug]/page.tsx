import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Clock, User, BookOpen, MessageSquare,
} from "lucide-react";
import { db } from "@/db";
import {
  articles, articleComments, categories, topics, tags, articleTags,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Breadcrumb from "@/components/Breadcrumb";
import TagList from "@/components/TagList";
import RelatedArticles from "@/components/RelatedArticles";
import CommentForm from "./CommentForm";

const BASE_URL = "https://www.menwhofeel.online";

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

// ─── Data fetchers ────────────────────────────────────────────────────────────

async function getArticleData(params: Props["params"]) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  if (!rawSlug) return null;
  try {
    const rows = await db
      .select({
        id: articles.id,
        slug: articles.slug,
        title: articles.title,
        excerpt: articles.excerpt,
        content: articles.content,
        status: articles.status,
        createdAt: articles.createdAt,
        authorName: articles.authorName,
        topicId: articles.topicId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        topicName: topics.name,
        topicSlug: topics.slug,
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(topics, eq(articles.topicId, topics.id))
      .where(eq(articles.slug, rawSlug))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("Database fetch error in Intel slug page:", error);
    return null;
  }
}

async function getTagsForArticle(articleId: number) {
  try {
    return await db
      .select({ name: tags.name, slug: tags.slug })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, articleId));
  } catch {
    return [];
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

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getArticleData(params);
  const resolvedParams = await params;
  if (!data) return { title: { absolute: "Article Not Found | Men Who Feel" } };
  const description = data.excerpt || data.content.substring(0, 160) + "...";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      ...(data.categoryName && data.categorySlug
        ? [{ "@type": "ListItem", position: 2, name: data.categoryName, item: `${BASE_URL}/category/${data.categorySlug}` }]
        : []),
      ...(data.topicName && data.topicSlug
        ? [{ "@type": "ListItem", position: 3, name: data.topicName, item: `${BASE_URL}/topic/${data.topicSlug}` }]
        : []),
      { "@type": "ListItem", position: data.categoryName ? (data.topicName ? 4 : 3) : 2, name: data.title, item: `${BASE_URL}/intel/${resolvedParams.slug}` },
    ],
  };

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
      authors: [data.authorName ?? "MenWhoFeel Core"],
      publishedTime: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
    },
    twitter: { card: "summary_large_image", title: data.title, description },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SingleIntelPage({ params }: Props) {
  const data = await getArticleData(params);
  if (!data) notFound();

  const [comments, articleTagsList] = await Promise.all([
    getComments(data.slug),
    getTagsForArticle(data.id),
  ]);

  // Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.excerpt,
    author: { "@type": "Organization", name: data.authorName ?? "MenWhoFeel Core", url: BASE_URL },
    publisher: { "@type": "Organization", name: "Men Who Feel", url: BASE_URL },
    datePublished: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
    url: `${BASE_URL}/intel/${data.slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/intel/${data.slug}` },
  };

  return (
    <div className="min-h-screen bg-[#060810] py-12 px-4 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <div className="max-w-3xl mx-auto w-full">

        {/* Breadcrumb */}
        <Breadcrumb crumbs={[
          { label: "Home", href: "/" },
          { label: "Useful Reads", href: "/intel" },
          ...(data.categoryName && data.categorySlug
            ? [{ label: data.categoryName, href: `/category/${data.categorySlug}` }]
            : []),
          ...(data.topicName && data.topicSlug
            ? [{ label: data.topicName, href: `/topic/${data.topicSlug}` }]
            : []),
          { label: data.title },
        ]} />

        <Link
          href="/intel"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Intel
        </Link>

        <article className="w-full">
          <header className="mb-10 pb-10 border-b border-zinc-800">

            {/* Category + topic labels */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                Useful Reads
              </span>
              {data.categoryName && data.categorySlug && (
                <>
                  <span className="text-zinc-700">·</span>
                  <Link
                    href={`/category/${data.categorySlug}`}
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                  >
                    {data.categoryName}
                  </Link>
                </>
              )}
              {data.topicName && data.topicSlug && (
                <>
                  <span className="text-zinc-700">·</span>
                  <Link
                    href={`/topic/${data.topicSlug}`}
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                  >
                    {data.topicName}
                  </Link>
                </>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight mb-6">
              {data.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                <User className="w-4 h-4" /> {data.authorName ?? "MenWhoFeel Core"}
              </div>
              <div className="flex items-center gap-2 text-zinc-600 text-xs font-bold uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                <time dateTime={data.createdAt ? new Date(data.createdAt).toISOString() : undefined}>
                  {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : ""}
                </time>
              </div>
            </div>
          </header>

          {/* Article body */}
          <div className="w-full mb-8">
            <p
              className="text-zinc-300 text-lg leading-[1.9] break-words whitespace-pre-line"
              style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
            >
              {data.content}
            </p>
          </div>

          {/* Tags */}
          {articleTagsList.length > 0 && (
            <TagList tags={articleTagsList} />
          )}
        </article>

        {/* Related articles from same topic */}
        <RelatedArticles
          topicId={data.topicId}
          currentArticleId={data.id}
          topicName={data.topicName}
        />

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

          {comments.length > 0 && (
            <div className="space-y-4 mb-10">
              {comments.map((comment: any) => (
                <div key={comment.id} className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                      {comment.authorName ?? "Anonymous"}
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

          <CommentForm slug={data.slug} />
        </section>

      </div>
    </div>
  );
}
