import Link from "next/link";
import { FileEdit, Newspaper } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { verifyAdminSession } from "@/lib/admin/dal";
import { getAutomationQueue, getJobWithDetails } from "../queries";
import { SocialDraftCard } from "../SocialDraftCard";

export const metadata = { title: "Content queue" };

export default async function QueuePage() {
  await verifyAdminSession();
  const queueJobs = await getAutomationQueue();

  if (queueJobs.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">Content queue</h1>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><FileEdit /></EmptyMedia>
            <EmptyTitle>Nothing waiting for review</EmptyTitle>
            <EmptyDescription>
              When the automation pipeline finishes a run, the draft will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const jobDetails = await Promise.all(queueJobs.map((j: typeof queueJobs[number]) => getJobWithDetails(j.id)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Content queue</h1>
        <p className="text-sm text-muted-foreground">
          {queueJobs.length} item{queueJobs.length === 1 ? "" : "s"} awaiting your review
        </p>
      </div>

      {jobDetails.map((detail: Awaited<ReturnType<typeof getJobWithDetails>>) => {
        if (!detail) return null;
        const { job, socialDrafts } = detail;

        return (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{job.topic}</CardTitle>
                  <CardDescription>
                    Generated {new Date(job.createdAt).toLocaleString()}
                    {job.finishedAt && ` · took ${Math.round((new Date(job.finishedAt).getTime() - new Date(job.createdAt).getTime()) / 1000)}s`}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 shrink-0">
                  Awaiting review
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Article CTA */}
              {job.articleId ? (
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <Newspaper className="size-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {(queueJobs.find((q: typeof queueJobs[number]) => q.id === job.id)?.articleTitle) ?? "Intel draft"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      /intel/{queueJobs.find((q: typeof queueJobs[number]) => q.id === job.id)?.articleSlug ?? "—"}
                    </p>
                  </div>
                  <Button asChild size="sm" className="ml-auto shrink-0">
                    <Link href={`/admin/intel/${job.articleId}`}>Review & publish</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No article draft found for this job.</p>
              )}

              {/* Social drafts */}
              {socialDrafts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Social content</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {socialDrafts.map((draft: typeof socialDrafts[number]) => (
                      <SocialDraftCard
                        key={draft.id}
                        draftId={draft.id}
                        platform={draft.platform as "reddit" | "x" | "instagram" | "youtube"}
                        status={draft.status as "pending" | "approved" | "published" | "failed" | "skipped"}
                        content={(draft.content ?? {}) as Record<string, unknown>}
                        error={draft.error}
                        canPublish={draft.platform === "reddit" || draft.platform === "x"}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
