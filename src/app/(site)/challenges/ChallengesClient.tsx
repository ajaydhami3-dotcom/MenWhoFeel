"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import {
  Lock, CheckCircle2, Flame, Trophy, Timer, Calendar,
  Target, Edit3, Loader2, Sword,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChallengeItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  instructions: string | null;
  dayOfWeek: number | null;
};

interface Props {
  // Challenges list is server-rendered — titles/descriptions are in the HTML.
  // User progress is still fetched client-side (it's user-specific).
  initialChallenges: ChallengeItem[];
}

const TEST_USER_ID = "guest_warrior_1";

// ─── Main client component ────────────────────────────────────────────────────

export default function ChallengesClient({ initialChallenges }: Props) {
  const utils = trpc.useUtils();

  // Only progress is fetched via tRPC — it's user-specific and can't be SSR'd.
  // The challenges list itself comes from server props — no useQuery, no spinner.
  const { data: progress } = trpc.challenges.getUserProgress.useQuery({
    userIdentifier: TEST_USER_ID,
  });

  const completeMutation = trpc.challenges.completeChallenge.useMutation({
    onSuccess: () => { utils.challenges.getUserProgress.invalidate(); },
  });

  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [monthlyLog, setMonthlyLog] = useState("");

  // ── ALL HOOKS BEFORE ANY EARLY RETURN ──────────────────────────────────────

  const currentStreak = useMemo(() => {
    if (!progress || progress.length === 0) return 0;
    const dates = progress
      .filter((p) => p.completedAt)
      .map((p) => new Date(p.completedAt!).setHours(0, 0, 0, 0));
    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
    if (uniqueDates.length === 0) return 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;
    let streak = 0;
    let checkDate = today;
    if (uniqueDates[0] === today) {
      streak++;
      checkDate = yesterday;
      uniqueDates.shift();
    } else if (uniqueDates[0] === yesterday) {
      checkDate = yesterday;
    } else {
      return 0;
    }
    for (const date of uniqueDates) {
      if (date === checkDate) { streak++; checkDate -= 86400000; }
      else break;
    }
    return streak;
  }, [progress]);

  const completedIds = useMemo(() => progress?.map((p) => p.challengeId) ?? [], [progress]);

  const dailyChallenges = useMemo(
    () => initialChallenges.filter((c) => c.category === "daily"),
    [initialChallenges]
  );

  const weeklyChallenges = useMemo(
    () => initialChallenges.filter((c) => c.category === "weekly"),
    [initialChallenges]
  );

  const hasDoneDailyToday = useMemo(() => {
    if (!progress) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    return progress.some((p) => {
      if (!p.completedAt) return false;
      const ch = dailyChallenges.find((c) => c.id === p.challengeId);
      if (!ch) return false;
      return new Date(p.completedAt).setHours(0, 0, 0, 0) === today;
    });
  }, [progress, dailyChallenges]);

  const sortedDailyChallenges = useMemo(() => {
    const withIdx = dailyChallenges.map((c, i) => ({ ...c, originalIndex: i }));
    const incomplete = withIdx.filter((c) => !completedIds.includes(c.id));
    const completed  = withIdx.filter((c) => completedIds.includes(c.id));
    return [...incomplete, ...completed];
  }, [dailyChallenges, completedIds]);

  const sortedWeeklyChallenges = useMemo(() => {
    const withIdx = weeklyChallenges.map((c, i) => ({ ...c, originalIndex: i }));
    const incomplete = withIdx.filter((c) => !completedIds.includes(c.id));
    const completed  = withIdx.filter((c) => completedIds.includes(c.id));
    return [...incomplete, ...completed];
  }, [weeklyChallenges, completedIds]);

  const todayIndex = useMemo(() => {
    return sortedDailyChallenges.findIndex((c) => {
      if (completedIds.includes(c.id)) return false;
      const prevDone =
        c.originalIndex === 0 ||
        completedIds.includes(dailyChallenges[c.originalIndex - 1]?.id);
      const seqLocked = c.originalIndex > 0 && !prevDone;
      return !seqLocked && !hasDoneDailyToday;
    });
  }, [sortedDailyChallenges, completedIds, dailyChallenges, hasDoneDailyToday]);

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#060810] text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Sword className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">The Forge</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">Challenges</h1>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Current streak</p>
              <p className="text-xl font-black text-amber-500">
                {currentStreak} {currentStreak === 1 ? "day" : "days"}
              </p>
            </div>
            <Flame className={`w-8 h-8 ${currentStreak > 0 ? "text-amber-500" : "text-zinc-700"}`} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-10 border-b border-zinc-800 pb-4">
          <TabButton active={activeTab === "daily"}   onClick={() => setActiveTab("daily")}   icon={Flame}    label="Daily" />
          <TabButton active={activeTab === "weekly"}  onClick={() => setActiveTab("weekly")}  icon={Target}   label="Weekly" />
          <TabButton active={activeTab === "monthly"} onClick={() => setActiveTab("monthly")} icon={Calendar} label="Monthly check-in" />
        </div>

        {/* ── DAILY ── */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            <p className="text-zinc-400 font-medium mb-6">One challenge per day. Discipline is built slowly.</p>
            {sortedDailyChallenges.map((challenge, displayIndex) => {
              const isCompleted  = completedIds.includes(challenge.id);
              const prevDone     = challenge.originalIndex === 0 ||
                                   completedIds.includes(dailyChallenges[challenge.originalIndex - 1]?.id);
              const isSeqLocked  = challenge.originalIndex > 0 && !prevDone;
              const isTimeLocked = !isCompleted && !isSeqLocked && hasDoneDailyToday;
              const isToday      = displayIndex === todayIndex;

              return (
                <ChallengeCard
                  key={challenge.id}
                  title={`Day ${challenge.originalIndex + 1}: ${challenge.title}`}
                  description={
                    isSeqLocked  ? "Finish the previous challenge to unlock this one." :
                    isTimeLocked ? "Come back tomorrow. One a day is the whole point."  :
                    challenge.description
                  }
                  isCompleted={isCompleted}
                  isLocked={isSeqLocked || isTimeLocked}
                  lockReason={isTimeLocked ? "time" : "sequence"}
                  isToday={isToday}
                  isSaving={completeMutation.isPending && completeMutation.variables?.challengeId === challenge.id}
                  onComplete={() => completeMutation.mutate({ challengeId: challenge.id, userIdentifier: TEST_USER_ID })}
                />
              );
            })}
          </div>
        )}

        {/* ── WEEKLY ── */}
        {activeTab === "weekly" && (
          <div className="space-y-4">
            <p className="text-zinc-400 font-medium mb-6">Bigger goals, longer focus. Unlock these by keeping up with your daily challenges.</p>
            {weeklyChallenges.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 italic">
                No weekly challenges added yet.
              </div>
            ) : (
              sortedWeeklyChallenges.map((challenge) => {
                const isCompleted  = completedIds.includes(challenge.id);
                const prevWeekDone = challenge.originalIndex === 0 ||
                  completedIds.includes(weeklyChallenges[challenge.originalIndex - 1]?.id);
                const reqDailyIdx  = challenge.originalIndex * 7 - 1;
                const reqDaily     = dailyChallenges[reqDailyIdx];
                const hasReqDaily  = challenge.originalIndex === 0 ||
                  (reqDaily && completedIds.includes(reqDaily.id));
                const isLocked     = !prevWeekDone || !hasReqDaily;

                let desc = challenge.description;
                if (isLocked) {
                  desc = !prevWeekDone
                    ? "Finish the previous weekly challenge to unlock this one."
                    : `Reach Day ${challenge.originalIndex * 7} in your daily challenges to unlock this one.`;
                }

                return (
                  <ChallengeCard
                    key={challenge.id}
                    title={`Week ${challenge.originalIndex + 1}: ${challenge.title}`}
                    description={desc}
                    isCompleted={isCompleted}
                    isLocked={isLocked}
                    lockReason="sequence"
                    isToday={false}
                    isSaving={completeMutation.isPending && completeMutation.variables?.challengeId === challenge.id}
                    onComplete={() => completeMutation.mutate({ challengeId: challenge.id, userIdentifier: TEST_USER_ID })}
                  />
                );
              })
            )}
          </div>
        )}

        {/* ── MONTHLY ── */}
        {activeTab === "monthly" && (
          <div className="space-y-6">
            <p className="text-zinc-400 font-medium mb-6">Step back and look at the last 30 days honestly. What moved? What didn&apos;t?</p>
            <Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-md">
              <CardContent className="p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3 text-blue-400">
                  <Edit3 className="w-6 h-6" />
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-white">Monthly log</h2>
                </div>
                <textarea
                  className="w-full h-48 bg-black/50 border border-zinc-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none placeholder:text-zinc-700"
                  placeholder="What did you actually do this month? Where did you grow? Where did you fall short? Be honest."
                  value={monthlyLog}
                  onChange={(e) => setMonthlyLog(e.target.value)}
                />
                <button className="self-end px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-sm rounded-lg transition-all active:scale-95">
                  Save my log
                </button>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function TabButton({ active, onClick, icon: Icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 font-bold uppercase tracking-widest text-xs rounded-xl transition-all ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function ChallengeCard({
  title, description, isCompleted, isLocked,
  lockReason, isToday, isSaving, onComplete,
}: {
  title: string;
  description: string;
  isCompleted: boolean;
  isLocked: boolean;
  lockReason: string;
  isToday: boolean;
  isSaving: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="relative">
      {isToday && (
        <div className="absolute -top-3 left-6 z-10 flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-900/40">
          <Flame className="w-3 h-3" />
          Today&apos;s challenge
        </div>
      )}
      <Card
        className={`relative overflow-hidden border-zinc-800 transition-all duration-500
          ${isToday ? "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-[#060810]" : ""}
          ${isLocked ? "opacity-50 grayscale" : "bg-zinc-900/60 hover:border-blue-500/50 backdrop-blur-md"}
          ${isCompleted ? "border-emerald-500/30 bg-emerald-500/5" : ""}`}
      >
        <CardContent className={`p-6 ${isToday ? "pt-7" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 ${
                  isCompleted
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : isLocked
                    ? "bg-zinc-800 border-zinc-700 text-zinc-600"
                    : "bg-blue-500/10 border-blue-500/50 text-blue-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-6 h-6" />
                  : isLocked && lockReason === "time" ? <Timer className="w-6 h-6" />
                  : isLocked ? <Lock className="w-6 h-6" />
                  : <Sword className="w-6 h-6" />}
              </div>
              <div>
                <h3
                  className={`text-xl font-bold uppercase tracking-tight ${
                    isCompleted ? "text-emerald-400 line-through opacity-50" : "text-white"
                  }`}
                >
                  {title}
                </h3>
                <p className="text-zinc-400 text-sm font-medium mt-1">{description}</p>
              </div>
            </div>

            {!isLocked && !isCompleted && (
              <button
                onClick={onComplete}
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Mark done"}
              </button>
            )}
            {isCompleted && (
              <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase italic shrink-0">
                <Trophy className="w-4 h-4" /> Done
              </div>
            )}
            {isLocked && lockReason === "time" && (
              <div className="flex items-center gap-2 text-zinc-500 font-black text-xs uppercase shrink-0">
                <Timer className="w-4 h-4" /> Back tomorrow
              </div>
            )}
          </div>
        </CardContent>
        <div
          className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${
            isCompleted ? "w-full bg-emerald-500" : "w-0 bg-blue-500"
          }`}
        />
      </Card>
    </div>
  );
}
