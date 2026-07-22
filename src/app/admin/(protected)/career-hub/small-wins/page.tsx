import { getAllSmallWins } from "../queries";
import { SmallWinDialog } from "./SmallWinDialog";
import { SmallWinRowActions } from "./SmallWinRowActions";

export const metadata = { title: "Small Wins | Men Who Feel Admin" };

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export default async function SmallWinsAdminPage() {
  const rows = await getAllSmallWins();

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Small Wins</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manually curated income opportunities — no API integrations by design. Quality and trust over
            quantity: this is exactly the audience predatory &quot;quick income&quot; schemes target. New entries
            start pending; nothing shows on /small-wins until approved.
          </p>
        </div>
        <SmallWinDialog />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No opportunities yet. Add the first one above.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((w) => (
            <div key={w.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{w.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[w.status]}`}>
                    {w.status}
                  </span>
                  {w.featured && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      Featured
                    </span>
                  )}
                  {w.payDetails && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {w.payDetails}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{w.description}</p>
                <a href={w.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-primary hover:underline">
                  {w.url}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <SmallWinRowActions id={w.id} status={w.status} />
                <SmallWinDialog win={w} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
