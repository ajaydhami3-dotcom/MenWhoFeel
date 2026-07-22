import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { journeys } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import Breadcrumb from "@/components/Breadcrumb";
import JourneyClient from "./JourneyClient";

export const revalidate = 300;

const BASE_URL = "https://www.menwhofeel.online";

type Props = { params: Promise<{ journeySlug: string }> };

async function getJourney(slug: string) {
  try {
    const rows = await db.select().from(journeys).where(eq(journeys.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error(`[challenges/${slug}] getJourney failed:`, err);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    // Only journeys without an externalHref get this route — The Forge's
    // registry row has one and lives at /challenges instead.
    const rows = await db.select({ slug: journeys.slug }).from(journeys).where(isNull(journeys.externalHref));
    return rows.map((r) => ({ journeySlug: r.slug }));
  } catch (err) {
    console.error("[challenges/[journeySlug]] generateStaticParams failed:", err);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { journeySlug } = await params;
  const journey = await getJourney(journeySlug);
  if (!journey) return { title: { absolute: "Journey Not Found | Men Who Feel" } };
  return {
    title: { absolute: `${journey.title} | Men Who Feel` },
    description: journey.description ?? `${journey.title} — a guided journey on Men Who Feel.`,
    alternates: { canonical: `${BASE_URL}/challenges/${journeySlug}` },
  };
}

export default async function JourneyPage({ params }: Props) {
  const { journeySlug } = await params;
  const journey = await getJourney(journeySlug);
  if (!journey) notFound();
  // The Forge's registry row exists so pillar-driven UI can look it up
  // consistently, but its real experience lives at /challenges — this
  // route is for the three native journeys only.
  if (journey.externalHref) redirect(journey.externalHref);

  // Found missing during the Phase 11 QA pass — every other new content
  // page added in this migration has structured data; this one should
  // too, for the same reason: consistency, not because this specific
  // page needed anything special.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: journey.title,
    description: journey.description,
    url: `${BASE_URL}/challenges/${journey.slug}`,
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl">
        <Breadcrumb crumbs={[
          { label: "Home", href: "/" },
          { label: "Challenges", href: "/challenges" },
          { label: journey.title },
        ]} />

        <div className="mb-10">
          <h1 className="font-display text-[2.2rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-4xl">
            {journey.title}
          </h1>
          {journey.description && (
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{journey.description}</p>
          )}
          <p className="mt-4 text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground/70">
            {journey.totalDays}-day journey · a practical starting point, not a clinical program
          </p>
        </div>

        <JourneyClient journeySlug={journey.slug} journeyTitle={journey.title} />
      </div>
    </div>
  );
}
