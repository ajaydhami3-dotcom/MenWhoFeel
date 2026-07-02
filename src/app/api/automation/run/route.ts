import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { automationJobs } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runAutomationPipeline } from "@/lib/automation/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Validate input ──────────────────────────────────────────────────────────
  const body = await request.json().catch(() => null);
  const topic: string | undefined = body?.topic?.trim();

  if (!topic || topic.length < 3) {
    return NextResponse.json(
      { error: "Please provide a topic (at least 3 characters)." },
      { status: 400 }
    );
  }
  if (topic.length > 500) {
    return NextResponse.json(
      { error: "Topic too long (max 500 chars)." },
      { status: 400 }
    );
  }

  // ── Create job record ───────────────────────────────────────────────────────
  const [job] = await db
    .insert(automationJobs)
    .values({ topic, status: "pending" })
    .returning({ id: automationJobs.id });

  console.log(`[automation/run] Job ${job.id} created for topic: "${topic}"`);

  // ── Mark running BEFORE returning the response ──────────────────────────────
  // This write happens synchronously inside the request, before the response
  // is sent, so it is guaranteed to complete even if the background task
  // never starts (e.g. if waitUntil isn't supported in the current runtime).
  await db
    .update(automationJobs)
    .set({ status: "running" })
    .where(eq(automationJobs.id, job.id));

  console.log(`[automation/run] Job ${job.id} marked running, handing off to pipeline`);

  // ── Run pipeline via waitUntil ───────────────────────────────────────────────
  //
  // THE BUG THIS FIXES:
  // The original code used fire-and-forget:
  //   runAutomationPipeline(job.id).catch(...)   // no await
  //   return NextResponse.json(...)               // response sent
  //
  // In a serverless environment (Vercel), returning the response terminates
  // the execution context. Any unawaited Promise is abandoned at that point —
  // the event loop is frozen and never resumes. maxDuration only extends the
  // function if something is actively being awaited. So jobs stayed "pending"
  // forever because the pipeline was killed before it could write "running".
  //
  // waitUntil() from @vercel/functions is the correct API for this pattern:
  // it registers a Promise that the runtime must keep the function alive to
  // resolve, even after the HTTP response has been sent. This is equivalent
  // to the Service Worker ExtendableEvent.waitUntil() API.
  //
  // Local dev note: waitUntil is a no-op in Next.js dev mode (no serverless
  // context) so the pipeline won't run locally via this route. Use the
  // /api/automation/run-sync route (see below) for local testing.
  waitUntil(
    runAutomationPipeline(job.id).catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[automation/run] Pipeline crashed for job ${job.id}: ${message}`);
      // Best-effort: mark the job failed so the UI doesn't poll forever.
      db.update(automationJobs)
        .set({ status: "failed", error: `Unhandled crash: ${message}`, finishedAt: new Date() })
        .where(eq(automationJobs.id, job.id))
        .catch(() => {}); // ignore secondary DB errors
    })
  );

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
