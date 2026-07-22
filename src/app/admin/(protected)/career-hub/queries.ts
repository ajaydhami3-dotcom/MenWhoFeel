import { db } from "@/db";
import { smallWins, jobResources } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getAllJobResources() {
  return db.select().from(jobResources).orderBy(desc(jobResources.createdAt));
}

export async function getAllSmallWins() {
  return db.select().from(smallWins).orderBy(desc(smallWins.createdAt));
}

export async function getJobResourceById(id: number) {
  const rows = await db.select().from(jobResources).where(eq(jobResources.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getSmallWinById(id: number) {
  const rows = await db.select().from(smallWins).where(eq(smallWins.id, id)).limit(1);
  return rows[0] ?? null;
}
