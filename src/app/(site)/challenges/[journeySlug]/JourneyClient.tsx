"use client";

import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import JourneyDailyView from "./JourneyDailyView";

// Mirrors ChallengesClient.tsx's auth/mutation wiring (same useAuth,
// same trpc.useUtils() cache-invalidation pattern, same onSuccess/onError
// toast shape) — scoped to one journey instead of mixing in the
// weekly/monthly tabs Forge also has, since none of these three journeys
// has those yet.

type Props = {
  journeySlug: string;
  journeyTitle: string;
};

export default function JourneyClient({ journeySlug, journeyTitle }: Props) {
  const { isReady: authReady, error: authError } = useAuth();
  const utils = trpc.useUtils();

  const init = trpc.journeys.init.useQuery({ journeySlug }, { enabled: authReady });

  const refresh = () => utils.journeys.init.invalidate({ journeySlug });

  const completeMutation = trpc.journeys.completeDay.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Day marked complete. Nice work.");
    },
    onError: (err) => toast.error(err.message || "Couldn't save that — try again."),
  });
  const skipMutation = trpc.journeys.skipDay.useMutation({
    onSuccess: () => {
      refresh();
      toast("Day skipped.");
    },
    onError: (err) => toast.error(err.message || "Couldn't skip that — try again."),
  });
  const pauseMutation = trpc.journeys.pause.useMutation({
    onSuccess: () => {
      refresh();
      toast(`${journeyTitle} is paused. Resume whenever you're ready.`);
    },
    onError: (err) => toast.error(err.message || "Couldn't pause — try again."),
  });
  const resumeMutation = trpc.journeys.resume.useMutation({
    onSuccess: () => {
      refresh();
      toast.success("Welcome back.");
    },
    onError: (err) => toast.error(err.message || "Couldn't resume — try again."),
  });
  const resetMutation = trpc.journeys.reset.useMutation({
    onSuccess: () => {
      refresh();
      toast("Started over — Day 1 is up.");
    },
    onError: (err) => toast.error(err.message || "Couldn't reset — try again."),
  });

  const isLoadingCore = !authReady || init.isLoading;

  if (authError) {
    return (
      <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-xl p-4">
        <p className="font-medium">Couldn&apos;t start a session.</p>
        <p className="text-destructive/80 mt-1">{authError}</p>
      </div>
    );
  }

  if (isLoadingCore) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up {journeyTitle}…
      </div>
    );
  }

  if (init.isError || !init.data) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="w-6 h-6 text-destructive" />
        <div>
          <p className="text-foreground font-medium">Couldn&apos;t load {journeyTitle}.</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            If this is a fresh setup, the most likely cause is that{" "}
            <code className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded">supabase_migration_journeys.sql</code>{" "}
            hasn&apos;t been run yet.
          </p>
        </div>
        <Button onClick={() => init.refetch()} variant="outline" size="sm" className="rounded-full">
          Try again
        </Button>
      </div>
    );
  }

  const { days, progress, responses } = init.data;

  if (days.length === 0) {
    return (
      <p className="py-16 text-center italic text-muted-foreground">
        {journeyTitle}&apos;s day-by-day content is still being written. Check back soon.
      </p>
    );
  }

  return (
    <JourneyDailyView
      journeyTitle={journeyTitle}
      days={days}
      progress={progress}
      responses={responses}
      onComplete={(input) => completeMutation.mutate({ journeySlug, ...input })}
      onSkip={(dayNumber) => skipMutation.mutate({ journeySlug, dayNumber })}
      onPause={() => pauseMutation.mutate({ journeySlug })}
      onResume={() => resumeMutation.mutate({ journeySlug })}
      onReset={() => resetMutation.mutate({ journeySlug })}
      pending={{
        complete: completeMutation.isPending,
        skip: skipMutation.isPending,
        pause: pauseMutation.isPending,
        resume: resumeMutation.isPending,
        reset: resetMutation.isPending,
      }}
    />
  );
}
