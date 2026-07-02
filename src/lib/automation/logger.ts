import { db } from "@/db";
import { automationLogs } from "@/db/schema";

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  jobId: number;
  stage: string;
  level?: LogLevel;
  message: string;
  payload?: unknown;
  durationMs?: number;
}

export async function log(entry: LogEntry): Promise<void> {
  try {
    await db.insert(automationLogs).values({
      jobId: entry.jobId,
      stage: entry.stage,
      level: entry.level ?? "info",
      message: entry.message,
      payload: entry.payload !== undefined ? (entry.payload as Record<string, unknown>) : null,
      durationMs: entry.durationMs ?? null,
    });
  } catch (err) {
    // Never let logging failures break the pipeline
    console.error("[automation/logger] Failed to write log:", err);
  }

  // Always mirror to server console so Vercel logs capture it too
  const prefix = `[automation][job:${entry.jobId}][${entry.stage}]`;
  if (entry.level === "error") {
    console.error(prefix, entry.message, entry.payload ?? "");
  } else if (entry.level === "warn") {
    console.warn(prefix, entry.message, entry.payload ?? "");
  } else {
    console.log(prefix, entry.message);
  }
}

export function makeLogger(jobId: number, stage: string) {
  return {
    info: (message: string, payload?: unknown) =>
      log({ jobId, stage, level: "info", message, payload }),
    warn: (message: string, payload?: unknown) =>
      log({ jobId, stage, level: "warn", message, payload }),
    error: (message: string, payload?: unknown) =>
      log({ jobId, stage, level: "error", message, payload }),
    timed: (message: string, durationMs: number, payload?: unknown) =>
      log({ jobId, stage, level: "info", message, durationMs, payload }),
  };
}
