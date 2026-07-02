"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { automationJobs, automationSettings } from "@/db/schema";
import { verifyAdminSession } from "@/lib/admin/dal";
import { publishSocialDraftAction } from "@/lib/automation/social";

export async function cancelJobAction(jobId: number): Promise<{ success: boolean; error?: string }> {
  await verifyAdminSession();
  const [job] = await db
    .select({ status: automationJobs.status })
    .from(automationJobs)
    .where(eq(automationJobs.id, jobId));

  if (!job) return { success: false, error: "Job not found" };
  if (job.status === "published") return { success: false, error: "Cannot cancel a published job" };

  await db
    .update(automationJobs)
    .set({ status: "cancelled", finishedAt: new Date() })
    .where(eq(automationJobs.id, jobId));

  revalidatePath("/admin/automation");
  revalidatePath("/admin/automation/queue");
  revalidatePath("/admin/automation/history");
  return { success: true };
}

export type SettingsInput = {
  aiProvider: "gemini" | "groq";
  imageProvider: "fal" | "none";
  imageStyle: string;
  defaultAuthor: string;
  defaultCategoryId: number | null;
  redditEnabled: boolean;
  redditSubreddits: string[];
  xEnabled: boolean;
  instagramEnabled: boolean;
  defaultHashtags: string[];
  researchPrompt: string | null;
  writingPrompt: string | null;
  seoPrompt: string | null;
  socialPrompt: string | null;
};

export async function saveSettingsAction(
  input: SettingsInput
): Promise<{ success: boolean; error?: string }> {
  await verifyAdminSession();

  try {
    await db
      .update(automationSettings)
      .set({
        aiProvider: input.aiProvider,
        imageProvider: input.imageProvider,
        imageStyle: input.imageStyle || "photorealistic, editorial, men's wellness",
        defaultAuthor: input.defaultAuthor || "MenWhoFeel Core",
        defaultCategoryId: input.defaultCategoryId,
        redditEnabled: input.redditEnabled,
        redditSubreddits: input.redditSubreddits.filter(Boolean),
        xEnabled: input.xEnabled,
        instagramEnabled: input.instagramEnabled,
        defaultHashtags: input.defaultHashtags.filter(Boolean),
        researchPrompt: input.researchPrompt?.trim() || null,
        writingPrompt: input.writingPrompt?.trim() || null,
        seoPrompt: input.seoPrompt?.trim() || null,
        socialPrompt: input.socialPrompt?.trim() || null,
      })
      .where(eq(automationSettings.id, 1));

    revalidatePath("/admin/automation/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}

export async function publishSocialAction(
  draftId: number
): Promise<{ success: boolean; error?: string; url?: string }> {
  await verifyAdminSession();
  return publishSocialDraftAction(draftId);
}
