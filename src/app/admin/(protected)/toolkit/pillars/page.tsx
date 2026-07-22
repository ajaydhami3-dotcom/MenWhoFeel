import { getPillarsWithCounts } from "../queries";
import { PillarDialog } from "./PillarDialog";

export const metadata = { title: "Pillars | Men Who Feel Admin" };

export default async function PillarsAdminPage() {
  const pillarList = await getPillarsWithCounts();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Pillars</h1>
        <p className="text-sm text-muted-foreground mt-1">
          The four life pillars — Mental &amp; Emotional Health, Work &amp; Financial Stability,
          Relationships &amp; Stress, Physical Wellbeing. Edit-only: this is a fixed architectural set,
          not a growable taxonomy like Categories or Tags, so there&apos;s no add or delete here by design.
        </p>
      </div>

      {pillarList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No pillars found. Run supabase_migration_pillars.sql to seed the initial 4.
        </div>
      ) : (
        <div className="space-y-3">
          {pillarList.map((pillar) => (
            <div
              key={pillar.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{pillar.name}</h3>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {pillar.slug}
                  </span>
                </div>
                {pillar.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{pillar.description}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {pillar.categoryCount} categor{pillar.categoryCount === 1 ? "y" : "ies"} ·{" "}
                  {pillar.resourceCount} resource{pillar.resourceCount !== 1 ? "s" : ""} ·{" "}
                  {pillar.guideCount} guide{pillar.guideCount !== 1 ? "s" : ""}
                </p>
              </div>
              <PillarDialog pillar={pillar} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
