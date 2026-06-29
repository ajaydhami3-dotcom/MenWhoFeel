import { NextResponse, type NextRequest } from "next/server";
import { lte, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export const dynamic = "force-dynamic";

/**
 * Runs on Vercel Cron (see vercel.json). Publishes any article whose
 * scheduled `publishedAt` has passed. Protected by CRON_SECRET so this
 * can't be hit by anyone else to force-publish scheduled content early.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await db
    .select({ id: articles.id, slug: articles.slug })
    .from(articles)
    .where(and(eq(articles.status, "scheduled"), lte(articles.publishedAt, new Date())));

  if (due.length > 0) {
    await db
      .update(articles)
      .set({ status: "published" })
      .where(and(eq(articles.status, "scheduled"), lte(articles.publishedAt, new Date())));
  }

  return NextResponse.json({ published: due.map((a) => a.slug) });
}
