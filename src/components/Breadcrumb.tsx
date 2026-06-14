import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumb({ crumbs }: { crumbs: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-10"
    >
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight className="w-3 h-3 text-zinc-700 flex-shrink-0" />
          )}
          {crumb.href && i < crumbs.length - 1 ? (
            <Link
              href={crumb.href}
              className="hover:text-blue-400 transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-zinc-400">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
