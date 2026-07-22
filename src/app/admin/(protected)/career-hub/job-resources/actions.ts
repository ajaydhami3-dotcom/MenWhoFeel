"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { jobResources } from "@/db/schema";
import { verifyAdminSession } from "@/lib/admin/dal";

export interface JobResourceInput {
  title: string;
  description: string;
  url: string;
  category: (typeof jobResources.category.enumValues)[number];
  trustNotes: string | null;
  featured: boolean;
}

export type JobResourceActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

function validate(input: JobResourceInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.title.trim()) errors.title = "Title is required.";
  if (!input.description.trim()) errors.description = "Description is required.";
  if (!input.url.trim()) errors.url = "URL is required.";
  else {
    try {
      new URL(input.url);
    } catch {
      errors.url = "That doesn't look like a valid URL.";
    }
  }
  return errors;
}

export async function createJobResourceAction(input: JobResourceInput): Promise<JobResourceActionResult> {
  await verifyAdminSession();
  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  await db.insert(jobResources).values({
    title: input.title.trim(),
    description: input.description.trim(),
    url: input.url.trim(),
    category: input.category,
    trustNotes: input.trustNotes?.trim() || null,
    featured: input.featured,
    // New entries start pending — reviewed and explicitly approved
    // before they're public, same gate stories/small wins use.
    status: "pending",
  });

  revalidatePath("/admin/career-hub/job-resources");
  return { success: true };
}

export async function updateJobResourceAction(id: number, input: JobResourceInput): Promise<JobResourceActionResult> {
  await verifyAdminSession();
  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  await db
    .update(jobResources)
    .set({
      title: input.title.trim(),
      description: input.description.trim(),
      url: input.url.trim(),
      category: input.category,
      trustNotes: input.trustNotes?.trim() || null,
      featured: input.featured,
      updatedAt: new Date(),
    })
    .where(eq(jobResources.id, id));

  revalidatePath("/admin/career-hub/job-resources");
  revalidatePath("/career-hub");
  return { success: true };
}

export async function setJobResourceStatusAction(
  id: number,
  status: "pending" | "approved" | "rejected"
): Promise<JobResourceActionResult> {
  await verifyAdminSession();
  await db.update(jobResources).set({ status, updatedAt: new Date() }).where(eq(jobResources.id, id));
  revalidatePath("/admin/career-hub/job-resources");
  revalidatePath("/career-hub");
  return { success: true };
}

export async function deleteJobResourceAction(id: number): Promise<JobResourceActionResult> {
  await verifyAdminSession();
  await db.delete(jobResources).where(eq(jobResources.id, id));
  revalidatePath("/admin/career-hub/job-resources");
  revalidatePath("/career-hub");
  return { success: true };
}
