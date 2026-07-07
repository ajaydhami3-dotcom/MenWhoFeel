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
      className="mb-8 flex flex-wrap items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70"
    >
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
          {crumb.href && i < crumbs.length - 1 ? (
            <Link href={crumb.href} className="transition-colors hover:text-primary">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground/80">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
