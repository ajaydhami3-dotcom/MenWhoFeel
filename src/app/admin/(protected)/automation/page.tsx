import { Zap, Clock, CheckCircle2, AlertCircle, FileEdit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { verifyAdminSession } from "@/lib/admin/dal";
import { getAutomationDashboardStats } from "./queries";
import { AutomationRunner } from "./AutomationRunner";

export const metadata = { title: "Automation" };

export default async function AutomationDashboardPage() {
  await verifyAdminSession();
  const stats = await getAutomationDashboardStats();

  const cards = [
    { label: "Total runs", value: stats.total, icon: Zap },
    { label: "Awaiting review", value: stats.awaitingReview, icon: FileEdit },
    { label: "Published", value: stats.published, icon: CheckCircle2 },
    { label: "Failed", value: stats.failed, icon: AlertCircle },
  ];

  const socialCards = [
    { label: "Reddit drafts", value: stats.redditDrafts },
    { label: "X drafts", value: stats.xDrafts },
    { label: "Instagram drafts", value: stats.instagramDrafts },
    { label: "YouTube metadata", value: stats.youtubeDrafts },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Automation</h1>
        <p className="text-sm text-muted-foreground">
          AI-assisted content pipeline. You stay in control — nothing publishes without your approval.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{c.label}</CardDescription>
              <c.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Runner */}
      <AutomationRunner />

      {/* Recent activity */}
      {stats.recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent runs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {stats.recentJobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{job.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.createdAt).toLocaleString()}
                      {job.finishedAt && ` · ${Math.round((new Date(job.finishedAt).getTime() - new Date(job.createdAt).getTime()) / 1000)}s`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        job.status === "awaiting_review" || job.status === "published"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : job.status === "failed" || job.status === "cancelled"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : job.status === "running"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          : ""
                      }
                    >
                      {job.status.replace(/_/g, " ")}
                    </Badge>
                    {job.articleId && (
                      <Link
                        href={`/admin/intel/${job.articleId}`}
                        className="text-xs text-muted-foreground hover:text-foreground underline"
                      >
                        Review
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Social overview */}
      <div>
        <h2 className="text-base font-semibold mb-3">Social drafts pending approval</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {socialCards.map((c) => (
            <Card key={c.label}>
              <CardContent className="pt-6">
                <div className="text-2xl font-semibold">{c.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{c.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        {(stats.redditDrafts > 0 || stats.xDrafts > 0 || stats.instagramDrafts > 0 || stats.youtubeDrafts > 0) && (
          <p className="mt-2 text-sm text-muted-foreground">
            <Link href="/admin/automation/queue" className="underline hover:text-foreground">
              Review and approve from the content queue →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
