// SERVER component — Forge day content, weekly challenges, and the global
// stats counter are fetched at request time and included directly in the
// HTML, so search engines and first paint see the real program, not a
// loading spinner. Per-person progress (streak, completed days, etc.)
// genuinely can't be known here — it's fetched client-side via forge.init
// once useAuth() confirms an anonymous session exists.
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { challenges } from "@/db/schema";
import { getForgeDays, getAnonymousStats } from "@/server/queries/forge";
import ChallengesClient, { type WeeklyChallenge } from "./ChallengesClient";

// ISR: re-generate at most every 5 minutes so new/edited challenges show
// up without a full deploy.
export const revalidate = 300;

// Shown only if the DB has no weekly challenges yet or is unreachable —
// the same two entries the page already shipped with.
const SEED_WEEKLY: WeeklyChallenge[] = [
  {
    id: -101,
    title: "Write a letter you won't send",
    description:
      "Write an uncensored letter to someone — a person, a version of yourself, a situation. Say the thing you'd never actually say. Then decide what to do with it.",
    type: "habit",
  },
  {
    id: -102,
    title: "Sleep audit",
    description:
      "For 7 days, track when you go to sleep and wake up. No changes required — just observe the pattern honestly.",
    type: "habit",
  },
];

async function fetchWeeklyChallenges(): Promise<WeeklyChallenge[]> {
  try {
    const rows = await db
      .select()
      .from(challenges)
      .where(and(eq(challenges.active, true), eq(challenges.category, "weekly")));

    if (rows.length === 0) return SEED_WEEKLY;

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
    }));
  } catch (err) {
    console.error("[challenges/page] weekly fetch failed, using seed fallback:", err);
    return SEED_WEEKLY;
  }
}

export default async function ChallengesPage() {
  const [forgeDays, weeklyChallenges, stats] = await Promise.all([
    getForgeDays(),
    fetchWeeklyChallenges(),
    getAnonymousStats(),
  ]);

  return (
    <ChallengesClient
      forgeDays={forgeDays}
      weeklyChallenges={weeklyChallenges}
      initialStats={{
        totalForgeCompletions: stats.totalForgeCompletions,
        totalActiveUsers: stats.totalActiveUsers,
      }}
    />
  );
}
