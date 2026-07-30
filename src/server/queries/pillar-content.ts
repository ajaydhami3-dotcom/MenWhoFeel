import { db } from "@/db";
import { resources, selfHelpGuides, stories, communityPosts, journeys } from "@/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";

// Shared by category/[categorySlug]/page.tsx, topic/[topicSlug]/page.tsx,
// and intel/[slug]/page.tsx so every pillar-aware page fetches Toolkit,
// Stories, and Community content the same way instead of maintaining
// copies that could drift apart.

export type PillarResourceItem = {
  id: number;
  name: string;
  url: string;
  type: string;
  source: "resource" | "guide";
};

// Phase 5 — the mechanism behind "every topic is a complete ecosystem"
// (MIGRATION_PLAN.md 4.4), not just pillar-broad. Tries a topic-level
// fetch first; if that alone doesn't fill the requested count, tops up
// with pillar-level results, skipping anything already included (via
// keyFn, since e.g. resources.id and selfHelpGuides.id are independent
// sequences and can collide as bare numbers). A topic with zero
// topic-tagged content still shows its pillar's content exactly as
// before Phase 5 — this never regresses below what Phases 1–4 shipped,
// it only sharpens results as topic-level tagging fills in over time.
// Only called with a topicId on topic and article pages, which have one;
// category pages span many topics and stay pillar-level intentionally.
async function withTopicFallback<T>(
  topicId: number | null | undefined,
  limit: number,
  fetchTopicLevel: () => Promise<T[]>,
  fetchPillarLevel: () => Promise<T[]>,
  keyFn: (item: T) => string
): Promise<T[]> {
  const topicLevel = topicId ? await fetchTopicLevel() : [];
  if (topicLevel.length >= limit) return topicLevel.slice(0, limit);

  const pillarLevel = await fetchPillarLevel();
  const seen = new Set(topicLevel.map(keyFn));
  const fill = pillarLevel.filter((item) => !seen.has(keyFn(item))).slice(0, limit - topicLevel.length);
  return [...topicLevel, ...fill];
}

// Toolkit. Merges two tables as of Phase 3 (see MIGRATION_PLAN.md 4.3):
// `resources` (curated external links/videos/books — pillarId shipped in
// Phase 0, trustworthy from day one since the backfill was an exact
// string match) and `selfHelpGuides` (original first-party content,
// repurposed this phase). Only selfHelpGuides rows with a `fileUrl` are
// included here — those behave like resources (click, get a file).
// Guides meant to be read/printed as an on-site page (content but no
// fileUrl) need a public rendering page that doesn't exist yet, so they
// don't appear here until that ships. Everything from selfHelpGuides is
// normalized to type "pdf" for now regardless of its actual `format`
// (worksheet/checklist/etc.) — they all render as "click to open a file"
// today, so they share the existing pdf icon rather than needing
// RESOURCE_ICONS extended for a distinction the UI doesn't make yet.
//
// `topicId` is optional (Phase 5) — omit it (or pass null) to get the
// Phase 0–3 pillar-only behavior unchanged, e.g. on category pages.
export async function getPillarResources(
  pillarId: number | null,
  topicId?: number | null
): Promise<PillarResourceItem[]> {
  if (!pillarId) return [];
  try {
    const fetchLevel = (scope: "topic" | "pillar") =>
      async (): Promise<PillarResourceItem[]> => {
        const pillarClause = eq(resources.pillarId, pillarId);
        const guidePillarClause = eq(selfHelpGuides.pillarId, pillarId);
        const [curated, guides] = await Promise.all([
          db
            .select({ id: resources.id, name: resources.name, url: resources.url, type: resources.type })
            .from(resources)
            .where(scope === "topic" ? and(eq(resources.topicId, topicId!), pillarClause) : pillarClause)
            .limit(3),
          db
            .select({ id: selfHelpGuides.id, name: selfHelpGuides.title, url: selfHelpGuides.fileUrl })
            .from(selfHelpGuides)
            .where(
              scope === "topic"
                ? and(eq(selfHelpGuides.topicId, topicId!), guidePillarClause, isNotNull(selfHelpGuides.fileUrl))
                : and(guidePillarClause, isNotNull(selfHelpGuides.fileUrl))
            )
            .limit(3),
        ]);
        return [
          ...curated.map((r): PillarResourceItem => ({ id: r.id, name: r.name, url: r.url, type: r.type, source: "resource" })),
          ...guides.map((g): PillarResourceItem => ({ id: g.id, name: g.name, url: g.url!, type: "pdf", source: "guide" })),
        ];
      };

    return await withTopicFallback(
      topicId,
      4,
      fetchLevel("topic"),
      fetchLevel("pillar"),
      (item) => `${item.source}-${item.id}`
    );
  } catch (err) {
    console.error(`[pillar-content] getPillarResources(${pillarId}, topic ${topicId}) failed:`, err);
    return [];
  }
}

// Community. Real pillarId-based query as of Phase 6 — replaces the
// query-time enum-mapping stopgap Phases 1–5 used
// (PILLAR_COMMUNITY_CATEGORIES no longer exists; see
// community-router.ts's COMMUNITY_CATEGORY_TO_PILLAR_SLUG for the
// write-time equivalent that populates this column going forward, and
// supabase_migration_community_pillars.sql for the one-time backfill).
// Signature now matches getPillarResources/getPillarStories (pillarId,
// not pillarSlug) for consistency. Still no topicId — Community doesn't
// have one yet, so there's no Phase 5 topic-fallback version of this one.
export async function getPillarCommunityPosts(pillarId: number | null) {
  if (!pillarId) return [];
  try {
    return await db
      .select({ id: communityPosts.id, title: communityPosts.title, createdAt: communityPosts.createdAt })
      .from(communityPosts)
      .where(
        and(
          eq(communityPosts.pillarId, pillarId),
          eq(communityPosts.deleted, false),
          eq(communityPosts.flagged, false)
        )
      )
      .orderBy(desc(communityPosts.createdAt))
      .limit(3);
  } catch (err) {
    console.error(`[pillar-content] getPillarCommunityPosts(${pillarId}) failed:`, err);
    return [];
  }
}

// Stories. Real pillarId-based query (Phase 4), now with the same
// topic-first/pillar-fallback as Toolkit (Phase 5) — but unlike
// resources, there was no existing signal to backfill from, so expect
// the topic-level branch especially to return nothing for a long time,
// until new submissions (which can tag themselves — see
// stories-router.ts) or editorial review builds up some tagged stories.
// Only "approved" stories are eligible, matching getApprovedStories'
// status filter in stories-router.ts.
export async function getPillarStories(pillarId: number | null, topicId?: number | null) {
  if (!pillarId) return [];
  try {
    const fetchLevel = (scope: "topic" | "pillar") => async () => {
      const pillarClause = and(eq(stories.pillarId, pillarId), eq(stories.status, "approved"));
      return db
        .select({ id: stories.id, title: stories.title, excerpt: stories.excerpt })
        .from(stories)
        .where(scope === "topic" ? and(eq(stories.topicId, topicId!), pillarClause) : pillarClause)
        .orderBy(desc(stories.createdAt))
        .limit(3);
    };

    return await withTopicFallback(topicId, 3, fetchLevel("topic"), fetchLevel("pillar"), (item) => String(item.id));
  } catch (err) {
    console.error(`[pillar-content] getPillarStories(${pillarId}, topic ${topicId}) failed:`, err);
    return [];
  }
}

export type PillarJourney = { title: string; description: string | null; href: string; totalDays: number | null };

// Journeys (Phase 7). Looks up this pillar's journey — either a native
// one (links to /challenges/[slug]) or The Forge's registry row (links
// to its externalHref, /challenges) — so ChallengesTeaser can point
// somewhere pillar-specific instead of always linking to generic
// /challenges. Returns null if this pillar has no journey yet (shouldn't
// happen for the 4 seeded pillars, but a 5th pillar added later would
// hit this before a journey exists for it) — callers fall back to the
// generic copy in that case.
export async function getPillarJourney(pillarId: number | null): Promise<PillarJourney | null> {
  if (!pillarId) return null;
  try {
    const rows = await db
      .select({ title: journeys.title, description: journeys.description, slug: journeys.slug, externalHref: journeys.externalHref, totalDays: journeys.totalDays })
      .from(journeys)
      .where(eq(journeys.pillarId, pillarId))
      .limit(1);
    const journey = rows[0];
    if (!journey) return null;
    return {
      title: journey.title,
      description: journey.description,
      href: journey.externalHref ?? `/challenges/${journey.slug}`,
      totalDays: journey.totalDays,
    };
  } catch (err) {
    console.error(`[pillar-content] getPillarJourney(${pillarId}) failed:`, err);
    return null;
  }
}
