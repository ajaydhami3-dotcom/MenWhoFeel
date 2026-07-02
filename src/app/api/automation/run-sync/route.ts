import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { automationJobs } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runAutomationPipeline } from "@/lib/automation/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Synchronous variant of /api/automation/run.
 *
 * Used for LOCAL DEVELOPMENT only — waitUntil() from @vercel/functions is a
 * no-op in Next.js dev mode, so the pipeline would never execute via the
 * main /run route locally.
 *
 * This route AWAITS the pipeline before returning, which means the HTTP
 * request stays open for the full pipeline duration (~60–90s). That is fine
 * for local testing. Do NOT use this in production — the main /run route with
 * waitUntil() is correct there.
 *
 * The AutomationRunner client component automatically picks this route when
 * NEXT_PUBLIC_APP_ENV=development is set in .env.local.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const topic: string | undefined = body?.topic?.trim();

  if (!topic || topic.length < 3) {
    return NextResponse.json(
      { error: "Please provide a topic (at least 3 characters)." },
      { status: 400 }
    );
  }

  const [job] = await db
    .insert(automationJobs)
    .values({ topic, status: "pending" })
    .returning({ id: automationJobs.id });

  await db
    .update(automationJobs)
    .set({ status: "running" })
    .where(eq(automationJobs.id, job.id));

  console.log(`[automation/run-sync] Starting pipeline synchronously for job ${job.id}`);

  try {
    await runAutomationPipeline(job.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[automation/run-sync] Pipeline crashed for job ${job.id}:`, message);
    await db
      .update(automationJobs)
      .set({ status: "failed", error: `Unhandled crash: ${message}`, finishedAt: new Date() })
      .where(eq(automationJobs.id, job.id))
      .catch(() => {});
  }

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
