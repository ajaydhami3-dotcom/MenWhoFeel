import { getDb } from "./connection";
import { stories, storyComments } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function findApprovedStories() {
  return getDb().query.stories.findMany({
    where: eq(stories.status, "approved"),
    orderBy: desc(stories.createdAt),
  });
}

export async function findFeaturedStories() {
  return getDb().query.stories.findMany({
    where: and(eq(stories.status, "approved"), eq(stories.featured, true)),
    orderBy: desc(stories.createdAt),
    limit: 3,
  });
}

export async function findStoryById(id: number) {
  return getDb().query.stories.findFirst({
    where: eq(stories.id, id),
  });
}

export async function findStoryComments(storyId: number) {
  return getDb().query.storyComments.findMany({
    where: and(
      eq(storyComments.storyId, storyId),
      eq(storyComments.status, "approved")
    ),
    orderBy: desc(storyComments.createdAt),
  });
}

export async function createStory(data: { title: string; content: string; authorName: string; excerpt?: string }) {
  // FIX 1: Changed .$returningId() to .returning()
  const [{ id }] = await getDb().insert(stories).values({
    title: data.title,
    content: data.content,
    authorName: data.authorName || "Anonymous",
    excerpt: data.excerpt || data.content.slice(0, 200) + "...",
    status: "pending", // (Note: Change this to "approved" if you want it to show up instantly without moderation!)
  }).returning();
  
  return findStoryById(id);
}

export async function createStoryComment(data: { storyId: number; authorName: string; content: string }) {
  // FIX 2: Changed .$returningId() to .returning()
  const [{ id }] = await getDb().insert(storyComments).values({
    storyId: data.storyId,
    authorName: data.authorName || "Anonymous",
    content: data.content,
    status: "pending",
  }).returning();
  
  return getDb().query.storyComments.findFirst({
    where: eq(storyComments.id, id),
  });
}

export async function findPendingStories() {
  return getDb().query.stories.findMany({
    where: eq(stories.status, "pending"),
    orderBy: desc(stories.createdAt),
  });
}

export async function findPendingComments() {
  return getDb().query.storyComments.findMany({
    where: eq(storyComments.status, "pending"),
    orderBy: desc(storyComments.createdAt),
  });
}

export async function moderateStory(id: number, status: "approved" | "rejected") {
  await getDb().update(stories).set({ status }).where(eq(stories.id, id));
}

export async function moderateComment(id: number, status: "approved" | "rejected") {
  await getDb().update(storyComments).set({ status }).where(eq(storyComments.id, id));
}

export async function getStoryCount() {
  const result = await getDb().select({ count: sql<number>`count(*)` }).from(stories).where(eq(stories.status, "approved"));
  return result[0]?.count || 0;
}