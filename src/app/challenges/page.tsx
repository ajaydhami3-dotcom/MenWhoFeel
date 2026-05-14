"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, CheckCircle2, Flame, Trophy, Timer, Calendar, Target, Edit3, Loader2, Sword } from "lucide-react";

const TEST_USER_ID = "guest_warrior_1";

export default function ChallengesPage() {
  const utils = trpc.useUtils();

  const { data: challenges, isLoading: loadingChallenges } = trpc.challenges.getChallenges.useQuery();
  const { data: progress, isLoading: loadingProgress } = trpc.challenges.getUserProgress.useQuery({
    userIdentifier: TEST_USER_ID,
  });

  const completeMutation = trpc.challenges.completeChallenge.useMutation({
    onSuccess: () => {
      utils.challenges.getUserProgress.invalidate();
    },
  });

  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [monthlyLog, setMonthlyLog] = useState("");

  // Streak logic
  const currentStreak = useMemo(() => {
    if (!progress || progress.length === 0) return 0;
    const dates = progress
      .filter((p) => p.completedAt)
      .map((p) => new Date(p.completedAt).setHours(0, 0, 0, 0));
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
      if (date === checkDate) {
        streak++;
        checkDate -= 86400000;
      } else {
        break;
      }
    }
    return streak;
  }, [progress]);

  // One daily per day
  const hasDoneDailyToday = useMemo(() => {
    if (!progress || !challenges) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    return progress.some((p) => {
      if (!p.completedAt) return false;
      const challenge = challenges.find((c) => c.id === p.challengeId);
      if (challenge?.category !== "daily") return false;
      return new Date(p.completedAt).setHours(0, 0, 0, 0) === today;
    });
  }, [progress, challenges]);

  if (loadingChallenges || loadingProgress) {
    return (
      <div className="min-h-screen bg-[#060810] flex items-center justify-center">
        <div className="text-blue-500 font-black animate-pulse tracking-tighter text-2xl uppercase italic">
          Loading challenges...
        </div>
      </div>
    );
  }

  const completedIds = progress?.map((p) => p.challengeId) || [];
  const dailyChallenges = challenges?.filter((c) => c.category === "daily") || [];
  const weeklyChallenges = challenges?.filter((c) => c.category === "weekly") || [];

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
          {/* Streak counter */}
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Current streak</p>
              <p className="text-xl font-black text-amber-500">{currentStreak} {currentStreak === 1 ? "day" : "days"}</p>
            </div>
            <Flame className={`w-8 h-8 ${currentStreak > 0 ? "text-amber-500" : "text-zinc-700"}`} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-10 border-b border-zinc-800 pb-4">
          <TabButton active={activeTab === "daily"} onClick={() => setActiveTab("daily")} icon={Flame} label="Daily" />
          <TabButton active={activeTab === "weekly"} onClick={() => setActiveTab("weekly")} icon={Target} label="Weekly" />
          <TabButton active={activeTab === "monthly"} onClick={() => setActiveTab("monthly")} icon={Calendar} label="Monthly check-in" />
        </div>

        {/* DAILY */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            <p className="text-zinc-400 font-medium mb-6">One challenge per day. Discipline is built slowly.</p>
            {dailyChallenges.map((challenge, index) => {
              const isPreviousDone = index === 0 || completedIds.includes(dailyChallenges[index - 1].id);
              const isCompleted = completedIds.includes(challenge.id);
              const isSequenceLocked = index > 0 && !isPreviousDone;
              const isTimeLocked = !isCompleted && !isSequenceLocked && hasDoneDailyToday;

              return (
                <ChallengeCard
                  key={challenge.id}
                  title={`Day ${index + 1}: ${challenge.title}`}
                  description={
                    isSequenceLocked
                      ? "Finish the previous challenge to unlock this one."
                      : isTimeLocked
                      ? "Come back tomorrow. One a day is the whole point."
                      : challenge.description
                  }
                  isCompleted={isCompleted}
                  isLocked={isSequenceLocked || isTimeLocked}
                  lockReason={isTimeLocked ? "time" : "sequence"}
                  isSaving={completeMutation.isPending && completeMutation.variables?.challengeId === challenge.id}
                  onComplete={() => completeMutation.mutate({ challengeId: challenge.id, userIdentifier: TEST_USER_ID })}
                />
              );
            })}
          </div>
        )}

        {/* WEEKLY */}
        {activeTab === "weekly" && (
          <div className="space-y-4">
            <p className="text-zinc-400 font-medium mb-6">Bigger goals, longer focus. Unlock these by keeping up with your daily challenges.</p>
            {weeklyChallenges.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500 italic">
                No weekly challenges added yet.
              </div>
            ) : (
              weeklyChallenges.map((challenge, index) => {
                const isCompleted = completedIds.includes(challenge.id);
                const isPreviousWeekDone = index === 0 || completedIds.includes(weeklyChallenges[index - 1].id);
                const requiredDailyIndex = index * 7 - 1;
                const requiredDailyChallenge = dailyChallenges[requiredDailyIndex];
                const hasCompletedRequiredDaily =
                  index === 0 || (requiredDailyChallenge && completedIds.includes(requiredDailyChallenge.id));
                const isLocked = !isPreviousWeekDone || !hasCompletedRequiredDaily;
                let lockMessage = challenge.description;
                if (isLocked) {
                  if (!isPreviousWeekDone) {
                    lockMessage = "Finish the previous weekly challenge to unlock this one.";
                  } else if (!hasCompletedRequiredDaily) {
                    lockMessage = `Reach Day ${index * 7} in your daily challenges to unlock this one.`;
                  }
                }

                return (
                  <ChallengeCard
                    key={challenge.id}
                    title={`Week ${index + 1}: ${challenge.title}`}
                    description={isLocked ? lockMessage : challenge.description}
                    isCompleted={isCompleted}
                    isLocked={isLocked}
                    lockReason="sequence"
                    isSaving={completeMutation.isPending && completeMutation.variables?.challengeId === challenge.id}
                    onComplete={() => completeMutation.mutate({ challengeId: challenge.id, userIdentifier: TEST_USER_ID })}
                  />
                );
              })
            )}
          </div>
        )}

        {/* MONTHLY CHECK-IN */}
        {activeTab === "monthly" && (
          <div className="space-y-6">
            <p className="text-zinc-400 font-medium mb-6">Step back and look at the last 30 days honestly. What moved? What didn't?</p>
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

function TabButton({ active, onClick, icon: Icon, label }: any) {
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

function ChallengeCard({ title, description, isCompleted, isLocked, lockReason, isSaving, onComplete }: any) {
  return (
    <Card
      className={`relative overflow-hidden border-zinc-800 transition-all duration-500 ${
        isLocked ? "opacity-50 grayscale" : "bg-zinc-900/60 hover:border-blue-500/50 backdrop-blur-md"
      } ${isCompleted ? "border-emerald-500/50 bg-emerald-500/5" : ""}`}
    >
      <CardContent className="p-6">
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
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : isLocked && lockReason === "time" ? (
                <Timer className="w-6 h-6" />
              ) : isLocked ? (
                <Lock className="w-6 h-6" />
              ) : (
                <Sword className="w-6 h-6" />
              )}
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
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Mark done"
              )}
            </button>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase italic">
              <Trophy className="w-4 h-4" /> Done
            </div>
          )}

          {isLocked && lockReason === "time" && (
            <div className="flex items-center gap-2 text-zinc-500 font-black text-xs uppercase">
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
  );
}