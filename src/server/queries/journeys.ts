import { and, eq } from "drizzle-orm";
import { getDb } from "./connection";
import { journeys, journeyDays, journeyProgress, journeyResponses } from "@/db/schema";
import { daysBetweenUtc, todayUtcStr } from "@/lib/forge-logic";

// Generalizes queries/forge.ts's core mutation logic (streak computation,
// transaction structure, skip/pause semantics) for the new journeys —
// see MIGRATION_PLAN.md 4.6 / Phase 7. Deliberately does NOT port
// checkInMaintenance, saveMonthlyLog/getRecentMonthlyLogs, or the
// deepForge* fields — none of these three journeys has a "what happens
// after you finish" continuation designed yet, so there's nothing to
// generalize there. forge-logic.ts's pure day-unlock functions
// (isDayUnlocked, getDayStatus, getActiveDay, getForgeProgressStats) are
// reused as-is by journeys-router.ts and JourneyDailyView — they already
// take totalDays as a parameter rather than assuming 28, so nothing about
// them needed to change for this to work.

export type JourneyRow = typeof journeys.$inferSelect;
export type JourneyDay = typeof journeyDays.$inferSelect;
export type JourneyProgressRow = typeof journeyProgress.$inferSelect;

export async function getJourneyBySlug(slug: string): Promise<JourneyRow | null> {
  try {
    const rows = await getDb().select().from(journeys).where(eq(journeys.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error(`[queries/journeys] getJourneyBySlug(${slug}) failed:`, err);
    return null;
  }
}

/** A journey's day-by-day content, in order. Unlike getForgeDays, no
 * hardcoded content fallback — these are structural placeholders to
 * begin with (see supabase_migration_journeys.sql), so there's no real
 * content worth falling back to yet. An empty result here just means the
 * migration hasn't run; the UI shows a plain "coming soon" state. */
export async function getJourneyDays(journeyId: number): Promise<JourneyDay[]> {
  try {
    return await getDb()
      .select()
      .from(journeyDays)
      .where(eq(journeyDays.journeyId, journeyId))
      .orderBy(journeyDays.dayNumber);
  } catch (err) {
    console.error(`[queries/journeys] getJourneyDays(${journeyId}) failed:`, err);
    return [];
  }
}

/** Fetches this person's progress on one specific journey, creating it
 * (all zeros) on their first visit to it. No global counter bump, unlike
 * getOrCreateForgeProgress's totalActiveUsers — these are new, low-
 * traffic journeys; a simple COUNT(*) on journey_progress is enough if
 * that stat is ever wanted, rather than maintaining a denormalized
 * counter for it from day one. */
export async function getOrCreateJourneyProgress(userId: number, journeyId: number): Promise<JourneyProgressRow> {
  const db = getDb();
  const existing = await db
    .select()
    .from(journeyProgress)
    .where(and(eq(journeyProgress.userId, userId), eq(journeyProgress.journeyId, journeyId)))
    .limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(journeyProgress).values({ userId, journeyId }).returning();
  return created;
}

export async function getUserJourneyResponses(userId: number, journeyId: number) {
  return getDb()
    .select()
    .from(journeyResponses)
    .where(and(eq(journeyResponses.userId, userId), eq(journeyResponses.journeyId, journeyId)))
    .orderBy(journeyResponses.dayNumber);
}

/**
 * Marks a day complete: saves the reflection, advances completedDays, and
 * — only for a genuinely new completion, never a re-save/edit — updates
 * the streak. Same algorithm as completeDay in queries/forge.ts,
 * parameterized by journeyId; re-unlocks nothing on its own, callers
 * check isDayUnlocked first.
 */
export async function completeJourneyDay(params: {
  userId: number;
  journeyId: number;
  dayNumber: number;
  dayTitle: string;
  responseText?: string;
  moodRating?: number;
  totalDays: number;
}): Promise<{ progress: JourneyProgressRow; justCompletedJourney: boolean }> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [progress] = await tx
      .select()
      .from(journeyProgress)
      .where(and(eq(journeyProgress.userId, params.userId), eq(journeyProgress.journeyId, params.journeyId)))
      .limit(1);
    if (!progress) throw new Error("Journey progress not found — call journeys.init first.");

    const existingResponse = await tx
      .select({ id: journeyResponses.id })
      .from(journeyResponses)
      .where(
        and(
          eq(journeyResponses.userId, params.userId),
          eq(journeyResponses.journeyId, params.journeyId),
          eq(journeyResponses.dayNumber, params.dayNumber)
        )
      )
      .limit(1);

    if (existingResponse.length > 0) {
      await tx
        .update(journeyResponses)
        .set({
          responseText: params.responseText || null,
          moodRating: params.moodRating ?? null,
          completedAt: new Date(),
        })
        .where(eq(journeyResponses.id, existingResponse[0].id));
    } else {
      await tx.insert(journeyResponses).values({
        userId: params.userId,
        journeyId: params.journeyId,
        dayNumber: params.dayNumber,
        dayTitle: params.dayTitle,
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
    const justCompletedJourney = !progress.journeyCompleted && handledCount >= params.totalDays;
    const journeyCompleted = progress.journeyCompleted || justCompletedJourney;
    const completionDate = justCompletedJourney ? todayUtcStr() : progress.completionDate;

    const [updated] = await tx
      .update(journeyProgress)
      .set({
        completedDays,
        skippedDays,
        currentStreak,
        longestStreak,
        lastActiveDate,
        isPaused: false, // completing a day is an implicit resume
        journeyCompleted,
        completionDate,
      })
      .where(and(eq(journeyProgress.userId, params.userId), eq(journeyProgress.journeyId, params.journeyId)))
      .returning();

    return { progress: updated, justCompletedJourney };
  });
}

/** Skips a day: moves it out of the way without touching the streak —
 * same reasoning as skipDay in queries/forge.ts. */
export async function skipJourneyDay(params: {
  userId: number;
  journeyId: number;
  dayNumber: number;
  totalDays: number;
}): Promise<JourneyProgressRow> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [progress] = await tx
      .select()
      .from(journeyProgress)
      .where(and(eq(journeyProgress.userId, params.userId), eq(journeyProgress.journeyId, params.journeyId)))
      .limit(1);
    if (!progress) throw new Error("Journey progress not found — call journeys.init first.");

    const alreadyHandled =
      progress.completedDays.includes(params.dayNumber) || progress.skippedDays.includes(params.dayNumber);
    const skippedDays = alreadyHandled
      ? progress.skippedDays
      : [...progress.skippedDays, params.dayNumber].sort((a, b) => a - b);

    const handledCount = new Set([...progress.completedDays, ...skippedDays]).size;
    const justCompletedJourney = !progress.journeyCompleted && handledCount >= params.totalDays;
    const journeyCompleted = progress.journeyCompleted || justCompletedJourney;
    const completionDate = justCompletedJourney ? todayUtcStr() : progress.completionDate;

    const [updated] = await tx
      .update(journeyProgress)
      .set({ skippedDays, journeyCompleted, completionDate })
      .where(and(eq(journeyProgress.userId, params.userId), eq(journeyProgress.journeyId, params.journeyId)))
      .returning();

    return updated;
  });
}

export async function pauseJourney(userId: number, journeyId: number): Promise<JourneyProgressRow> {
  const [updated] = await getDb()
    .update(journeyProgress)
    .set({ isPaused: true })
    .where(and(eq(journeyProgress.userId, userId), eq(journeyProgress.journeyId, journeyId)))
    .returning();
  return updated;
}

/** Resuming backdates lastActiveDate to "yesterday" (never forward) so
 * the next completion continues the streak instead of the pause itself
 * reading as a missed day — same forgiveness as resumeForge. */
export async function resumeJourney(userId: number, journeyId: number): Promise<JourneyProgressRow> {
  const db = getDb();
  const [progress] = await db
    .select()
    .from(journeyProgress)
    .where(and(eq(journeyProgress.userId, userId), eq(journeyProgress.journeyId, journeyId)))
    .limit(1);
  if (!progress) throw new Error("Journey progress not found — call journeys.init first.");

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
    .update(journeyProgress)
    .set({ isPaused: false, lastActiveDate: forgivenLastActiveDate })
    .where(and(eq(journeyProgress.userId, userId), eq(journeyProgress.journeyId, journeyId)))
    .returning();
  return updated;
}

/** "Start over" — clears the day-by-day run but keeps longestStreak and
 * past written reflections intact, same posture as resetForgeProgress. */
export async function resetJourneyProgress(userId: number, journeyId: number): Promise<JourneyProgressRow> {
  const [updated] = await getDb()
    .update(journeyProgress)
    .set({
      completedDays: [],
      skippedDays: [],
      currentStreak: 0,
      lastActiveDate: null,
      isPaused: false,
      journeyCompleted: false,
      completionDate: null,
    })
    .where(and(eq(journeyProgress.userId, userId), eq(journeyProgress.journeyId, journeyId)))
    .returning();
  return updated;
}
