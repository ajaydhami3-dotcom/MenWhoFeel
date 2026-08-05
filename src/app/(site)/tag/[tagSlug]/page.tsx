import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { tags, articleTags, articles, categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import Breadcrumb from "@/components/Breadcrumb";
import { Tag } from "lucide-react";
import { TaggedArticleCard } from "./TaggedArticleCard";

export const revalidate = 300;

const BASE_URL = "https://www.menwhofeel.online";

type Props = { params: Promise<{ tagSlug: string }> };

async function getTagData(slug: string) {
  try {
    const rows = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error(`[tag/${slug}] getTagData failed:`, err);
    return null;
  }
}

async function getArticlesByTag(tagId: number) {
  try {
    return await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        createdAt: articles.createdAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(articleTags)
      .innerJoin(articles, eq(articleTags.articleId, articles.id))
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      // Only published articles — unpublished/draft articles tagged ahead
      // of publishing were previously showing up here even though they're
      // correctly excluded from /topic and /category pages.
      .where(and(eq(articleTags.tagId, tagId), eq(articles.status, "published")))
      .orderBy(desc(articles.createdAt));
  } catch (err) {
    console.error(`[tag] getArticlesByTag(${tagId}) failed:`, err);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tagSlug } = await params;
  const tag = await getTagData(tagSlug);
  if (!tag) return { title: { absolute: "Tag Not Found | Men Who Feel" } };
  return {
    title: { absolute: `#${tag.name} Articles | Men Who Feel` },
    description: `All articles tagged with #${tag.name} on Men Who Feel.`,
    alternates: { canonical: `${BASE_URL}/tag/${tagSlug}` },
    openGraph: {
      title: `#${tag.name} | Men Who Feel`,
      description: `Browse all articles tagged #${tag.name}.`,
      url: `${BASE_URL}/tag/${tagSlug}`,
      siteName: "Men Who Feel",
      type: "website",
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { tagSlug } = await params;
  const tag = await getTagData(tagSlug);
  if (!tag) notFound();

  const taggedArticles = await getArticlesByTag(tag.id);

  return (
    <div className="min-h-screen bg-[#060810] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        <Breadcrumb crumbs={[
          { label: "Home", href: "/" },
          { label: "Useful Reads", href: "/intel" },
          { label: `#${tag.name}` },
        ]} />

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-blue-500 mb-3">
            <Tag className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tag</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white mb-3 leading-tight">
            #{tag.name}
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            {taggedArticles.length} article{taggedArticles.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Articles grid */}
        {taggedArticles.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {taggedArticles.map((article) => (
              <TaggedArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-600 italic">No articles with this tag yet.</p>
            <Link href="/intel" className="mt-4 inline-block text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest transition-colors">
              Browse all articles →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
