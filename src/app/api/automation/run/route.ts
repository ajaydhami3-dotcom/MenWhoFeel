import { NextResponse } from "next/server";
import { db } from "@/db";
import { automationJobs } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { runAutomationPipeline } from "@/lib/automation/pipeline";

export const dynamic = "force-dynamic";
// Give the full pipeline enough time to complete on Vercel Pro (300s max)
export const maxDuration = 300;

export async function POST(request: Request) {
  // Verify admin session
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

  if (topic.length > 500) {
    return NextResponse.json({ error: "Topic too long (max 500 chars)." }, { status: 400 });
  }

  // Create the job record
  const [job] = await db
    .insert(automationJobs)
    .values({ topic, status: "pending" })
    .returning({ id: automationJobs.id });

  // Run the pipeline — no await, it runs in background while we return the
  // job ID immediately so the UI can start polling. On Vercel the request
  // stays open until the function finishes thanks to maxDuration above.
  runAutomationPipeline(job.id).catch((err) => {
    console.error(`[api/automation/run] Unhandled pipeline error for job ${job.id}:`, err);
  });

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
