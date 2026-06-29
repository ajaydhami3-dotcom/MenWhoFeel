"use client";

import { useMemo } from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { getSeoWarnings, type SeoCheckInput } from "@/lib/admin/seo";
import { cn } from "@/lib/utils";

export function SeoAssistant({ input }: { input: SeoCheckInput }) {
  const warnings = useMemo(() => getSeoWarnings(input), [input]);

  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400">
        <CheckCircle2 className="size-4 shrink-0" />
        Looks good — no SEO issues found.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {warnings.map((w) => (
        <li
          key={w.id}
          className={cn(
            "flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm",
            w.severity === "warning"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
              : "border-border bg-muted/40 text-muted-foreground"
          )}
        >
          {w.severity === "warning" ? (
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          ) : (
            <Info className="size-4 shrink-0 mt-0.5" />
          )}
          <span>{w.message}</span>
        </li>
      ))}
    </ul>
  );
}
