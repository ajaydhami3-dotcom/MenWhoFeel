"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyMedia } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface LogRow {
  id: number;
  jobId: number;
  stage: string;
  level: string;
  message: string;
  payload: unknown;
  durationMs: number | null;
  createdAt: Date | string;
}

const LEVEL_STYLES: Record<string, string> = {
  error: "text-destructive",
  warn:  "text-amber-400",
  info:  "text-muted-foreground",
};

const LEVEL_BADGE_STYLES: Record<string, string> = {
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  warn:  "border-amber-500/30 bg-amber-500/10 text-amber-400",
  info:  "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

function LogRow({ log }: { log: LogRow }) {
  const [open, setOpen] = useState(false);
  const hasPayload = log.payload !== null && log.payload !== undefined;

  return (
    <>
      <tr
        className={cn(
          "border-b border-border font-mono text-xs",
          log.level === "error" && "bg-destructive/5",
          log.level === "warn" && "bg-amber-500/5"
        )}
      >
        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
          {new Date(log.createdAt).toLocaleTimeString()}
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          <Badge variant="outline" className={cn("text-xs", LEVEL_BADGE_STYLES[log.level] ?? "")}>
            {log.level}
          </Badge>
        </td>
        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{log.stage}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-2">
            {hasPayload && (
              <button type="button" onClick={() => setOpen((v) => !v)}>
                {open ? (
                  <ChevronDown className="size-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-3 text-muted-foreground" />
                )}
              </button>
            )}
            <span className={cn(LEVEL_STYLES[log.level] ?? "")}>{log.message}</span>
          </div>
        </td>
        <td className="px-3 py-2 text-muted-foreground whitespace-nowrap text-right">
          {log.durationMs !== null ? `${log.durationMs}ms` : ""}
        </td>
      </tr>
      {open && hasPayload && (
        <tr className="border-b border-border bg-muted/20">
          <td colSpan={5} className="px-6 py-3">
            <pre className="text-xs text-muted-foreground overflow-auto max-h-48">
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

export function LogsTable({ logs, jobId }: { logs: LogRow[]; jobId?: number }) {
  if (logs.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" />
          <EmptyTitle>No logs {jobId ? `for job #${jobId}` : "yet"}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground font-medium">
            <th className="px-3 py-2 text-left">Time</th>
            <th className="px-3 py-2 text-left">Level</th>
            <th className="px-3 py-2 text-left">Stage</th>
            <th className="px-3 py-2 text-left">Message</th>
            <th className="px-3 py-2 text-right">Duration</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <LogRow key={log.id} log={log} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
