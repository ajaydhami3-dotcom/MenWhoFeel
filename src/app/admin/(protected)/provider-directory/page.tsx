import { getAllProviders, getAllPillars } from "./queries";
import { ProviderDialog } from "./ProviderDialog";
import { ProviderRowActions } from "./ProviderRowActions";

export const metadata = { title: "Provider Directory | Men Who Feel Admin" };

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const TYPE_LABELS: Record<string, string> = {
  therapist_counselor: "Therapist / Counselor",
  psychiatrist: "Psychiatrist",
  primary_care: "Primary Care",
  recovery_program: "Recovery Program",
  sliding_scale_clinic: "Sliding-Scale Clinic",
};

export default async function ProviderDirectoryAdminPage() {
  const [rows, pillarOptions] = await Promise.all([getAllProviders(), getAllPillars()]);

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Provider Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vetted therapists, doctors, and recovery resources — spans Mental & Emotional Health and Physical
            Wellbeing. New entries start pending; nothing shows on /provider-directory until approved. Higher bar
            than any other curated list on the site — this recommends actual people and practices, not just links.
          </p>
        </div>
        <ProviderDialog pillarOptions={pillarOptions} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No providers yet. Add the first one above.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{r.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                  {r.featured && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      Featured
                    </span>
                  )}
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {TYPE_LABELS[r.type] ?? r.type}
                  </span>
                  {r.pillarName && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {r.pillarName}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.location}</p>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-primary hover:underline">
                  {r.url}
                </a>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <ProviderRowActions id={r.id} status={r.status} />
                <ProviderDialog provider={r} pillarOptions={pillarOptions} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
