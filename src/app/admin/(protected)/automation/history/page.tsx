import Link from "next/link";
import { History, ExternalLink } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { verifyAdminSession } from "@/lib/admin/dal";
import { getAutomationHistory } from "../queries";
import { CancelJobButton } from "./CancelJobButton";
import { cn } from "@/lib/utils";

export const metadata = { title: "Automation history" };

const STATUS_STYLES: Record<string, string> = {
  published:       "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  awaiting_review: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  running:         "border-amber-500/30 bg-amber-500/10 text-amber-400",
  pending:         "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  failed:          "border-destructive/30 bg-destructive/10 text-destructive",
  cancelled:       "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
};

export default async function HistoryPage() {
  await verifyAdminSession();
  const jobs = await getAutomationHistory(100);

  if (jobs.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">History</h1>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><History /></EmptyMedia>
            <EmptyTitle>No runs yet</EmptyTitle>
            <EmptyDescription>Start a pipeline run from the Automation dashboard.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-sm text-muted-foreground">{jobs.length} run{jobs.length === 1 ? "" : "s"} total</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const durationSec = job.finishedAt
                ? Math.round(
                    (new Date(job.finishedAt).getTime() - new Date(job.createdAt).getTime()) / 1000
                  )
                : null;
              const canCancel = job.status === "running" || job.status === "pending";

              return (
                <TableRow key={job.id}>
                  <TableCell className="max-w-xs">
                    <p className="font-medium truncate">{job.topic}</p>
                    {job.error && (
                      <p className="text-xs text-destructive truncate mt-0.5">{job.error}</p>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(STATUS_STYLES[job.status] ?? "")}
                    >
                      {job.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {job.articleId ? (
                      <div className="min-w-0">
                        <Link
                          href={`/admin/intel/${job.articleId}`}
                          className="text-sm hover:underline flex items-center gap-1"
                        >
                          {job.articleTitle ?? `Article #${job.articleId}`}
                          <ExternalLink className="size-3 shrink-0" />
                        </Link>
                        {job.articleSlug && (
                          <p className="text-xs text-muted-foreground">/intel/{job.articleSlug}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {durationSec !== null ? `${durationSec}s` : "—"}
                  </TableCell>

                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(job.createdAt).toLocaleDateString()}{" "}
                    {new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canCancel && <CancelJobButton jobId={job.id} />}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/automation/logs?job=${job.id}`}>Logs</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
