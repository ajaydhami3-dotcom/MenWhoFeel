// SERVER component — challenges list is fetched at request time and
// included directly in the HTML. No "Loading challenges..." spinner for Google.
import { db } from "@/db";
import { challenges } from "@/db/schema";
import { eq } from "drizzle-orm";
import ChallengesClient, { type ChallengeItem } from "./ChallengesClient";

// ISR: re-generate at most every 5 minutes so new challenges appear
// without a full deploy.
export const revalidate = 300;

// Seed challenges shown when the DB is unreachable or empty.
const SEED_CHALLENGES: ChallengeItem[] = [
  { id: -1,   title: "Write it down",               description: "Spend 5 minutes writing whatever's in your head. No structure, no goal — just get it out of your head and onto paper.",                                          category: "daily",  type: "habit",      instructions: null, dayOfWeek: null },
  { id: -2,   title: "One honest conversation",      description: "Tell someone — anyone — one true thing about how you're actually doing. Doesn't have to be deep. Just honest.",                                                category: "daily",  type: "habit",      instructions: null, dayOfWeek: null },
  { id: -3,   title: "Move for 10 minutes",          description: "Walk, stretch, do push-ups — doesn't matter what. 10 minutes of physical movement. Your mind follows your body.",                                             category: "daily",  type: "exercise",   instructions: null, dayOfWeek: null },
  { id: -4,   title: "No phone for one hour",        description: "Pick an hour today and put the phone in another room. Notice what fills the space.",                                                                          category: "daily",  type: "discipline", instructions: null, dayOfWeek: null },
  { id: -5,   title: "Name three things",            description: "Before you sleep tonight, name three specific things that happened today — not things to be grateful for, just three things that were real.",                 category: "daily",  type: "habit",      instructions: null, dayOfWeek: null },
  { id: -6,   title: "Reach out first",              description: "Message or call someone you haven't spoken to in a while. Don't wait for them to check on you.",                                                            category: "daily",  type: "habit",      instructions: null, dayOfWeek: null },
  { id: -7,   title: "One thing you've been avoiding", description: "Pick one task or conversation you've been putting off and take one small step toward it today.",                                                            category: "daily",  type: "discipline", instructions: null, dayOfWeek: null },
  { id: -101, title: "Write a letter you won't send", description: "Write an uncensored letter to someone — a person, a version of yourself, a situation. Say the thing you'd never actually say. Then decide what to do with it.", category: "weekly", type: "habit",      instructions: null, dayOfWeek: null },
  { id: -102, title: "Sleep audit",                  description: "For 7 days, track when you go to sleep and wake up. No changes required — just observe the pattern honestly.",                                                category: "weekly", type: "habit",      instructions: null, dayOfWeek: null },
];

async function fetchActiveChallenges(): Promise<ChallengeItem[]> {
  try {
    const rows = await db
      .select()
      .from(challenges)
      .where(eq(challenges.active, true));

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      type: r.type,
      instructions: r.instructions ?? null,
      dayOfWeek: r.dayOfWeek ?? null,
    }));
  } catch (err) {
    // DB unavailable — fall back to seeds.
    console.error("[challenges/page] DB fetch failed, using seed challenges:", err);
    return [];
  }
}

export default async function ChallengesPage() {
  const dbChallenges = await fetchActiveChallenges();
  const initialChallenges = dbChallenges.length > 0 ? dbChallenges : SEED_CHALLENGES;

  // Challenge titles and descriptions are embedded in the server-rendered HTML.
  // The client component handles user progress overlays via tRPC (user-specific).
  return <ChallengesClient initialChallenges={initialChallenges} />;
}
