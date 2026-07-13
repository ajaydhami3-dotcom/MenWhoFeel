"use client";

import { useMemo, useState } from "react";
import type { ElementType } from "react";
import { toast } from "sonner";
import { AlertCircle, Calendar, CheckCircle2, Edit3, Flame, Loader2, Lock, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ForgeDailyView from "./ForgeDailyView";
import type { ForgeDay } from "@/server/queries/forge";

export type WeeklyChallenge = {
  id: number;
  title: string;
  description: string;
  type: string;
};

type Props = {
  // Server-rendered — titles/descriptions are already in the HTML.
  forgeDays: ForgeDay[];
  weeklyChallenges: WeeklyChallenge[];
  // SSR'd so the header never has to wait on the client for this number.
  initialStats: { totalForgeCompletions: number; totalActiveUsers: number };
};

type Tab = "daily" | "weekly" | "monthly";

export default function ChallengesClient({ forgeDays, weeklyChallenges, initialStats }: Props) {
  const { isReady: authReady, error: authError } = useAuth();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<Tab>("daily");

  // Everyone's own progress — genuinely per-person now, backed by a real
  // (anonymous) Supabase session instead of a hardcoded shared identity.
  const forgeInit = trpc.forge.init.useQuery(undefined, { enabled: authReady });
  const weeklyProgress = trpc.challenges.getUserProgress.useQuery(undefined, { enabled: authReady });
  const monthlyLogs = trpc.forge.getMonthlyLogs.useQuery(undefined, {
    enabled: authReady && activeTab === "monthly",
  });

  const refreshForge = () => utils.forge.init.invalidate();

  const completeMutation = trpc.forge.completeDay.useMutation({
    onSuccess: () => {
      refreshForge();
      toast.success("Day marked complete. Nice work.");
    },
    onError: (err) => toast.error(err.message || "Couldn't save that — try again."),
  });
  const skipMutation = trpc.forge.skipDay.useMutation({
    onSuccess: () => {
      refreshForge();
      toast("Day skipped.");
    },
    onError: (err) => toast.error(err.message || "Couldn't skip that — try again."),
  });
  const pauseMutation = trpc.forge.pause.useMutation({
    onSuccess: () => {
      refreshForge();
      toast("The Forge is paused. Resume whenever you're ready.");
    },
    onError: (err) => toast.error(err.message || "Couldn't pause — try again."),
  });
  const resumeMutation = trpc.forge.resume.useMutation({
    onSuccess: () => {
      refreshForge();
      toast.success("Welcome back.");
    },
    onError: (err) => toast.error(err.message || "Couldn't resume — try again."),
  });
  const resetMutation = trpc.forge.reset.useMutation({
    onSuccess: () => {
      refreshForge();
      toast("Started over — Day 1 is up.");
    },
    onError: (err) => toast.error(err.message || "Couldn't reset — try again."),
  });
  const maintenanceMutation = trpc.forge.checkInMaintenance.useMutation({
    onSuccess: () => {
      refreshForge();
      toast.success("Checked in.");
    },
    onError: (err) => toast.error(err.message || "Couldn't check in — try again."),
  });
  const weeklyCompleteMutation = trpc.challenges.completeChallenge.useMutation({
    onSuccess: () => {
      utils.challenges.getUserProgress.invalidate();
      toast.success("Marked done.");
    },
    onError: (err) => toast.error(err.message || "Couldn't save that — try again."),
  });
  const saveLogMutation = trpc.forge.saveMonthlyLog.useMutation({
    onSuccess: () => {
      utils.forge.getMonthlyLogs.invalidate();
      toast.success("Log saved.");
    },
    onError: (err) => toast.error(err.message || "Couldn't save — try again."),
  });

  const progress = forgeInit.data?.progress;
  const responses = forgeInit.data?.responses ?? [];
  const stats = forgeInit.data?.stats ?? initialStats;
  const completedWeeklyIds = useMemo(
    () => weeklyProgress.data?.map((p) => p.challengeId) ?? [],
    [weeklyProgress.data]
  );

  const isLoadingCore = !authReady || forgeInit.isLoading;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-[0.18em]">The Forge</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground">Challenges</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            {stats.totalForgeCompletions > 0
              ? `${stats.totalForgeCompletions.toLocaleString()} ${
                  stats.totalForgeCompletions === 1 ? "man has" : "men have"
                } finished the Forge.`
              : "One challenge a day. Discipline is built slowly."}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-5 py-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Current streak</p>
            <p className="text-xl font-display text-foreground">
              {progress ? `${progress.currentStreak} ${progress.currentStreak === 1 ? "day" : "days"}` : "—"}
            </p>
          </div>
          <Flame
            className={`w-7 h-7 ${progress && progress.currentStreak > 0 ? "text-primary" : "text-muted-foreground/30"}`}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        <TabButton active={activeTab === "daily"} onClick={() => setActiveTab("daily")} icon={Flame} label="Daily" />
        <TabButton active={activeTab === "weekly"} onClick={() => setActiveTab("weekly")} icon={Target} label="Weekly" />
        <TabButton
          active={activeTab === "monthly"}
          onClick={() => setActiveTab("monthly")}
          icon={Calendar}
          label="Monthly check-in"
        />
      </div>

      {authError && (
        <div className="text-sm text-destructive mb-6 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <p className="font-medium">Couldn&apos;t start a session.</p>
          <p className="text-destructive/80 mt-1">{authError}</p>
          <p className="text-muted-foreground mt-2 text-xs">
            If this says something about anonymous sign-ins, they need to be enabled in Supabase Dashboard →
            Authentication → Sign In / Providers.
          </p>
        </div>
      )}

      {isLoadingCore ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up your Forge…
        </div>
      ) : forgeInit.isError ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <AlertCircle className="w-6 h-6 text-destructive" />
          <div>
            <p className="text-foreground font-medium">Couldn&apos;t load the Forge.</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              If this is a fresh setup, the most likely cause is that{" "}
              <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">supabase_migration_forge.sql</code>{" "}
              hasn&apos;t been run yet.
            </p>
          </div>
          <Button onClick={() => forgeInit.refetch()} variant="outline" size="sm" className="rounded-full">
            Try again
          </Button>
        </div>
      ) : (
        <>
          {activeTab === "daily" && progress && (
            <ForgeDailyView
              days={forgeDays}
              progress={progress}
              responses={responses}
              onComplete={(input) => completeMutation.mutate(input)}
              onSkip={(dayNumber) => skipMutation.mutate({ dayNumber })}
              onPause={() => pauseMutation.mutate()}
              onResume={() => resumeMutation.mutate()}
              onReset={() => resetMutation.mutate()}
              onMaintenanceCheckIn={() => maintenanceMutation.mutate()}
              pending={{
                complete: completeMutation.isPending,
                skip: skipMutation.isPending,
                pause: pauseMutation.isPending,
                resume: resumeMutation.isPending,
                reset: resetMutation.isPending,
                maintenance: maintenanceMutation.isPending,
              }}
            />
          )}

          {activeTab === "weekly" && (
            <WeeklyTab
              weeklyChallenges={weeklyChallenges}
              completedWeeklyIds={completedWeeklyIds}
              completedForgeDays={progress?.completedDays ?? []}
              onComplete={(id) => weeklyCompleteMutation.mutate({ challengeId: id })}
              pendingId={weeklyCompleteMutation.isPending ? weeklyCompleteMutation.variables?.challengeId : undefined}
            />
          )}

          {activeTab === "monthly" && (
            <MonthlyTab
              recentLogs={monthlyLogs.data ?? []}
              onSave={(text) => saveLogMutation.mutate({ logText: text })}
              isPending={saveLogMutation.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-[0.12em] transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

// ─── Weekly ──────────────────────────────────────────────────────────────────

function WeeklyTab({
  weeklyChallenges,
  completedWeeklyIds,
  completedForgeDays,
  onComplete,
  pendingId,
}: {
  weeklyChallenges: WeeklyChallenge[];
  completedWeeklyIds: number[];
  completedForgeDays: number[];
  onComplete: (id: number) => void;
  pendingId: number | undefined;
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground mb-2">
        Bigger goals, longer focus — unlocked by keeping up with your daily Forge.
      </p>
      {weeklyChallenges.length === 0 ? (
        <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted-foreground italic">
          No weekly challenges added yet.
        </div>
      ) : (
        weeklyChallenges.map((challenge, index) => {
          const isCompleted = completedWeeklyIds.includes(challenge.id);
          const prevWeekDone = index === 0 || completedWeeklyIds.includes(weeklyChallenges[index - 1].id);
          const requiredDay = index * 7;
          const hasReachedRequiredDay = index === 0 || completedForgeDays.includes(requiredDay);
          const isLocked = !isCompleted && (!prevWeekDone || !hasReachedRequiredDay);

          let description = challenge.description;
          if (isLocked) {
            description = !prevWeekDone
              ? "Finish the previous weekly challenge to unlock this one."
              : `Reach Day ${requiredDay} in the Forge to unlock this one.`;
          }

          return (
            <WeeklyCard
              key={challenge.id}
              title={`Week ${index + 1}: ${challenge.title}`}
              description={description}
              isCompleted={isCompleted}
              isLocked={isLocked}
              isSaving={pendingId === challenge.id}
              onComplete={() => onComplete(challenge.id)}
            />
          );
        })
      )}
    </div>
  );
}

function WeeklyCard({
  title,
  description,
  isCompleted,
  isLocked,
  isSaving,
  onComplete,
}: {
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
  isSaving: boolean;
  onComplete: () => void;
}) {
  return (
    <Card
      className={`border-border transition-all ${isLocked ? "opacity-50" : "bg-card/70"} ${
        isCompleted ? "border-primary/30 bg-primary/5" : ""
      }`}
    >
      <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
              isCompleted
                ? "bg-primary/15 border-primary/40 text-primary"
                : isLocked
                ? "bg-secondary/40 border-border text-muted-foreground/50"
                : "bg-primary/10 border-primary/30 text-primary"
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isLocked ? <Lock className="w-5 h-5" /> : <Target className="w-5 h-5" />}
          </div>
          <div>
            <h3 className={`font-display text-lg ${isCompleted ? "text-primary" : "text-foreground"}`}>{title}</h3>
            <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
          </div>
        </div>
        {!isLocked && !isCompleted && (
          <Button onClick={onComplete} disabled={isSaving} size="sm" className="rounded-full shrink-0">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              "Mark done"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Monthly ─────────────────────────────────────────────────────────────────

function MonthlyTab({
  recentLogs,
  onSave,
  isPending,
}: {
  recentLogs: { id: number; responseText: string | null; completedAt: Date | string }[];
  onSave: (text: string) => void;
  isPending: boolean;
}) {
  const [logText, setLogText] = useState("");

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Step back and look at the last 30 days honestly. What moved? What didn&apos;t?
      </p>
      <Card className="bg-card/70 border-border">
        <CardContent className="p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3 text-primary">
            <Edit3 className="w-5 h-5" />
            <h2 className="font-display text-xl text-foreground">Monthly log</h2>
          </div>
          <Textarea
            className="min-h-48 resize-none"
            placeholder="What did you actually do this month? Where did you grow? Where did you fall short? Be honest."
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            maxLength={4000}
          />
          <Button
            onClick={() => {
              if (logText.trim()) {
                onSave(logText.trim());
                setLogText("");
              }
            }}
            disabled={isPending || !logText.trim()}
            className="self-end rounded-full"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              "Save my log"
            )}
          </Button>
        </CardContent>
      </Card>

      {recentLogs.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">Past logs</p>
          {recentLogs.map((log) => (
            <Card key={log.id} className="bg-card/50 border-border">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground font-mono mb-2">
                  {new Date(log.completedAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{log.responseText}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}