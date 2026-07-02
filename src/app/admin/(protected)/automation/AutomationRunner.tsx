"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Zap, Loader2, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type JobStatus = "pending" | "running" | "awaiting_review" | "approved" | "published" | "failed" | "cancelled";
type Stage = "research" | "writing" | "seo" | "image" | "social" | "complete" | null;

interface LogEntry {
  id: number;
  stage: string;
  level: string;
  message: string;
  durationMs: number | null;
  createdAt: string;
}

interface JobData {
  id: number;
  topic: string;
  status: JobStatus;
  stage: Stage;
  articleId: number | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
}

const STAGES: { key: Stage; label: string }[] = [
  { key: "research", label: "Research" },
  { key: "writing", label: "Writing" },
  { key: "seo", label: "SEO" },
  { key: "image", label: "Image" },
  { key: "social", label: "Social" },
  { key: "complete", label: "Done" },
];

const STAGE_ORDER = ["research", "writing", "seo", "image", "social", "complete"];

function stageIndex(stage: Stage): number {
  return stage ? STAGE_ORDER.indexOf(stage) : -1;
}

function StatusIcon({ status }: { status: JobStatus }) {
  if (status === "failed" || status === "cancelled") return <XCircle className="size-4 text-destructive" />;
  if (status === "awaiting_review" || status === "published") return <CheckCircle2 className="size-4 text-emerald-400" />;
  if (status === "running" || status === "pending") return <Loader2 className="size-4 animate-spin text-amber-400" />;
  return <Clock className="size-4 text-muted-foreground" />;
}

export function AutomationRunner() {
  const [topic, setTopic] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  async function pollStatus(jobId: number) {
    try {
      const res = await fetch(`/api/automation/status/${jobId}`);
      if (!res.ok) return;
      const data = await res.json();
      setJob(data.job);
      setLogs(data.logs ?? []);

      const terminal: JobStatus[] = ["awaiting_review", "published", "failed", "cancelled"];
      if (terminal.includes(data.job.status)) {
        stopPolling();
        if (data.job.status === "awaiting_review") {
          toast.success("Article draft is ready for your review!");
        } else if (data.job.status === "failed") {
          toast.error(`Pipeline failed: ${data.job.error ?? "Unknown error"}`);
        }
      }
    } catch {
      // Polling errors are non-fatal; keep trying
    }
  }

  useEffect(() => {
    if (activeJobId) {
      pollStatus(activeJobId);
      pollingRef.current = setInterval(() => pollStatus(activeJobId), 2500);
    }
    return stopPolling;
  }, [activeJobId]);

  useEffect(() => {
    if (showLogs) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, showLogs]);

  async function handleStart() {
    if (!topic.trim() || isStarting) return;
    setIsStarting(true);
    setJob(null);
    setLogs([]);
    stopPolling();

    // In local dev, waitUntil() from @vercel/functions is a no-op, so the
    // pipeline never executes via /api/automation/run. Use the synchronous
    // route instead which awaits the pipeline before responding.
    // Set NEXT_PUBLIC_APP_ENV=development in .env.local to enable this.
    const route =
      process.env.NEXT_PUBLIC_APP_ENV === "development"
        ? "/api/automation/run-sync"
        : "/api/automation/run";

    try {
      const res = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to start pipeline");
        return;
      }

      setActiveJobId(data.jobId);
      setTopic("");
      toast.success("Pipeline started. Tracking progress below…");
    } catch {
      toast.error("Network error — could not start pipeline");
    } finally {
      setIsStarting(false);
    }
  }

  const isRunning = job?.status === "running" || job?.status === "pending";
  const isDone = job?.status === "awaiting_review" || job?.status === "published";
  const isFailed = job?.status === "failed" || job?.status === "cancelled";
  const currentStageIdx = stageIndex(job?.stage ?? null);

  return (
    <div className="space-y-5">
      {/* Topic input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="size-4 text-amber-400" /> Generate Intel article
          </CardTitle>
          <CardDescription>
            Enter a topic and the automation pipeline will research, write, generate SEO metadata,
            create a featured image, and save a draft to Intel — ready for your review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder='e.g. "How to talk to your friends about depression"'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              disabled={isStarting || isRunning}
            />
            <Button
              onClick={handleStart}
              disabled={!topic.trim() || isStarting || isRunning}
              className="shrink-0"
            >
              {isStarting ? (
                <><Loader2 className="size-4 animate-spin" /> Starting…</>
              ) : isRunning ? (
                <><Loader2 className="size-4 animate-spin" /> Running…</>
              ) : (
                <><Zap className="size-4" /> Run</>
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Nothing is published automatically. You review and approve every article before it goes live.
          </p>
        </CardContent>
      </Card>

      {/* Progress tracker */}
      {job && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <StatusIcon status={job.status} />
                {job.topic}
              </CardTitle>
              <Badge
                variant="outline"
                className={cn(
                  isDone && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                  isFailed && "border-destructive/30 bg-destructive/10 text-destructive",
                  isRunning && "border-amber-500/30 bg-amber-500/10 text-amber-400"
                )}
              >
                {job.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stage pipeline visual */}
            <div className="flex items-center gap-1 flex-wrap">
              {STAGES.map((s, i) => {
                const done = currentStageIdx > i || (isDone && s.key === "complete");
                const active = job.stage === s.key && isRunning;
                return (
                  <div key={s.key} className="flex items-center gap-1">
                    <div
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium transition-colors",
                        done && "bg-emerald-500/20 text-emerald-400",
                        active && "bg-amber-500/20 text-amber-400 animate-pulse",
                        !done && !active && "bg-muted text-muted-foreground"
                      )}
                    >
                      {active && <Loader2 className="inline size-3 mr-1 animate-spin" />}
                      {s.label}
                    </div>
                    {i < STAGES.length - 1 && (
                      <span className="text-muted-foreground text-xs">→</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error message */}
            {isFailed && job.error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">
                {job.error}
              </p>
            )}

            {/* Success CTA */}
            {isDone && job.articleId && (
              <div className="flex items-center gap-2 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-400">
                  Draft saved. Review and publish it from the Intel CMS.
                </p>
                <Button asChild size="sm" variant="outline" className="ml-auto shrink-0">
                  <Link href={`/admin/intel/${job.articleId}`}>
                    Review <ExternalLink className="ml-1 size-3" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Live log toggle */}
            {logs.length > 0 && (
              <div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowLogs((v) => !v)}
                >
                  {showLogs ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  {showLogs ? "Hide" : "Show"} pipeline log ({logs.length} entries)
                </button>

                {showLogs && (
                  <div className="mt-2 max-h-56 overflow-y-auto rounded border border-border bg-muted/40 p-2 text-xs font-mono space-y-0.5">
                    {logs.map((l) => (
                      <div
                        key={l.id}
                        className={cn(
                          "flex gap-2",
                          l.level === "error" && "text-destructive",
                          l.level === "warn" && "text-amber-400",
                          l.level === "info" && "text-muted-foreground"
                        )}
                      >
                        <span className="shrink-0 text-muted-foreground/50">
                          [{l.stage}]
                        </span>
                        <span className="min-w-0 break-all">{l.message}</span>
                        {l.durationMs && (
                          <span className="ml-auto shrink-0 text-muted-foreground/50">
                            {l.durationMs}ms
                          </span>
                        )}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
