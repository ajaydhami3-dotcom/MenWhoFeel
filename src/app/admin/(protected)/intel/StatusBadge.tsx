import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  scheduled: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const LABELS: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  scheduled: "Scheduled",
};

export function StatusBadge({ status }: { status: string | null }) {
  const key = status ?? "draft";
  return (
    <Badge variant="outline" className={cn("capitalize", STYLES[key] ?? STYLES.draft)}>
      {LABELS[key] ?? key}
    </Badge>
  );
}
