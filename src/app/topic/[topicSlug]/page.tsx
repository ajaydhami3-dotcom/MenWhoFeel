import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { categories, topics, articles } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import Breadcrumb from "@/components/Breadcrumb";
import { BookOpen, ChevronRight, FileText } from "lucide-react";

export const revalidate = 300;

const BASE_URL = "https://www.menwhofeel.online";

const STYLE: Record<string, { accent: string; bg: string; border: string; badge: string }> = {
  blue:    { accent: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20",    badge: "bg-blue-400/20 text-blue-300" },
  rose:    { accent: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20",    badge: "bg-rose-400/20 text-rose-300" },
  green:   { accent: "text-green-400",   bg: "bg-green-400/10",   border: "border-green-400/20",   badge: "bg-green-400/20 text-green-300" },
  emerald: { accent: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", badge: "bg-emerald-400/20 text-emerald-300" },
  amber:   { accent: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20",   badge: "bg-amber-400/20 text-amber-300" },
  purple:  { accent: "text-purple-400",  bg: "bg-purple-400/10",  border: "border-purple-400/20",  badge: "bg-purple-400/20 text-purple-300" },
};
const DEFAULT_STYLE = STYLE.blue!;

type Props = { params: Promise<{ topicSlug: string }> };
type KeyArea = { title: string; summary: string };

async function getTopicData(slug: string) {
  try {
    const rows = await db
      .select({
        id: topics.id, name: topics.name, slug: topics.slug,
        description: topics.description, overview: topics.overview,
        whyItMatters: topics.whyItMatters, keyAreas: topics.keyAreas,
        categoryId: topics.categoryId,
        categoryName: categories.name, categorySlug: categories.slug,
        categoryColor: categories.color,
      })
      .from(topics)
      .leftJoin(categories, eq(topics.categoryId, categories.id))
      .where(eq(topics.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  } catch { return null; }
}

async function getTopicArticles(topicId: number) {
  try {
    return await db
      .select({ id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt, createdAt: articles.createdAt, featured: articles.featured })
      .from(articles)
      .where(and(eq(articles.topicId, topicId), eq(articles.status, "published")))
      .orderBy(desc(articles.createdAt));
  } catch { return []; }
}

export async function generateStaticParams() {
  try {
    const rows = await db.select({ slug: topics.slug }).from(topics);
    return rows.map((r) => ({ topicSlug: r.slug }));
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicSlug } = await params;
  const topic = await getTopicData(topicSlug);
  if (!topic) return { title: { absolute: "Topic Not Found | Men Who Feel" } };
  const desc = topic.description ?? `Explore ${topic.name} articles on Men Who Feel.`;
  return {
    title: { absolute: `${topic.name} | Men Who Feel` },
    description: desc,
    alternates: { canonical: `${BASE_URL}/topic/${topicSlug}` },
    openGraph: {
      title: `${topic.name} | Men Who Feel`,
      description: desc,
      url: `${BASE_URL}/topic/${topicSlug}`,
      siteName: "Men Who Feel",
      type: "website",
    },
  };
}

export default async function TopicPage({ params }: Props) {
  const { topicSlug } = await params;
  const topic = await getTopicData(topicSlug);
  if (!topic) notFound();

  const allArticles = await getTopicArticles(topic.id);
  const featuredArticles = allArticles.filter((a) => a.featured);
  const keyAreas = topic.keyAreas as KeyArea[] | null;
  const s = STYLE[topic.categoryColor ?? "blue"] ?? DEFAULT_STYLE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.name,
    description: topic.description,
    url: `${BASE_URL}/topic/${topic.slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: topic.categoryName ?? "Category", item: `${BASE_URL}/category/${topic.categorySlug}` },
        { "@type": "ListItem", position: 3, name: topic.name, item: `${BASE_URL}/topic/${topic.slug}` },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#060810] text-white py-12 px-4 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto">

        <Breadcrumb crumbs={[
          { label: "Home", href: "/" },
          ...(topic.categoryName && topic.categorySlug
            ? [{ label: topic.categoryName, href: `/category/${topic.categorySlug}` }]
            : []),
          { label: topic.name },
        ]} />

        {/* Hero */}
        <div className={`rounded-2xl border p-8 sm:p-12 mb-12 ${s.bg} ${s.border}`}>
          {topic.categoryName && (
            <Link
              href={`/category/${topic.categorySlug}`}
              className={`text-[10px] font-black uppercase tracking-[0.35em] ${s.accent} mb-4 block hover:opacity-80 transition-opacity`}
            >
              ← {topic.categoryName}
            </Link>
          )}
          <h1 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white mb-4 leading-tight">
            {topic.name}
          </h1>
          {topic.description && (
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-6">
              {topic.description}
            </p>
          )}
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${s.badge}`}>
            {allArticles.length} article{allArticles.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Overview */}
        {topic.overview && (
          <section className="mb-12 p-7 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Overview</h2>
            <p className="text-zinc-300 leading-relaxed text-base">{topic.overview}</p>
          </section>
        )}

        {/* Why it matters */}
        {topic.whyItMatters && (
          <section className="mb-12 p-7 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">Why It Matters</h2>
            <p className="text-zinc-300 leading-relaxed text-base">{topic.whyItMatters}</p>
          </section>
        )}

        {/* Key areas */}
        {keyAreas && keyAreas.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Key Areas</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {keyAreas.map((area, i) => (
                <div key={i} className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.accent.replace("text-", "bg-")} mb-3`} />
                  <h3 className="font-bold text-white mb-2 leading-snug">{area.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{area.summary}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular / featured articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Popular Articles</h2>
            <div className="space-y-3">
              {featuredArticles.map((a) => (
                <Link
                  key={a.id}
                  href={`/intel/${a.slug}`}
                  className="flex items-start gap-4 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-900 transition-all group"
                >
                  <BookOpen className={`w-4 h-4 ${s.accent} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                      {a.title}
                    </h3>
                    {a.excerpt && (
                      <p className="text-zinc-500 text-sm line-clamp-2">{a.excerpt}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All articles */}
        {allArticles.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">
              All Articles{allArticles.length > 0 && ` (${allArticles.length})`}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {allArticles.map((a) => (
                <Link
                  key={a.id}
                  href={`/intel/${a.slug}`}
                  className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-900 transition-all group"
                >
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3">
                    <FileText className="w-3 h-3" />
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
                  </div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">{a.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {allArticles.length === 0 && (
          <p className="text-zinc-600 text-center py-16 italic">
            Articles on this topic are coming soon.
          </p>
        )}
      </div>
    </div>
  );
}
