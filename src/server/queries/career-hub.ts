import { db } from "@/db";
import { smallWins, jobResources } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Both tables are scoped to Work & Financial Stability by product
// definition, not by a pillarId column — see schema.ts's comment on this
// section. No topic-fallback pattern here either (unlike
// server/queries/pillar-content.ts's functions): these aren't meant to be
// discovered piecemeal across every pillar page, just from their own
// dedicated pages and a link from the Work & Financial Stability category
// page.

export async function getApprovedSmallWins() {
  try {
    return await db
      .select()
      .from(smallWins)
      .where(eq(smallWins.status, "approved"))
      .orderBy(desc(smallWins.featured), desc(smallWins.createdAt));
  } catch (err) {
    console.error("[career-hub] getApprovedSmallWins failed:", err);
    return [];
  }
}

export async function getApprovedJobResources() {
  try {
    return await db
      .select()
      .from(jobResources)
      .where(eq(jobResources.status, "approved"))
      .orderBy(desc(jobResources.featured), desc(jobResources.createdAt));
  } catch (err) {
    console.error("[career-hub] getApprovedJobResources failed:", err);
    return [];
  }
}

/** A few of each, for the Work & Financial Stability category page and
 * the /career-hub landing page's own teaser sections. */
export async function getFeaturedSmallWins(limit = 3) {
  const all = await getApprovedSmallWins();
  return all.slice(0, limit);
}

export async function getFeaturedJobResources(limit = 3) {
  const all = await getApprovedJobResources();
  return all.slice(0, limit);
}
