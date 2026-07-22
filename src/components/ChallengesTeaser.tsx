import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import type { PillarJourney } from "@/server/queries/pillar-content";

// Generic by default, pillar-specific when a journey is passed in
// (Phase 7 — see getPillarJourney in server/queries/pillar-content.ts).
// Falls back to the original generic /challenges copy when journey is
// null, which covers both "the calling page hasn't been updated to fetch
// one yet" and "this pillar genuinely has no journey" — same degrade-
// gracefully posture as everywhere else in this migration.
export default function ChallengesTeaser({ journey }: { journey?: PillarJourney | null }) {
  const href = journey?.href ?? "/challenges";
  const title = journey ? journey.title : "Build the habit, not just read about it";
  const description =
    journey?.description ??
    "The Forge — a daily challenge system that works alongside every pillar.";

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 p-6 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-medium text-foreground">
            {title}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
