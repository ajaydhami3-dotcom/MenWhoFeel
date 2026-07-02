import { eq, desc, count, and } from "drizzle-orm";
import { db } from "@/db";
import { automationJobs, automationLogs, automationSettings, socialDrafts, articles } from "@/db/schema";

export async function getAutomationDashboardStats() {
  const [
    [totalRow],
    [runningRow],
    [awaitingRow],
    [publishedRow],
    [failedRow],
    recentJobs,
  ] = await Promise.all([
    db.select({ value: count() }).from(automationJobs),
    db.select({ value: count() }).from(automationJobs).where(eq(automationJobs.status, "running")),
    db.select({ value: count() }).from(automationJobs).where(eq(automationJobs.status, "awaiting_review")),
    db.select({ value: count() }).from(automationJobs).where(eq(automationJobs.status, "published")),
    db.select({ value: count() }).from(automationJobs).where(eq(automationJobs.status, "failed")),
    db
      .select({
        id: automationJobs.id,
        topic: automationJobs.topic,
        status: automationJobs.status,
        stage: automationJobs.stage,
        createdAt: automationJobs.createdAt,
        finishedAt: automationJobs.finishedAt,
        articleId: automationJobs.articleId,
      })
      .from(automationJobs)
      .orderBy(desc(automationJobs.createdAt))
      .limit(5),
  ]);

  // Social draft counts
  const [redditRow] = await db
    .select({ value: count() })
    .from(socialDrafts)
    .where(and(eq(socialDrafts.platform, "reddit"), eq(socialDrafts.status, "pending")));
  const [xRow] = await db
    .select({ value: count() })
    .from(socialDrafts)
    .where(and(eq(socialDrafts.platform, "x"), eq(socialDrafts.status, "pending")));
  const [igRow] = await db
    .select({ value: count() })
    .from(socialDrafts)
    .where(and(eq(socialDrafts.platform, "instagram"), eq(socialDrafts.status, "pending")));
  const [ytRow] = await db
    .select({ value: count() })
    .from(socialDrafts)
    .where(and(eq(socialDrafts.platform, "youtube"), eq(socialDrafts.status, "pending")));

  return {
    total: totalRow.value,
    running: runningRow.value,
    awaitingReview: awaitingRow.value,
    published: publishedRow.value,
    failed: failedRow.value,
    redditDrafts: redditRow.value,
    xDrafts: xRow.value,
    instagramDrafts: igRow.value,
    youtubeDrafts: ytRow.value,
    recentJobs,
  };
}

export async function getAutomationQueue() {
  return db
    .select({
      id: automationJobs.id,
      topic: automationJobs.topic,
      status: automationJobs.status,
      stage: automationJobs.stage,
      createdAt: automationJobs.createdAt,
      finishedAt: automationJobs.finishedAt,
      articleId: automationJobs.articleId,
      articleTitle: articles.title,
      articleSlug: articles.slug,
    })
    .from(automationJobs)
    .leftJoin(articles, eq(automationJobs.articleId, articles.id))
    .where(eq(automationJobs.status, "awaiting_review"))
    .orderBy(desc(automationJobs.createdAt));
}

export async function getAutomationHistory(limit = 50) {
  return db
    .select({
      id: automationJobs.id,
      topic: automationJobs.topic,
      status: automationJobs.status,
      stage: automationJobs.stage,
      createdAt: automationJobs.createdAt,
      finishedAt: automationJobs.finishedAt,
      articleId: automationJobs.articleId,
      articleTitle: articles.title,
      articleSlug: articles.slug,
      error: automationJobs.error,
    })
    .from(automationJobs)
    .leftJoin(articles, eq(automationJobs.articleId, articles.id))
    .orderBy(desc(automationJobs.createdAt))
    .limit(limit);
}

export async function getAutomationLogs(jobId?: number, limit = 100) {
  const query = db
    .select()
    .from(automationLogs)
    .orderBy(desc(automationLogs.createdAt))
    .limit(limit);

  if (jobId) {
    return db
      .select()
      .from(automationLogs)
      .where(eq(automationLogs.jobId, jobId))
      .orderBy(desc(automationLogs.createdAt))
      .limit(limit);
  }
  return query;
}

export async function getAutomationSettings() {
  const [row] = await db
    .select()
    .from(automationSettings)
    .where(eq(automationSettings.id, 1));
  return row ?? null;
}

export async function getJobWithDetails(jobId: number) {
  const [job] = await db
    .select()
    .from(automationJobs)
    .where(eq(automationJobs.id, jobId));
  if (!job) return null;

  const [logs, drafts] = await Promise.all([
    db
      .select()
      .from(automationLogs)
      .where(eq(automationLogs.jobId, jobId))
      .orderBy(automationLogs.createdAt),
    db
      .select()
      .from(socialDrafts)
      .where(eq(socialDrafts.jobId, jobId)),
  ]);

  return { job, logs, socialDrafts: drafts };
}
