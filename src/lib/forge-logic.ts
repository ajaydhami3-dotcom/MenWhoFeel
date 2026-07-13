// Pure Forge unlock/status logic — no DB, no server-only imports. Both
// ForgeDailyView.tsx (what to render) and forge-router.ts (what to actually
// allow) call into this file for the exact same rule, so the UI can never
// show something as available that the server would then reject, or vice
// versa.
//
// The pacing rule itself — one real day unlocks per calendar day — is
// deliberate ("discipline is built slowly," not a bug to remove). What was
// actually broken before this rebuild was everything *around* that rule:
// every visitor shared one hardcoded identity, locked days showed zero
// preview info, and there was no way to skip/pause/restart gracefully.
// Those are the things this file (and forge-router.ts) fixes.

export type ForgeDayStatus = "completed" | "skipped" | "active" | "upcoming" | "locked";

export type MinimalForgeProgress = {
  completedDays: number[];
  skippedDays: number[];
  lastActiveDate: string | null; // "yyyy-MM-dd", UTC calendar date
  isPaused: boolean;
};

/** Today as a UTC "yyyy-MM-dd" string — kept as one function so every
 * comparison in this file uses the same clock. UTC (rather than the
 * server's or the visitor's local timezone) is a deliberate simplification
 * for v1: it means the exact hour a day "opens" can be a few hours off
 * from someone's local midnight, but it's consistent and never drifts
 * with server region. */
export function todayUtcStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Day 1 is always open. Day N (N>1) opens once day N-1 is completed or
 * skipped, AND only once a new calendar day has begun since that
 * happened. Pausing suspends new unlocks entirely — nothing progresses,
 * but nothing already earned is lost either. */
export function isDayUnlocked(dayNumber: number, progress: MinimalForgeProgress): boolean {
  if (dayNumber === 1) return true;

  const priorHandled =
    progress.completedDays.includes(dayNumber - 1) || progress.skippedDays.includes(dayNumber - 1);
  if (!priorHandled) return false;
  if (progress.isPaused) return false;
  if (!progress.lastActiveDate) return true;
  return progress.lastActiveDate < todayUtcStr();
}

/** "locked" = still behind earlier undone days. "upcoming" = next in line,
 * just waiting on the calendar (or a resume) — a meaningful distinction
 * for the UI, since "Day 12 opens tomorrow" and "finish Day 8 first" are
 * different messages the old design never had room for either way. */
export function getDayStatus(dayNumber: number, progress: MinimalForgeProgress): ForgeDayStatus {
  if (progress.completedDays.includes(dayNumber)) return "completed";
  if (progress.skippedDays.includes(dayNumber)) return "skipped";
  if (isDayUnlocked(dayNumber, progress)) return "active";

  const priorHandled =
    dayNumber === 1 ||
    progress.completedDays.includes(dayNumber - 1) ||
    progress.skippedDays.includes(dayNumber - 1);
  return priorHandled ? "upcoming" : "locked";
}

/** The one day that should currently be presented as "today's challenge" —
 * the lowest-numbered day that's unlocked and not yet handled. Null means
 * there's nothing to do right now (paused, or the whole program is done). */
export function getActiveDay(totalDays: number, progress: MinimalForgeProgress): number | null {
  for (let day = 1; day <= totalDays; day++) {
    const handled = progress.completedDays.includes(day) || progress.skippedDays.includes(day);
    if (!handled && isDayUnlocked(day, progress)) return day;
  }
  return null;
}

export function getForgeProgressStats(totalDays: number, progress: MinimalForgeProgress) {
  const handledCount = new Set([...progress.completedDays, ...progress.skippedDays]).size;
  return {
    handledCount,
    completedCount: progress.completedDays.length,
    skippedCount: progress.skippedDays.length,
    percent: totalDays > 0 ? Math.round((handledCount / totalDays) * 100) : 0,
    isComplete: totalDays > 0 && handledCount >= totalDays,
  };
}

/** UTC calendar-day gap between two "yyyy-MM-dd" strings — used by the
 * streak math in queries/forge.ts. Doing this by hand (rather than
 * `new Date(str)` subtraction) sidesteps the classic pitfall where
 * date-only strings parse as UTC midnight but `new Date()` is local time,
 * which can silently put same-day comparisons off by one near midnight. */
export function daysBetweenUtc(fromStr: string, toStr: string): number {
  const toUtcDayIndex = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return Date.UTC(y, m - 1, day) / 86_400_000;
  };
  return toUtcDayIndex(toStr) - toUtcDayIndex(fromStr);
}
