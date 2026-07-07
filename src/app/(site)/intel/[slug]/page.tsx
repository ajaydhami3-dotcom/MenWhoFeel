import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ArrowRight, Clock, User, BookOpen, MessageSquare, Eye,
} from "lucide-react";
import { db } from "@/db";
import {
  articles, articleComments, categories, topics, tags, articleTags,
} from "@/db/schema";
import { eq, desc, gt, ne, and } from "drizzle-orm";
import Breadcrumb from "@/components/Breadcrumb";
import TagList from "@/components/TagList";
import RelatedArticles from "@/components/RelatedArticles";
import Callout from "@/components/Callout";
import ArticleReadingTools from "@/components/ArticleReadingTools";
import { estimateReadingTime } from "@/lib/admin/reading-time";
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
        publishedAt: articles.publishedAt,
        authorName: articles.authorName,
        topicId: articles.topicId,
        featuredImage: articles.featuredImage,
        readingTime: articles.readingTime,
        viewCount: articles.viewCount,
        seoTitle: articles.seoTitle,
        metaDescription: articles.metaDescription,
        canonicalUrl: articles.canonicalUrl,
        ogImage: articles.ogImage,
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

// "Keep reading" — next published article after this one by date, wrapping
// around to the oldest rather than dead-ending on whatever's newest.
async function getNextArticle(currentId: number, currentCreatedAt: Date | string | null) {
  try {
    const anchor = currentCreatedAt ? new Date(currentCreatedAt) : new Date();
    const [next] = await db
      .select({ slug: articles.slug, title: articles.title, excerpt: articles.excerpt })
      .from(articles)
      .where(and(eq(articles.status, "published"), gt(articles.createdAt, anchor)))
      .orderBy(articles.createdAt)
      .limit(1);
    if (next) return next;

    const [oldest] = await db
      .select({ slug: articles.slug, title: articles.title, excerpt: articles.excerpt })
      .from(articles)
      .where(and(eq(articles.status, "published"), ne(articles.id, currentId)))
      .orderBy(articles.createdAt)
      .limit(1);
    return oldest ?? null;
  } catch {
    return null;
  }
}

// Article content is stored as a single block of text. Rendering it as one
// giant paragraph (the old behavior) is hard to read — there's no visual
// rhythm to let the eye rest. This splits it into real paragraphs so each
// one gets its own breathing room, instead of relying on CSS to fake it.
function splitIntoParagraphs(content: string): string[] {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  const blocks = normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (blocks.length > 1) return blocks;
  return normalized
    .split(/\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Content has no markup (automation prompt explicitly generates "no
// markdown, no headings"), so a pull quote can't be tagged by the writer —
// it's lifted from a middle paragraph instead, duplicated as a visual scan
// point rather than replacing anything. Returns null whenever there isn't
// a clean, reasonably-sized sentence to pull, rather than forcing one.
function extractPullQuote(paragraphs: string[]): { index: number; text: string } | null {
  if (paragraphs.length < 4) return null;
  const index = Math.min(paragraphs.length - 2, Math.floor(paragraphs.length * 0.4));
  const source = paragraphs[index];
  if (!source) return null;
  const sentenceMatch = source.match(/^[^.!?]*[.!?]/);
  const candidate = (sentenceMatch ? sentenceMatch[0] : source).trim();
  if (candidate.length < 40 || candidate.length > 200) return null;
  return { index, text: candidate };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getArticleData(params);
  const resolvedParams = await params;
  if (!data) return { title: { absolute: "Article Not Found | Men Who Feel" } };

  // The admin editor already collects seoTitle/metaDescription/canonicalUrl/
  // ogImage per article, but the public page wasn't reading any of them —
  // every article rendered with the same generic OG/Twitter output
  // regardless of what was filled in. Using them (with the exact previous
  // behavior as the fallback) is a strict improvement with no behavior
  // change for the articles that don't set them.
  const title = data.seoTitle || data.title;
  const description = data.metaDescription || data.excerpt || data.content.substring(0, 160) + "...";
  const canonical = data.canonicalUrl || `${BASE_URL}/intel/${resolvedParams.slug}`;
  const ogImage = data.ogImage || data.featuredImage || `${BASE_URL}/logo.png`;
  const publishedIso = data.publishedAt
    ? new Date(data.publishedAt).toISOString()
    : data.createdAt
      ? new Date(data.createdAt).toISOString()
      : new Date().toISOString();

  return {
    title: { absolute: `${title} | Men Who Feel` },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/intel/${resolvedParams.slug}`,
      siteName: "Men Who Feel",
      type: "article",
      authors: [data.authorName ?? "MenWhoFeel Core"],
      publishedTime: publishedIso,
      images: [{ url: ogImage }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

// ─── Small presentational pieces ───────────────────────────────────────────────

function PullQuoteBlock({ text }: { text: string }) {
  return (
    <blockquote className="my-10 border-l-2 border-primary py-1 pl-6 font-display text-2xl italic leading-snug text-foreground sm:text-[1.75rem]">
      {text}
    </blockquote>
  );
}

function NextArticleCard({ article }: { article: { slug: string; title: string; excerpt: string } }) {
  return (
    <Link
      href={`/intel/${article.slug}`}
      className="group mb-14 flex items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 sm:p-8"
    >
      <div className="min-w-0">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Keep reading</p>
        <h3 className="font-display text-xl font-semibold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">{article.excerpt}</p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SingleIntelPage({ params }: Props) {
  const data = await getArticleData(params);
  if (!data) notFound();

  const [comments, articleTagsList, nextArticle] = await Promise.all([
    getComments(data.slug),
    getTagsForArticle(data.id),
    getNextArticle(data.id, data.createdAt),
  ]);

  const paragraphs = splitIntoParagraphs(data.content);
  const pullQuote = extractPullQuote(paragraphs);
  const wordCount = data.content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = data.readingTime ?? estimateReadingTime(wordCount);
  const dateForDisplay = data.publishedAt ?? data.createdAt;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.excerpt,
    image: data.featuredImage ?? undefined,
    author: { "@type": "Organization", name: data.authorName ?? "MenWhoFeel Core", url: BASE_URL },
    publisher: { "@type": "Organization", name: "Men Who Feel", url: BASE_URL },
    datePublished: dateForDisplay ? new Date(dateForDisplay).toISOString() : undefined,
    url: `${BASE_URL}/intel/${data.slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/intel/${data.slug}` },
  };

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
      {
        "@type": "ListItem",
        position: data.categoryName ? (data.topicName ? 4 : 3) : 2,
        name: data.title,
        item: `${BASE_URL}/intel/${data.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ArticleReadingTools title={data.title} />

      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Useful Reads", href: "/intel" },
            ...(data.categoryName && data.categorySlug
              ? [{ label: data.categoryName, href: `/category/${data.categorySlug}` }]
              : []),
            ...(data.topicName && data.topicSlug
              ? [{ label: data.topicName, href: `/topic/${data.topicSlug}` }]
              : []),
            { label: data.title },
          ]}
        />

        <Link
          href="/intel"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Intel
        </Link>

        <article>
          <header className="mb-10">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                <BookOpen className="h-3.5 w-3.5" /> Useful Reads
              </span>
              {data.categoryName && data.categorySlug && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <Link
                    href={`/category/${data.categorySlug}`}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {data.categoryName}
                  </Link>
                </>
              )}
              {data.topicName && data.topicSlug && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <Link
                    href={`/topic/${data.topicSlug}`}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {data.topicName}
                  </Link>
                </>
              )}
            </div>

            <h1 className="mb-5 font-display text-3xl font-medium leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
              {data.title}
            </h1>

            {data.excerpt && (
              <p className="mb-6 font-display text-xl italic leading-relaxed text-muted-foreground sm:text-2xl">
                {data.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-8 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> {data.authorName ?? "MenWhoFeel Core"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {readingTime} min read
              </span>
              <time
                dateTime={dateForDisplay ? new Date(dateForDisplay).toISOString() : undefined}
                className="flex items-center gap-1.5"
              >
                {dateForDisplay
                  ? new Date(dateForDisplay).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : ""}
              </time>
              {data.viewCount != null && data.viewCount >= 5 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> {data.viewCount.toLocaleString()} reads
                </span>
              )}
            </div>
          </header>

          {data.featuredImage && (
            // Admin-uploaded URL (Supabase Storage today, possibly a legacy
            // external host on older rows — see storage.ts), so this is a
            // plain <img> rather than next/image, which would need every
            // possible host whitelisted up front. It's the LCP candidate
            // here, so it loads eagerly rather than lazily.
            <div className="mb-10 overflow-hidden rounded-2xl border border-border">
              <img
                src={data.featuredImage}
                alt={data.title}
                loading="eager"
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          <div className="prose-article mx-auto text-[1.15rem] leading-[1.8] text-foreground/90 sm:text-xl">
            {paragraphs.map((paragraph, i) => (
              <div key={i}>
                <p className="mb-6 break-words" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
                  {paragraph}
                </p>
                {pullQuote && pullQuote.index === i && <PullQuoteBlock text={pullQuote.text} />}
              </div>
            ))}
          </div>

          <Callout
            variant="support"
            title="If this brought something up"
            href="/crisis-helpline"
            linkLabel="Find a free helpline"
          >
            You don&apos;t have to sit with this alone. The{" "}
            <Link href="/community" className="underline underline-offset-2">
              community
            </Link>{" "}
            is anonymous and free, if you&apos;d rather talk it through with people who get it.
          </Callout>

          {articleTagsList.length > 0 && <TagList tags={articleTagsList} />}
        </article>

        {nextArticle && <NextArticleCard article={nextArticle} />}

        <div className="mb-14">
          <RelatedArticles topicId={data.topicId} currentArticleId={data.id} topicName={data.topicName} />
        </div>

        <section id="discussion" className="scroll-mt-24 border-t border-border pt-10">
          <div className="mb-8 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Discussion</h2>
            {comments.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {comments.length}
              </span>
            )}
          </div>

          {comments.length > 0 && (
            <div className="mb-10 space-y-4">
              {comments.map((comment: Awaited<ReturnType<typeof getComments>>[number]) => (
                <div key={comment.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {comment.authorName ?? "Anonymous"}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground/60">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{comment.content}</p>
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
