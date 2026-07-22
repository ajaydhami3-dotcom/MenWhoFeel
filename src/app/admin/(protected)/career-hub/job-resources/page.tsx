import { getAllJobResources } from "../queries";
import { JobResourceDialog } from "./JobResourceDialog";
import { JobResourceRowActions } from "./JobResourceRowActions";

export const metadata = { title: "Job Resources | Men Who Feel Admin" };

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export default async function JobResourcesAdminPage() {
  const rows = await getAllJobResources();

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Job Resources</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Job boards, salary research, government programs — part of Career Hub, Work &amp; Financial Stability
            only. New entries start pending; nothing shows on /career-hub until approved.
          </p>
        </div>
        <JobResourceDialog />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No job resources yet. Add the first one above.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{r.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                  {r.featured && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-primary hover:underline">
                  {r.url}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <JobResourceRowActions id={r.id} status={r.status} />
                <JobResourceDialog resource={r} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
