import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { categories, topics, articles } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const revalidate = 300;

const BASE_URL = "https://www.menwhofeel.online";

// Full Tailwind class strings — necessary so purge doesn't strip them
const STYLE: Record<string, {
  accent: string; bg: string; border: string; badge: string;
  hoverBorder: string; hoverAccent: string; dot: string;
}> = {
  blue:    { accent: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    badge: "bg-blue-400/20 text-blue-300",    hoverBorder: "hover:border-blue-400/40",    hoverAccent: "group-hover:text-blue-400",    dot: "bg-blue-400" },
  rose:    { accent: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20",    badge: "bg-rose-400/20 text-rose-300",    hoverBorder: "hover:border-rose-400/40",    hoverAccent: "group-hover:text-rose-400",    dot: "bg-rose-400" },
  green:   { accent: "text-green-400",   bg: "bg-green-400/10",   border: "border-green-400/20",   badge: "bg-green-400/20 text-green-300",   hoverBorder: "hover:border-green-400/40",   hoverAccent: "group-hover:text-green-400",   dot: "bg-green-400" },
  emerald: { accent: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", badge: "bg-emerald-400/20 text-emerald-300", hoverBorder: "hover:border-emerald-400/40", hoverAccent: "group-hover:text-emerald-400", dot: "bg-emerald-400" },
  amber:   { accent: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   badge: "bg-amber-400/20 text-amber-300",   hoverBorder: "hover:border-amber-400/40",   hoverAccent: "group-hover:text-amber-400",   dot: "bg-amber-400" },
  purple:  { accent: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20",  badge: "bg-purple-400/20 text-purple-300",  hoverBorder: "hover:border-purple-400/40",  hoverAccent: "group-hover:text-purple-400",  dot: "bg-purple-400" },
};
const DEFAULT_STYLE = STYLE.blue!;

type Props = { params: Promise<{ categorySlug: string }> };

async function getCategoryData(slug: string) {
  try {
    const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error(`[category/${slug}] getCategoryData failed:`, err);
    return null;
  }
}

async function getTopicsWithCount(categoryId: number) {
  try {
    const topicRows = await db
      .select()
      .from(topics)
      .where(eq(topics.categoryId, categoryId))
      .orderBy(topics.sortOrder);

    return await Promise.all(
      topicRows.map(async (t) => {
        const [{ count }] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(articles)
          .where(and(eq(articles.topicId, t.id), eq(articles.status, "published")));
        return { ...t, articleCount: count ?? 0 };
      })
    );
  } catch (err) {
    console.error(`[category] getTopicsWithCount(${categoryId}) failed:`, err);
    return [];
  }
}

async function getLatestArticles(categoryId: number) {
  try {
    return await db
      .select({ id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt })
      .from(articles)
      .where(and(eq(articles.categoryId, categoryId), eq(articles.status, "published")))
      .orderBy(desc(articles.createdAt))
      .limit(6);
  } catch (err) {
    console.error(`[category] getLatestArticles(${categoryId}) failed:`, err);
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const rows = await db.select({ slug: categories.slug }).from(categories);
    return rows.map((r) => ({ categorySlug: r.slug }));
  } catch (err) {
    console.error("[category] generateStaticParams failed:", err);
    return [];
  }
}

async function getCategoryArticleCount(categoryId: number) {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(articles)
      .where(and(eq(articles.categoryId, categoryId), eq(articles.status, "published")));
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const cat = await getCategoryData(categorySlug);
  if (!cat) return { title: { absolute: "Category Not Found | Men Who Feel" } };
  const articleCount = await getCategoryArticleCount(cat.id);
  return {
    title: { absolute: `${cat.name} | Men Who Feel` },
    description: cat.description ?? `Explore ${cat.name} articles and topics on Men Who Feel.`,
    alternates: { canonical: `${BASE_URL}/category/${categorySlug}` },
    openGraph: {
      title: `${cat.name} | Men Who Feel`,
      description: cat.description ?? "",
      url: `${BASE_URL}/category/${categorySlug}`,
      siteName: "Men Who Feel",
      type: "website",
    },
    // Safety net: if a category is ever created/empty before content is
    // published under it, don't let a thin "0 articles" page get indexed.
    ...(articleCount === 0 && {
      robots: { index: false, follow: true },
    }),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const cat = await getCategoryData(categorySlug);
  if (!cat) notFound();

  const [topicsData, latestArticles] = await Promise.all([
    getTopicsWithCount(cat.id),
    getLatestArticles(cat.id),
  ]);

  const totalArticles = topicsData.reduce((sum, t) => sum + (t.articleCount ?? 0), 0);
  const s = STYLE[cat.color ?? "blue"] ?? DEFAULT_STYLE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.name,
    description: cat.description,
    url: `${BASE_URL}/category/${cat.slug}`,
    publisher: { "@type": "Organization", name: "Men Who Feel", url: BASE_URL },
  };

  return (
    <div className="min-h-screen bg-[#060810] text-white py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto">

        <Breadcrumb crumbs={[
          { label: "Home", href: "/" },
          { label: "Useful Reads", href: "/intel" },
          { label: cat.name },
        ]} />

        {/* Category hero */}
        <div className={`rounded-2xl border p-8 sm:p-12 mb-12 ${s.bg} ${s.border}`}>
          <span className={`text-[10px] font-black uppercase tracking-[0.35em] ${s.accent} mb-4 block`}>
            Category
          </span>
          <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white mb-4 leading-tight">
            {cat.name}
          </h1>
          {cat.description && (
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-6">
              {cat.description}
            </p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${s.badge}`}>
              {topicsData.length} topic{topicsData.length !== 1 ? "s" : ""}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold">
              {totalArticles} article{totalArticles !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Topics grid */}
        {topicsData.length > 0 && (
          <section className="mb-14">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">
              Topics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topicsData.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topic/${topic.slug}`}
                  className={`p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 ${s.hoverBorder} hover:bg-zinc-900 transition-all group`}
                >
                  <h3 className={`font-bold text-white ${s.hoverAccent} transition-colors mb-2 leading-tight`}>
                    {topic.name}
                  </h3>
                  {topic.description && (
                    <p className="text-zinc-500 text-sm leading-relaxed mb-3 line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-600 font-medium">
                      {topic.articleCount} article{topic.articleCount !== 1 ? "s" : ""}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 text-zinc-700 group-hover:translate-x-0.5 group-hover:${s.accent} transition-all`} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest articles */}
        {latestArticles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                Latest Articles
              </h2>
              <Link
                href="/intel"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300 transition-colors"
              >
                All articles →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {latestArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/intel/${article.slug}`}
                  className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-900 transition-all group"
                >
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {latestArticles.length === 0 && topicsData.length === 0 && (
          <p className="text-zinc-600 text-center py-16 italic">
            Articles are coming soon. Check back shortly.
          </p>
        )}
      </div>
    </div>
  );
}
