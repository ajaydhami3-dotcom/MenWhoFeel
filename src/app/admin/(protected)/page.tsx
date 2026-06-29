import Link from "next/link";
import { Newspaper, FileEdit, CalendarClock, CheckCircle2, Plus, FolderTree, Tags } from "lucide-react";
import { verifyAdminSession } from "@/lib/admin/dal";
import { getDashboardStats } from "./intel/queries";
import { StatusBadge } from "./intel/StatusBadge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";

export default async function AdminDashboardPage() {
  const { adminUser } = await verifyAdminSession();
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total articles", value: stats.total, icon: Newspaper },
    { label: "Published", value: stats.published, icon: CheckCircle2 },
    { label: "Drafts", value: stats.drafts, icon: FileEdit },
    { label: "Scheduled", value: stats.scheduled, icon: CalendarClock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">
          Welcome back{adminUser.name ? `, ${adminUser.name}` : ""}.
        </h1>
        <p className="text-muted-foreground">Here's where Intel stands right now.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Last edited</CardTitle>
            <CardDescription>The five most recently saved articles.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.lastEdited.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Newspaper />
                  </EmptyMedia>
                  <EmptyTitle>No articles yet</EmptyTitle>
                  <EmptyDescription>Once you write your first one, it'll show up here.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ul className="divide-y divide-border">
                {stats.lastEdited.map((article) => (
                  <li key={article.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/intel/${article.id}`}
                        className="font-medium hover:underline truncate block"
                      >
                        {article.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {article.updatedAt ? new Date(article.updatedAt).toLocaleString() : "—"}
                      </p>
                    </div>
                    <StatusBadge status={article.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild className="justify-start">
              <Link href="/admin/intel/new">
                <Plus className="size-4" /> New Intel article
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/intel?status=draft">
                <FileEdit className="size-4" /> Drafts
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/intel/categories">
                <FolderTree className="size-4" /> Categories
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/intel/tags">
                <Tags className="size-4" /> Tags
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
