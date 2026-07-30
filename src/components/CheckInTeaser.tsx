import Link from "next/link";
import { ClipboardCheck, ArrowRight } from "lucide-react";

// Same degrade-gracefully posture as ChallengesTeaser: works with no props
// at all (generic /assessment, generic "Check In" copy) or pillar-scoped
// when a pillar slug/name are passed in from a category/topic page. Any
// pillar without its own assessment content yet just falls through to the
// shared default content (see resolveAssessmentPillar in
// assessment-content.ts) — the link itself is always pillar-labeled the
// moment a slug/name are available, whether or not that pillar's
// questions have been written yet.
export default function CheckInTeaser({
  pillarSlug,
  pillarName,
}: {
  pillarSlug?: string | null;
  pillarName?: string | null;
}) {
  const href = pillarSlug ? `/assessment?pillar=${pillarSlug}` : "/assessment";
  const title = pillarName ? `Check in on your ${pillarName}` : "Check In";
  const description =
    "A short, honest read on where you're at right now — free, anonymous, no account.";

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 p-6 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ClipboardCheck className="h-5 w-5" />
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
