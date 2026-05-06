import { getDb } from "./connection";
import { chatMessages } from "@db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export async function findApprovedMessages(limit = 100) {
  return getDb().query.chatMessages.findMany({
    where: eq(chatMessages.status, "approved"),
    orderBy: desc(chatMessages.createdAt),
    limit,
  });
}

export async function findRecentMessages(limit = 50) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return getDb().query.chatMessages.findMany({
    where: and(
      eq(chatMessages.status, "approved"),
      gte(chatMessages.createdAt, oneHourAgo)
    ),
    orderBy: desc(chatMessages.createdAt),
    limit,
  });
}

export async function createMessage(data: { authorName: string; content: string }) {
  // THE FIX: Changed .$returningId() to .returning()
  const [{ id }] = await getDb().insert(chatMessages).values({
    authorName: data.authorName || "Anonymous",
    content: data.content,
    status: "approved",
  }).returning();
  
  return getDb().query.chatMessages.findFirst({
    where: eq(chatMessages.id, id),
  });
}

export async function findPendingMessages() {
  return getDb().query.chatMessages.findMany({
    where: eq(chatMessages.status, "pending"),
    orderBy: desc(chatMessages.createdAt),
  });
}

export async function moderateMessage(id: number, status: "approved" | "rejected") {
  await getDb().update(chatMessages).set({ status }).where(eq(chatMessages.id, id));
}