import Link from "next/link";

export type TagItem = {
  name: string;
  slug: string;
};

export default function TagList({ tags }: { tags: TagItem[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-zinc-800">
      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 self-center mr-1">
        Tags
      </span>
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/tag/${tag.slug}`}
          className="px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400 text-xs font-bold hover:border-blue-500/50 hover:text-blue-400 hover:bg-zinc-800 transition-colors"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
