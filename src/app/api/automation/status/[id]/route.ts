import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { automationJobs, automationLogs, socialDrafts } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId)) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  const [job] = await db
    .select()
    .from(automationJobs)
    .where(eq(automationJobs.id, jobId));

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const [logs, drafts] = await Promise.all([
    db
      .select()
      .from(automationLogs)
      .where(eq(automationLogs.jobId, jobId))
      .orderBy(desc(automationLogs.createdAt))
      .limit(50),
    db
      .select()
      .from(socialDrafts)
      .where(eq(socialDrafts.jobId, jobId)),
  ]);

  return NextResponse.json({ job, logs: logs.reverse(), socialDrafts: drafts });
}
