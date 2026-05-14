import { getDb } from "./connection";
import { challenges, userChallenges } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function findActiveChallenges(category?: string) {
  if (category) {
    return getDb().query.challenges.findMany({
      where: and(eq(challenges.category, category as any), eq(challenges.active, true)),
      orderBy: challenges.createdAt,
    });
  }
  return getDb().query.challenges.findMany({
    where: eq(challenges.active, true),
    orderBy: challenges.createdAt,
  });
}

export async function findChallengeById(id: number) {
  return getDb().query.challenges.findFirst({
    where: eq(challenges.id, id),
  });
}

export async function findUserProgress(userIdentifier: string) {
  return getDb().query.userChallenges.findMany({
    where: eq(userChallenges.userIdentifier, userIdentifier),
    with: {
      challenge: true,
    },
  });
}

export async function completeChallenge(data: { challengeId: number; userIdentifier: string; notes?: string }) {
  const [{ id }] = await getDb().insert(userChallenges).values({
    challengeId: data.challengeId,
    userIdentifier: data.userIdentifier,
    completed: true,
    notes: data.notes,
    completedAt: new Date(),
  }).$returningId();
  return getDb().query.userChallenges.findFirst({
    where: eq(userChallenges.id, id),
    with: { challenge: true },
  });
}

export async function getTodayProgress(userIdentifier: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getDb().query.userChallenges.findMany({
    where: and(
      eq(userChallenges.userIdentifier, userIdentifier),
      gte(userChallenges.completedAt, today)
    ),
    with: { challenge: true },
  });
}

export async function getWeeklyProgress(userIdentifier: string) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return getDb().query.userChallenges.findMany({
    where: and(
      eq(userChallenges.userIdentifier, userIdentifier),
      gte(userChallenges.completedAt, weekAgo)
    ),
    with: { challenge: true },
  });
}

export async function getChallengeStats() {
  const total = await getDb().select({ count: sql<number>`count(*)` }).from(challenges).where(eq(challenges.active, true));
  return { total: total[0]?.count || 0 };
}