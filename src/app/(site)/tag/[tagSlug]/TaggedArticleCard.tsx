"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

// Same bug, same fix as intel/IntelClient.tsx's ArticleCard: the category
// badge used to be a <Link> nested inside this card's own outer <Link> —
// invalid HTML (an <a> inside an <a>), and the actual reason the whole
// card was unclickable with no console error to show for it. Extracted
// into its own client component since the tag page itself is a server
// component and this needs useRouter for the inner badge's click.
export function TaggedArticleCard({
  article,
}: {
  article: {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    createdAt: Date | string | null;
    categoryName: string | null;
    categorySlug: string | null;
  };
}) {
  const router = useRouter();

  return (
    <Link
      href={`/intel/${article.slug}`}
      className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-900 transition-all group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          <FileText className="w-3 h-3" />
          {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ""}
        </div>
        {article.categoryName && article.categorySlug && (
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/category/${article.categorySlug}`);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/category/${article.categorySlug}`);
              }
            }}
            className="cursor-pointer px-2 py-0.5 rounded-md bg-blue-400/10 text-blue-300 text-[10px] font-bold uppercase tracking-wide hover:bg-blue-400/20 transition-colors"
          >
            {article.categoryName}
          </span>
        )}
      </div>
      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
        {article.title}
      </h3>
      {article.excerpt && (
        <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">{article.excerpt}</p>
      )}
    </Link>
  );
}
