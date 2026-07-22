"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Flame,
  Loader2,
  Lock,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { JourneyDay, JourneyProgressRow } from "@/server/queries/journeys";
import { getActiveDay, getDayStatus, getForgeProgressStats, type ForgeDayStatus } from "@/lib/forge-logic";

// Closely mirrors ForgeDailyView.tsx — same day-grid + detail-panel
// pattern, same forge-logic.ts functions (they already take totalDays as
// a parameter, nothing Forge-specific about them). Deliberately simpler
// in one place: the completed state has no Deep Forge/maintenance
// check-in equivalent, since none of these journeys has a "what happens
// after you finish" continuation designed yet — see
// MIGRATION_PLAN.md 4.6. If one gets designed for a given journey later,
// this is the natural place to add it, the same way Forge's version
// works today.

type ResponseLike = { dayNumber: number; responseText: string | null; moodRating: number | null };

type PendingState = {
  complete: boolean;
  skip: boolean;
  pause: boolean;
  resume: boolean;
  reset: boolean;
};

type Props = {
  journeyTitle: string;
  days: JourneyDay[];
  progress: JourneyProgressRow;
  responses: ResponseLike[];
  onComplete: (input: { dayNumber: number; responseText?: string; moodRating?: number }) => void;
  onSkip: (dayNumber: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  pending: PendingState;
};

const MOOD_LABELS = ["Rough", "Hard", "Okay", "Good", "Strong"];

export default function JourneyDailyView({
  journeyTitle,
  days,
  progress,
  responses,
  onComplete,
  onSkip,
  onPause,
  onResume,
  onReset,
  pending,
}: Props) {
  const totalDays = days.length;
  const activeDay = useMemo(() => getActiveDay(totalDays, progress), [totalDays, progress]);
  const stats = useMemo(() => getForgeProgressStats(totalDays, progress), [totalDays, progress]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const responseByDay = useMemo(() => {
    const map = new Map<number, ResponseLike>();
    responses.forEach((r) => map.set(r.dayNumber, r));
    return map;
  }, [responses]);

  if (progress.journeyCompleted) {
    return (
      <JourneyCompletedView
        journeyTitle={journeyTitle}
        days={days}
        progress={progress}
        responseByDay={responseByDay}
        onReset={onReset}
        pending={pending}
      />
    );
  }

  const effectiveSelected = selectedDay ?? activeDay ?? 1;
  const selectedDayContent = days.find((d) => d.dayNumber === effectiveSelected);
  const selectedStatus = getDayStatus(effectiveSelected, progress);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
          <span>
            {stats.completedCount} of {totalDays} days done
            {stats.skippedCount > 0 ? ` · ${stats.skippedCount} skipped` : ""}
          </span>
          <span>{stats.percent}%</span>
        </div>
        <Progress value={stats.percent} className="h-2" />
      </div>

      {progress.isPaused && <PausedBanner journeyTitle={journeyTitle} onResume={onResume} isPending={pending.resume} />}

      <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
        {days.map((day) => (
          <DayTile
            key={day.dayNumber}
            day={day}
            status={getDayStatus(day.dayNumber, progress)}
            isSelected={day.dayNumber === effectiveSelected}
            onSelect={() => setSelectedDay(day.dayNumber)}
          />
        ))}
      </div>

      {selectedDayContent && (
        <DayDetailPanel
          key={selectedDayContent.dayNumber}
          day={selectedDayContent}
          status={selectedStatus}
          response={responseByDay.get(effectiveSelected)}
          isPaused={progress.isPaused}
          onComplete={(input) => onComplete({ dayNumber: effectiveSelected, ...input })}
          onSkip={() => onSkip(effectiveSelected)}
          onPause={onPause}
          journeyTitle={journeyTitle}
          isPendingComplete={pending.complete}
          isPendingSkip={pending.skip}
          isPendingPause={pending.pause}
        />
      )}

      <div className="pt-2 flex justify-end">
        <ResetDialog journeyTitle={journeyTitle} onReset={onReset} isPending={pending.reset} />
      </div>
    </div>
  );
}

// ─── Day grid tile ──────────────────────────────────────────────────────────

function DayTile({
  day,
  status,
  isSelected,
  onSelect,
}: {
  day: JourneyDay;
  status: ForgeDayStatus;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const styles: Record<ForgeDayStatus, string> = {
    completed: "bg-primary/15 border-primary/40 text-primary",
    active: "bg-primary border-primary text-primary-foreground shadow-md",
    skipped: "bg-secondary/50 border-border text-muted-foreground",
    upcoming: "bg-card border-border text-muted-foreground",
    locked: "bg-card/40 border-border/50 text-muted-foreground/50",
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      title={day.title}
      className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all ${styles[status]} ${
        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      }`}
    >
      {status === "completed" && <CheckCircle2 className="w-4 h-4" />}
      {status === "active" && <Flame className="w-4 h-4" />}
      {status === "skipped" && <SkipForward className="w-3.5 h-3.5" />}
      {status === "locked" && <Lock className="w-3.5 h-3.5" />}
      <span className="text-[11px] font-mono font-semibold">{day.dayNumber}</span>
    </button>
  );
}

function StatusPill({ status }: { status: ForgeDayStatus }) {
  const config: Record<ForgeDayStatus, { label: string; className: string }> = {
    completed: { label: "Completed", className: "bg-primary/15 text-primary border-primary/30" },
    active: { label: "Today", className: "bg-primary text-primary-foreground border-primary" },
    skipped: { label: "Skipped", className: "bg-secondary text-muted-foreground border-border" },
    upcoming: { label: "Up next", className: "bg-secondary/60 text-muted-foreground border-border" },
    locked: { label: "Locked", className: "bg-secondary/30 text-muted-foreground/70 border-border/60" },
  };
  const { label, className } = config[status];
  return (
    <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.12em] border ${className}`}>
      {label}
    </span>
  );
}

// ─── Detail panel ───────────────────────────────────────────────────────────

function DayDetailPanel({
  day,
  status,
  response,
  isPaused,
  onComplete,
  onSkip,
  onPause,
  journeyTitle,
  isPendingComplete,
  isPendingSkip,
  isPendingPause,
}: {
  day: JourneyDay;
  status: ForgeDayStatus;
  response: ResponseLike | undefined;
  isPaused: boolean;
  onComplete: (input: { responseText?: string; moodRating?: number }) => void;
  onSkip: () => void;
  onPause: () => void;
  journeyTitle: string;
  isPendingComplete: boolean;
  isPendingSkip: boolean;
  isPendingPause: boolean;
}) {
  const [responseText, setResponseText] = useState(response?.responseText ?? "");
  const [moodRating, setMoodRating] = useState<number | undefined>(response?.moodRating ?? undefined);
  const [showExit, setShowExit] = useState(false);

  const isActionable = status === "active";

  return (
    <Card className="bg-card/70 border-border">
      <CardContent className="p-6 sm:p-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-primary mb-1">Day {day.dayNumber}</p>
            <h3 className="font-display text-2xl text-foreground">{day.title}</h3>
          </div>
          <StatusPill status={status} />
        </div>

        <p className="text-muted-foreground leading-relaxed">{day.description}</p>

        {isActionable && day.instructions && (
          <p className="text-sm text-foreground/80 bg-secondary/25 rounded-xl p-4 leading-relaxed">{day.instructions}</p>
        )}

        {status === "locked" && (
          <p className="text-sm text-muted-foreground italic">
            Finish Day {day.dayNumber - 1} first and this one opens up.
          </p>
        )}
        {status === "upcoming" && (
          <p className="text-sm text-muted-foreground italic">
            {isPaused ? `Resume ${journeyTitle} and this opens right up.` : "This opens tomorrow — one a day is the whole point."}
          </p>
        )}
        {status === "skipped" && (
          <p className="text-sm text-muted-foreground italic">
            You skipped this one — that&apos;s alright. The next day kept moving.
          </p>
        )}
        {status === "completed" && response?.moodRating && (
          <p className="text-sm text-muted-foreground">
            How it felt: <span className="text-foreground font-medium">{MOOD_LABELS[response.moodRating - 1]}</span>
          </p>
        )}
        {status === "completed" && response?.responseText && (
          <div className="text-sm text-foreground/90 bg-secondary/25 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
            {response.responseText}
          </div>
        )}

        {isActionable && (
          <div className="space-y-4 pt-2">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
                How did it go? (optional)
              </p>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Whatever you want to note — no one else sees this."
                className="min-h-28 resize-none"
                maxLength={4000}
              />
            </div>

            <div>
              <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
                How are you feeling? (optional)
              </p>
              <div className="flex flex-wrap gap-2">
                {MOOD_LABELS.map((label, i) => {
                  const value = i + 1;
                  const selected = moodRating === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMoodRating(selected ? undefined : value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                onClick={() => onComplete({ responseText: responseText.trim() || undefined, moodRating })}
                disabled={isPendingComplete}
                className="rounded-full"
              >
                {isPendingComplete ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  `Mark Day ${day.dayNumber} complete`
                )}
              </Button>

              {!showExit ? (
                <button
                  type="button"
                  onClick={() => setShowExit(true)}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  Not today?
                </button>
              ) : (
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={onSkip}
                    disabled={isPendingSkip}
                    className="text-muted-foreground hover:text-foreground underline underline-offset-4 disabled:opacity-50"
                  >
                    {isPendingSkip ? "Skipping…" : "Skip this day"}
                  </button>
                  <span className="text-border">·</span>
                  <button
                    type="button"
                    onClick={onPause}
                    disabled={isPendingPause}
                    className="text-muted-foreground hover:text-foreground underline underline-offset-4 disabled:opacity-50"
                  >
                    {isPendingPause ? "Pausing…" : `Pause ${journeyTitle}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Paused state ───────────────────────────────────────────────────────────

function PausedBanner({ journeyTitle, onResume, isPending }: { journeyTitle: string; onResume: () => void; isPending: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/30 p-5">
      <div className="flex items-center gap-3">
        <Pause className="w-5 h-5 text-muted-foreground shrink-0" />
        <p className="text-sm text-foreground">You&apos;ve paused {journeyTitle}. Your progress is exactly where you left it.</p>
      </div>
      <Button onClick={onResume} disabled={isPending} variant="outline" className="rounded-full shrink-0">
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resuming…
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" /> Resume {journeyTitle}
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Reset / start over ─────────────────────────────────────────────────────

function ResetDialog({ journeyTitle, onReset, isPending }: { journeyTitle: string; onReset: () => void; isPending: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Start {journeyTitle} over
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start over?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears your completed and skipped days and resets your current streak to zero. Your longest streak
            and anything you&apos;ve written stay saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Never mind</AlertDialogCancel>
          <AlertDialogAction onClick={onReset} disabled={isPending}>
            {isPending ? "Resetting…" : "Start over"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Completed state ────────────────────────────────────────────────────────
// Simpler than ForgeCompletedView on purpose — no maintenance check-in,
// since there's no Deep-journey continuation designed for any of these
// three yet. Just the congratulations, the stats, and the day grid for
// review.

function JourneyCompletedView({
  journeyTitle,
  days,
  progress,
  responseByDay,
  onReset,
  pending,
}: {
  journeyTitle: string;
  days: JourneyDay[];
  progress: JourneyProgressRow;
  responseByDay: Map<number, ResponseLike>;
  onReset: () => void;
  pending: PendingState;
}) {
  const totalDays = days.length;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const selectedDayContent = selectedDay ? days.find((d) => d.dayNumber === selectedDay) : undefined;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center space-y-3">
        <Trophy className="w-10 h-10 text-primary mx-auto" />
        <h2 className="font-display text-3xl text-foreground">You finished {journeyTitle}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {progress.completedDays.length} of {totalDays} days done
          {progress.skippedDays.length > 0 ? `, ${progress.skippedDays.length} skipped` : ""}. Longest streak:{" "}
          {progress.longestStreak} {progress.longestStreak === 1 ? "day" : "days"}.
        </p>
      </div>

      <div>
        <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground mb-3">
          Your {totalDays} days
        </p>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
          {days.map((day) => (
            <DayTile
              key={day.dayNumber}
              day={day}
              status={getDayStatus(day.dayNumber, progress)}
              isSelected={day.dayNumber === selectedDay}
              onSelect={() => setSelectedDay(day.dayNumber)}
            />
          ))}
        </div>
      </div>

      {selectedDayContent && (
        <DayDetailPanel
          key={selectedDayContent.dayNumber}
          day={selectedDayContent}
          status={getDayStatus(selectedDayContent.dayNumber, progress)}
          response={responseByDay.get(selectedDayContent.dayNumber)}
          isPaused={false}
          onComplete={() => {}}
          onSkip={() => {}}
          onPause={() => {}}
          journeyTitle={journeyTitle}
          isPendingComplete={false}
          isPendingSkip={false}
          isPendingPause={false}
        />
      )}

      <div className="pt-2 flex justify-end">
        <ResetDialog journeyTitle={journeyTitle} onReset={onReset} isPending={pending.reset} />
      </div>
    </div>
  );
}
