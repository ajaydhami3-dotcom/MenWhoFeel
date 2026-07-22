import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resumes, type ResumeExperienceEntry, type ResumeEducationEntry } from "@/db/schema";

// Every function here takes a userId and only ever touches that user's
// own row — there's no getAllResumes, no pillar-scoped or public variant,
// unlike every other query module in this migration. See schema.ts and
// supabase_migration_resumes.sql for why this table is treated
// differently.

export type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  summary: string;
  template: string;
  experience: ResumeExperienceEntry[];
  education: ResumeEducationEntry[];
  skills: string[];
};

export async function getResumeByUserId(userId: number) {
  const rows = await db.select().from(resumes).where(eq(resumes.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function upsertResume(userId: number, data: ResumeData) {
  const existing = await getResumeByUserId(userId);

  if (existing) {
    const [updated] = await db
      .update(resumes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(resumes.userId, userId))
      .returning();
    return updated;
  }

  const [created] = await db.insert(resumes).values({ userId, ...data }).returning();
  return created;
}
