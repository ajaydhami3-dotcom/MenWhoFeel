import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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

  let related: { id: number; title: string; slug: string; excerpt: string }[] = [];
  try {
    related = await db
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
  } catch {
    related = [];
  }

  if (related.length === 0) return null;

  const label = topicName ? `More on ${topicName}` : "More from this topic";

  return (
    <section id="related-reads" className="scroll-mt-24 border-t border-border pt-10">
      <h3 className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </h3>
      <div className="space-y-3">
        {related.map((r) => (
          <Link
            key={r.id}
            href={`/intel/${r.slug}`}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <div className="min-w-0 flex-1">
              <h4 className="mb-1 line-clamp-2 font-display text-[15px] font-semibold text-foreground transition-colors group-hover:text-primary">
                {r.title}
              </h4>
              {r.excerpt && (
                <p className="line-clamp-1 text-xs text-muted-foreground">{r.excerpt}</p>
              )}
            </div>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </section>
  );
}
