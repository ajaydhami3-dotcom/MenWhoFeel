"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { providers } from "@/db/schema";
import { verifyAdminSession } from "@/lib/admin/dal";

export interface ProviderInput {
  name: string;
  type: (typeof providers.type.enumValues)[number];
  description: string;
  location: string;
  url: string;
  trustNotes: string | null;
  pillarId: number | null;
  featured: boolean;
}

export type ProviderActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

function validate(input: ProviderInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.name.trim()) errors.name = "Name is required.";
  if (!input.description.trim()) errors.description = "Description is required.";
  if (!input.location.trim()) errors.location = "Location is required — use 'Telehealth — nationwide' if there's no fixed location.";
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

export async function createProviderAction(input: ProviderInput): Promise<ProviderActionResult> {
  await verifyAdminSession();
  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  await db.insert(providers).values({
    name: input.name.trim(),
    type: input.type,
    description: input.description.trim(),
    location: input.location.trim(),
    url: input.url.trim(),
    trustNotes: input.trustNotes?.trim() || null,
    pillarId: input.pillarId,
    featured: input.featured,
    // New entries start pending — reviewed and explicitly approved
    // before they're public, same gate every other curated-listing
    // feature on the site uses.
    status: "pending",
  });

  revalidatePath("/admin/provider-directory");
  return { success: true };
}

export async function updateProviderAction(id: number, input: ProviderInput): Promise<ProviderActionResult> {
  await verifyAdminSession();
  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  await db
    .update(providers)
    .set({
      name: input.name.trim(),
      type: input.type,
      description: input.description.trim(),
      location: input.location.trim(),
      url: input.url.trim(),
      trustNotes: input.trustNotes?.trim() || null,
      pillarId: input.pillarId,
      featured: input.featured,
      updatedAt: new Date(),
    })
    .where(eq(providers.id, id));

  revalidatePath("/admin/provider-directory");
  revalidatePath("/provider-directory");
  return { success: true };
}

export async function setProviderStatusAction(
  id: number,
  status: "pending" | "approved" | "rejected"
): Promise<ProviderActionResult> {
  await verifyAdminSession();
  await db.update(providers).set({ status, updatedAt: new Date() }).where(eq(providers.id, id));
  revalidatePath("/admin/provider-directory");
  revalidatePath("/provider-directory");
  return { success: true };
}

export async function deleteProviderAction(id: number): Promise<ProviderActionResult> {
  await verifyAdminSession();
  await db.delete(providers).where(eq(providers.id, id));
  revalidatePath("/admin/provider-directory");
  revalidatePath("/provider-directory");
  return { success: true };
}
