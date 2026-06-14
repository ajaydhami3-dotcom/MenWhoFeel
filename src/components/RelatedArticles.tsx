import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  topicId: number | null;
  currentArticleId: number;
  topicName?: string | null;
}

export default async function RelatedArticles({
  topicId,
  currentArticleId,
  topicName,
}: Props) {
  if (!topicId) return null;

  try {
    const related = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
      })
      .from(articles)
      .where(
        and(
          eq(articles.topicId, topicId),
          ne(articles.id, currentArticleId),
          eq(articles.status, "published")
        )
      )
      .limit(4);

    if (related.length === 0) return null;

    const label = topicName ? `More on ${topicName}` : "More From This Topic";

    return (
      <section className="mt-16 pt-10 border-t border-zinc-800">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">
          {label}
        </h3>
        <div className="space-y-3">
          {related.map((r) => (
            <Link
              key={r.id}
              href={`/intel/${r.slug}`}
              className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-900 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                  {r.title}
                </h4>
                {r.excerpt && (
                  <p className="text-xs text-zinc-500 line-clamp-1">{r.excerpt}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </section>
    );
  } catch {
    return null;
  }
}
