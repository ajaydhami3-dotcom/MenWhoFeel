import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "./connection";
import { anonymousStats, challengeResponses, challenges, forgeProgress } from "@/db/schema";
import { daysBetweenUtc, todayUtcStr } from "@/lib/forge-logic";

export type ForgeDay = {
  dayNumber: number;
  title: string;
  description: string;
  instructions: string | null;
  type: string;
};

/**
 * Shown only if `challenges` has no category='daily' rows yet — a brand
 * new environment, not the normal case. Production already has real Forge
 * content seeded (the day count that made "28 challenge titles" true in
 * the first place); this is a floor so the page never renders empty, not
 * a substitute for that content. It intentionally reuses the same seven
 * entries the old page.tsx already had written and shipped, rather than
 * inventing new "Day 8–28" copy for a mental-health program that wasn't
 * this pass's to write.
 */
export const FORGE_SEED_DAYS: ForgeDay[] = [
  {
    dayNumber: 1,
    title: "Write it down",
    description:
      "Spend 5 minutes writing whatever's in your head. No structure, no goal — just get it out of your head and onto paper.",
    instructions:
      "Grab any piece of paper or open a blank note. Set a timer for 5 minutes and write continuously — don't edit, don't reread, don't worry about it making sense. When the timer ends, stop. You don't have to keep or show anyone what you wrote.",
    type: "habit",
  },
  {
    dayNumber: 2,
    title: "One honest conversation",
    description:
      "Tell someone — anyone — one true thing about how you're actually doing. Doesn't have to be deep. Just honest.",
    instructions:
      "Pick one person you'll talk to today. When it feels natural, swap one honest sentence about how you're doing in for the usual \"I'm fine.\" That's the whole challenge — one true sentence.",
    type: "habit",
  },
  {
    dayNumber: 3,
    title: "Move for 10 minutes",
    description:
      "Walk, stretch, do push-ups — doesn't matter what. 10 minutes of physical movement. Your mind follows your body.",
    instructions:
      "Set a timer for 10 minutes and move — a walk, stretching, bodyweight exercises, whatever you have access to right now. The bar is 10 minutes, not intensity.",
    type: "exercise",
  },
  {
    dayNumber: 4,
    title: "No phone for one hour",
    description: "Pick an hour today and put the phone in another room. Notice what fills the space.",
    instructions:
      "Choose one hour today. Put your phone in another room or somewhere you can't casually reach it. Notice what you reach for instead, and what shows up when nothing does.",
    type: "discipline",
  },
  {
    dayNumber: 5,
    title: "Name three things",
    description:
      "Before you sleep tonight, name three specific things that happened today — not things to be grateful for, just three things that were real.",
    instructions:
      "Tonight, before bed, name three specific things that happened today. Not a gratitude list — just three real, specific moments, good or bad.",
    type: "habit",
  },
  {
    dayNumber: 6,
    title: "Reach out first",
    description: "Message or call someone you haven't spoken to in a while. Don't wait for them to check on you.",
    instructions:
      "Think of someone you haven't talked to in a while. Send the message or make the call first today — don't wait for them to reach out to you.",
    type: "habit",
  },
  {
    dayNumber: 7,
    title: "One thing you've been avoiding",
    description: "Pick one task or conversation you've been putting off and take one small step toward it today.",
    instructions:
      "Name the thing you've been avoiding. Don't finish it today — just take one small, concrete step toward it.",
    type: "discipline",
  },
];

/** The Forge's day content, in order. Falls back to FORGE_SEED_DAYS if the
 * table is empty or unreachable — same "never show an empty page" pattern
 * used elsewhere in this app (e.g. the homepage's SEED_* fallbacks). */
export async function getForgeDays(): Promise<ForgeDay[]> {
  try {
    const rows = await getDb()
      .select()
      .from(challenges)
      .where(and(eq(challenges.category, "daily"), eq(challenges.active, true)))
      .orderBy(challenges.dayNumber);

    if (rows.length === 0) return FORGE_SEED_DAYS;

    return rows
      .filter((r) => r.dayNumber != null && r.dayNumber > 0)
      .map((r) => ({
        dayNumber: r.dayNumber as number,
        title: r.title,
        description: r.description,
        instructions: r.instructions,
        type: r.type,
      }));
  } catch (err) {
    console.error("[queries/forge] getForgeDays failed, using seed fallback:", err);
    return FORGE_SEED_DAYS;
  }
}

export type ForgeProgressRow = typeof forgeProgress.$inferSelect;

/** Fetches this person's Forge progress row, creating it (all zeros) on
 * their very first visit. Bumps the global "active users" counter
 * best-effort when a row is actually created — a display number, not
 * something worth ever blocking someone starting the Forge over. */
export async function getOrCreateForgeProgress(userId: number): Promise<ForgeProgressRow> {
  const db = getDb();
  const existing = await db.select().from(forgeProgress).where(eq(forgeProgress.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(forgeProgress).values({ userId }).returning();

  try {
    await db
      .update(anonymousStats)
      .set({ totalActiveUsers: sql`${anonymousStats.totalActiveUsers} + 1`, updatedAt: new Date() })
      .where(eq(anonymousStats.id, 1));
  } catch (err) {
    console.error("[queries/forge] failed to bump totalActiveUsers:", err);
  }

  return created;
}

/** Every real-day (1..N) reflection this person has saved, for reviewing
 * a completed day or picking back up where they left off. */
export async function getUserResponses(userId: number) {
  return getDb()
    .select()
    .from(challengeResponses)
    .where(and(eq(challengeResponses.userId, userId), sql`${challengeResponses.dayNumber} > 0`))
    .orderBy(challengeResponses.dayNumber);
}

/**
 * Marks a day complete: saves the reflection, advances completedDays,
 * and — only for a genuinely new completion, never a re-save/edit —
 * updates the streak. Re-unlocks nothing on its own; forge-router checks
 * `isDayUnlocked` before ever calling this.
 */
export async function completeDay(params: {
  userId: number;
  dayNumber: number;
  challengeTitle: string;
  responseText?: string;
  moodRating?: number;
  totalDays: number;
}): Promise<{ progress: ForgeProgressRow; justCompletedForge: boolean }> {
  const db = getDb();

  const result = await db.transaction(async (tx) => {
    const [progress] = await tx.select().from(forgeProgress).where(eq(forgeProgress.userId, params.userId)).limit(1);
    if (!progress) throw new Error("Forge progress not found — call forge.init first.");

    // Upsert this day's reflection (one row per real day — see the
    // migration's partial unique index).
    const existingResponse = await tx
      .select({ id: challengeResponses.id })
      .from(challengeResponses)
      .where(and(eq(challengeResponses.userId, params.userId), eq(challengeResponses.dayNumber, params.dayNumber)))
      .limit(1);

    if (existingResponse.length > 0) {
      await tx
        .update(challengeResponses)
        .set({
          responseText: params.responseText || null,
          moodRating: params.moodRating ?? null,
          completedAt: new Date(),
        })
        .where(eq(challengeResponses.id, existingResponse[0].id));
    } else {
      await tx.insert(challengeResponses).values({
        userId: params.userId,
        dayNumber: params.dayNumber,
        challengeTitle: params.challengeTitle,
        responseText: params.responseText || null,
        moodRating: params.moodRating ?? null,
      });
    }

    const wasAlreadyCompleted = progress.completedDays.includes(params.dayNumber);
    const completedDays = wasAlreadyCompleted
      ? progress.completedDays
      : [...progress.completedDays, params.dayNumber].sort((a, b) => a - b);
    const skippedDays = progress.skippedDays.filter((d) => d !== params.dayNumber);

    let currentStreak = progress.currentStreak;
    let lastActiveDate = progress.lastActiveDate;

    // Only a genuinely new completion moves the streak — re-saving an
    // already-completed day's reflection shouldn't double count.
    if (!wasAlreadyCompleted) {
      const today = todayUtcStr();
      if (!lastActiveDate) {
        currentStreak = 1;
      } else {
        const gap = daysBetweenUtc(lastActiveDate, today);
        currentStreak = gap <= 0 ? Math.max(progress.currentStreak, 1) : gap === 1 ? progress.currentStreak + 1 : 1;
      }
      lastActiveDate = today;
    }

    const longestStreak = Math.max(progress.longestStreak, currentStreak);
    const handledCount = new Set([...completedDays, ...skippedDays]).size;
    const justCompletedForge = !progress.forgeCompleted && handledCount >= params.totalDays;
    const forgeCompleted = progress.forgeCompleted || justCompletedForge;
    const completionDate = justCompletedForge ? todayUtcStr() : progress.completionDate;

    const [updated] = await tx
      .update(forgeProgress)
      .set({
        completedDays,
        skippedDays,
        currentStreak,
        longestStreak,
        lastActiveDate,
        isPaused: false, // completing a day is an implicit resume
        forgeCompleted,
        completionDate,
      })
      .where(eq(forgeProgress.userId, params.userId))
      .returning();

    return { progress: updated, justCompletedForge };
  });

  if (result.justCompletedForge) {
    try {
      await db
        .update(anonymousStats)
        .set({ totalForgeCompletions: sql`${anonymousStats.totalForgeCompletions} + 1`, updatedAt: new Date() })
        .where(eq(anonymousStats.id, 1));
    } catch (err) {
      console.error("[queries/forge] failed to bump totalForgeCompletions:", err);
    }
  }

  return result;
}

/** Skips a day: moves it out of the way (so the next one can unlock)
 * without touching the streak — you didn't do the challenge, so pretending
 * otherwise would make the streak meaningless. */
export async function skipDay(params: {
  userId: number;
  dayNumber: number;
  totalDays: number;
}): Promise<ForgeProgressRow> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [progress] = await tx.select().from(forgeProgress).where(eq(forgeProgress.userId, params.userId)).limit(1);
    if (!progress) throw new Error("Forge progress not found — call forge.init first.");

    const alreadyHandled =
      progress.completedDays.includes(params.dayNumber) || progress.skippedDays.includes(params.dayNumber);
    const skippedDays = alreadyHandled
      ? progress.skippedDays
      : [...progress.skippedDays, params.dayNumber].sort((a, b) => a - b);

    const handledCount = new Set([...progress.completedDays, ...skippedDays]).size;
    const justCompletedForge = !progress.forgeCompleted && handledCount >= params.totalDays;
    const forgeCompleted = progress.forgeCompleted || justCompletedForge;
    const completionDate = justCompletedForge ? todayUtcStr() : progress.completionDate;

    const [updated] = await tx
      .update(forgeProgress)
      .set({ skippedDays, forgeCompleted, completionDate })
      .where(eq(forgeProgress.userId, params.userId))
      .returning();

    return updated;
  });
}

export async function pauseForge(userId: number): Promise<ForgeProgressRow> {
  const [updated] = await getDb()
    .update(forgeProgress)
    .set({ isPaused: true })
    .where(eq(forgeProgress.userId, userId))
    .returning();
  return updated;
}

/** Resuming backdates lastActiveDate to "yesterday" (never forward, only
 * ever forgiving) so the very next completion continues the streak
 * instead of the pause itself reading as a missed day. */
export async function resumeForge(userId: number): Promise<ForgeProgressRow> {
  const db = getDb();
  const [progress] = await db.select().from(forgeProgress).where(eq(forgeProgress.userId, userId)).limit(1);
  if (!progress) throw new Error("Forge progress not found — call forge.init first.");

  const yesterday = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const forgivenLastActiveDate =
    progress.lastActiveDate && daysBetweenUtc(progress.lastActiveDate, yesterday) <= 0
      ? progress.lastActiveDate
      : yesterday;

  const [updated] = await db
    .update(forgeProgress)
    .set({ isPaused: false, lastActiveDate: forgivenLastActiveDate })
    .where(eq(forgeProgress.userId, userId))
    .returning();
  return updated;
}

/** "Start over" — resets the day-by-day run itself, but deliberately
 * keeps longestStreak and any Deep Forge/maintenance history intact.
 * Those read as lifetime stats, not something a restart should erase.
 * Past written reflections (challenge_responses) are untouched too. */
export async function resetForgeProgress(userId: number): Promise<ForgeProgressRow> {
  const [updated] = await getDb()
    .update(forgeProgress)
    .set({
      completedDays: [],
      skippedDays: [],
      currentStreak: 0,
      lastActiveDate: null,
      isPaused: false,
      forgeCompleted: false,
      completionDate: null,
      maintenanceMode: false,
    })
    .where(eq(forgeProgress.userId, userId))
    .returning();
  return updated;
}

/**
 * Post-Day-28 "keep the streak alive" check-in. There's no real Deep Forge
 * curriculum yet, so this just extends the same completion/streak
 * mechanic with a symmetrical 28-checkin milestone, rather than leaving
 * graduates with a dead end.
 */
export async function checkInMaintenance(userId: number): Promise<ForgeProgressRow> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [progress] = await tx.select().from(forgeProgress).where(eq(forgeProgress.userId, userId)).limit(1);
    if (!progress) throw new Error("Forge progress not found — call forge.init first.");
    if (!progress.forgeCompleted) throw new Error("Maintenance check-ins open up after finishing the Forge.");

    const today = todayUtcStr();
    if (progress.lastActiveDate === today) return progress; // already checked in today

    let currentStreak: number;
    if (!progress.lastActiveDate) {
      currentStreak = 1;
    } else {
      const gap = daysBetweenUtc(progress.lastActiveDate, today);
      currentStreak = gap === 1 ? progress.currentStreak + 1 : 1;
    }

    const longestStreak = Math.max(progress.longestStreak, currentStreak);
    const deepForgeProgress = progress.deepForgeProgress + 1;
    const deepForgeCompleted = progress.deepForgeCompleted || deepForgeProgress >= 28;

    const [updated] = await tx
      .update(forgeProgress)
      .set({
        maintenanceMode: true,
        currentStreak,
        longestStreak,
        lastActiveDate: today,
        deepForgeProgress,
        deepForgeCompleted,
      })
      .where(eq(forgeProgress.userId, userId))
      .returning();

    return updated;
  });
}

/** Monthly-tab log entries reuse challenge_responses with the dayNumber=0
 * sentinel (see the migration's partial unique index) so they can recur —
 * one row per save, not upserted, giving a small history for free. */
export async function saveMonthlyLog(userId: number, logText: string) {
  const [row] = await getDb()
    .insert(challengeResponses)
    .values({ userId, dayNumber: 0, challengeTitle: "Monthly reflection", responseText: logText })
    .returning();
  return row;
}

export async function getRecentMonthlyLogs(userId: number, limit = 6) {
  return getDb()
    .select()
    .from(challengeResponses)
    .where(and(eq(challengeResponses.userId, userId), eq(challengeResponses.dayNumber, 0)))
    .orderBy(desc(challengeResponses.completedAt))
    .limit(limit);
}

export async function getAnonymousStats() {
  try {
    const rows = await getDb().select().from(anonymousStats).where(eq(anonymousStats.id, 1)).limit(1);
    return rows[0] ?? { id: 1, totalForgeCompletions: 0, totalActiveUsers: 0, updatedAt: new Date() };
  } catch (err) {
    // Same "never take the page down" posture as getForgeDays() above —
    // this is public, low-stakes display data with an obvious safe
    // default. Most likely cause if this fires: supabase_migration_forge.sql
    // hasn't been run yet, so the table doesn't exist.
    console.error("[queries/forge] getAnonymousStats failed, defaulting to zeros:", err);
    return { id: 1, totalForgeCompletions: 0, totalActiveUsers: 0, updatedAt: new Date() };
  }
}