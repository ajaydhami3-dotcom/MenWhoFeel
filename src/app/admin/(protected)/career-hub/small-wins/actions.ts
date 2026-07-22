"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { smallWins } from "@/db/schema";
import { verifyAdminSession } from "@/lib/admin/dal";

export interface SmallWinInput {
  title: string;
  description: string;
  url: string;
  category: (typeof smallWins.category.enumValues)[number];
  payDetails: string | null;
  requirements: string | null;
  trustNotes: string | null;
  featured: boolean;
}

export type SmallWinActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

function validate(input: SmallWinInput): Record<string, string> {
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

export async function createSmallWinAction(input: SmallWinInput): Promise<SmallWinActionResult> {
  await verifyAdminSession();
  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  await db.insert(smallWins).values({
    title: input.title.trim(),
    description: input.description.trim(),
    url: input.url.trim(),
    category: input.category,
    payDetails: input.payDetails?.trim() || null,
    requirements: input.requirements?.trim() || null,
    trustNotes: input.trustNotes?.trim() || null,
    featured: input.featured,
    status: "pending",
  });

  revalidatePath("/admin/career-hub/small-wins");
  return { success: true };
}

export async function updateSmallWinAction(id: number, input: SmallWinInput): Promise<SmallWinActionResult> {
  await verifyAdminSession();
  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  await db
    .update(smallWins)
    .set({
      title: input.title.trim(),
      description: input.description.trim(),
      url: input.url.trim(),
      category: input.category,
      payDetails: input.payDetails?.trim() || null,
      requirements: input.requirements?.trim() || null,
      trustNotes: input.trustNotes?.trim() || null,
      featured: input.featured,
      updatedAt: new Date(),
    })
    .where(eq(smallWins.id, id));

  revalidatePath("/admin/career-hub/small-wins");
  revalidatePath("/small-wins");
  return { success: true };
}

export async function setSmallWinStatusAction(
  id: number,
  status: "pending" | "approved" | "rejected"
): Promise<SmallWinActionResult> {
  await verifyAdminSession();
  await db.update(smallWins).set({ status, updatedAt: new Date() }).where(eq(smallWins.id, id));
  revalidatePath("/admin/career-hub/small-wins");
  revalidatePath("/small-wins");
  return { success: true };
}

export async function deleteSmallWinAction(id: number): Promise<SmallWinActionResult> {
  await verifyAdminSession();
  await db.delete(smallWins).where(eq(smallWins.id, id));
  revalidatePath("/admin/career-hub/small-wins");
  revalidatePath("/small-wins");
  return { success: true };
}
