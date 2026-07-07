import Link from "next/link";

export type TagItem = {
  name: string;
  slug: string;
};

export default function TagList({ tags }: { tags: TagItem[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-8">
      <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
        Tags
      </span>
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/tag/${tag.slug}`}
          className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-secondary-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
