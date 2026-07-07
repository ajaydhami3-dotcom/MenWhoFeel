import Link from "next/link";
import { HeartHandshake, Lightbulb, Info, type LucideIcon } from "lucide-react";

type Variant = "support" | "tip" | "note";

const VARIANT_STYLES: Record<Variant, { icon: LucideIcon; classes: string }> = {
  support: {
    icon: HeartHandshake,
    classes: "border-pine/30 bg-pine/[0.06] text-pine [&_a]:text-pine",
  },
  tip: {
    icon: Lightbulb,
    classes: "border-primary/30 bg-primary/[0.06] text-primary [&_a]:text-primary",
  },
  note: {
    icon: Info,
    classes: "border-border bg-muted/60 text-foreground [&_a]:text-primary",
  },
};

export default function Callout({
  variant = "note",
  title,
  children,
  href,
  linkLabel,
}: {
  variant?: Variant;
  title: string;
  children: React.ReactNode;
  href?: string;
  linkLabel?: string;
}) {
  const { icon: Icon, classes } = VARIANT_STYLES[variant];

  return (
    <aside className={`my-10 rounded-2xl border p-6 sm:p-7 ${classes}`}>
      <div className="flex items-start gap-3.5">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="mb-1.5 font-semibold">{title}</p>
          <p className="text-[15px] leading-relaxed text-foreground/80">{children}</p>
          {href && linkLabel && (
            <Link href={href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4">
              {linkLabel} →
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
