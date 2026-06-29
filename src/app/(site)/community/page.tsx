// This is a SERVER component — the default (all categories, recent) post
// list is fetched at request time and included directly in the HTML that
// Google crawls. Previously this whole route was "use client", which meant
// the raw HTML contained no posts at all — just a loading skeleton — until
// JS executed in the browser. Filtering, search, upvoting, posting, and
// reporting are all still fully interactive; they just live in
// CommunityClient now, seeded with this initial data.
import { db } from "@/db";
import { communityPosts, communityComments } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import CommunityClient, { type CommunityPost } from "./CommunityClient";

// ISR: re-generate at most every 60 seconds so new posts/upvotes show up
// reasonably quickly without needing a full deploy. Shorter than the 300s
// used elsewhere because community activity is the most time-sensitive
// content on the site.
export const revalidate = 60;

async function fetchInitialPosts(): Promise<CommunityPost[]> {
  try {
    const posts = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.deleted, false))
      .orderBy(desc(communityPosts.createdAt))
      .limit(30);

    const withCounts = await Promise.all(
      posts.map(async (post) => {
        const [{ count }] = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(communityComments)
          .where(
            and(
              eq(communityComments.postId, post.id),
              eq(communityComments.deleted, false)
            )
          );
        // Kept as native Date objects (not .toISOString()) — this is passed
        // straight through as the `initialData` for the tRPC query below, so
        // it needs to structurally match CommunityPost (inferred from the
        // router's actual return type, which is `Date`, not `string`). RSC
        // serializes Date objects across the server -> client boundary fine.
        return { ...post, commentCount: count ?? 0 };
      })
    );

    return withCounts;
  } catch (err) {
    // DB unavailable — render with an empty initial list. CommunityClient's
    // own tRPC query will retry client-side instead of crashing the page.
    console.error("[community/page] DB fetch failed:", err);
    return [];
  }
}

export default async function CommunityPage() {
  const initialPosts = await fetchInitialPosts();
  return <CommunityClient initialPosts={initialPosts} />;
}
