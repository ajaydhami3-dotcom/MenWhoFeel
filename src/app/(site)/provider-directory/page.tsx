import { Metadata } from "next";
import Link from "next/link";
import { getApprovedProviders } from "@/server/queries/provider-directory";
import {
  Stethoscope, Brain, HeartPulse, Building2, HandHeart, ArrowUpRight, ShieldCheck,
} from "lucide-react";

export const revalidate = 300;

const BASE_URL = "https://www.menwhofeel.online";

export const metadata: Metadata = {
  title: { absolute: "Provider Directory | Men Who Feel" },
  description: "Vetted therapists, doctors, and recovery resources for men — every listing reviewed by a person before it goes live.",
  alternates: { canonical: `${BASE_URL}/provider-directory` },
};

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Brain }> = {
  therapist_counselor: { label: "Therapists & Counselors", icon: Brain },
  psychiatrist: { label: "Psychiatrists", icon: HeartPulse },
  primary_care: { label: "Primary Care", icon: Stethoscope },
  recovery_program: { label: "Recovery Programs", icon: HandHeart },
  sliding_scale_clinic: { label: "Sliding-Scale Clinics", icon: Building2 },
};

const TYPE_ORDER = ["therapist_counselor", "psychiatrist", "primary_care", "recovery_program", "sliding_scale_clinic"];

export default async function ProviderDirectoryPage() {
  const allProviders = await getApprovedProviders();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Provider Directory",
    description: "Vetted therapists, doctors, and recovery resources for men.",
    url: `${BASE_URL}/provider-directory`,
  };

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    config: TYPE_CONFIG[type]!,
    items: allProviders.filter((p) => p.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl">

        {/* Hero */}
        <div className="animate-fade-up rounded-2xl border border-border/70 bg-card/70 p-8 sm:p-12 mb-10">
          <p className="mb-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            <Stethoscope className="h-4 w-4" /> Mental &amp; Emotional Health · Physical Wellbeing
          </p>
          <h1 className="font-display text-[2.4rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Provider Directory
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Therapists, doctors, and recovery resources — vetted, not scraped. If it&apos;s here, a person reviewed it
            first.
          </p>
        </div>

        {/* Trust note — same posture as Small Wins, made explicit here
            since the stakes are higher (recommending an actual person or
            practice, not a link) */}
        <div className="mb-14 flex items-start gap-3 rounded-xl border border-border/60 bg-secondary/30 p-5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nothing here is automated. Every listing is reviewed before it goes live. This isn&apos;t a substitute
            for professional care — if you&apos;re in crisis right now, use the{" "}
            <Link href="/crisis-helpline" className="text-primary hover:underline">crisis helpline</Link> instead of
            searching this list.
          </p>
        </div>

        {allProviders.length === 0 ? (
          <p className="italic text-muted-foreground">Providers are being added — check back soon.</p>
        ) : (
          grouped.map((group) => (
            <section key={group.type} className="mb-14">
              <div className="mb-6 flex items-center gap-2">
                <group.config.icon className="h-4 w-4 text-primary" />
                <h2 className="font-display text-[1.6rem] font-semibold text-foreground sm:text-2xl">
                  {group.config.label}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.items.map((p) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card/70 p-5 transition-all hover:border-b-2 hover:border-b-primary hover:bg-card"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="font-display font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                          {p.name}
                        </h3>
                        {p.pillarName && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                            {p.pillarName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/80">{p.location}</p>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                      {p.trustNotes && <p className="mt-1.5 text-xs text-muted-foreground/70">{p.trustNotes}</p>}
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
