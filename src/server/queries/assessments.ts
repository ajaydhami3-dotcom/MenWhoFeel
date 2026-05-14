import { getDb } from "./connection";
import { assessments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function createAssessment(data: {
  userIdentifier: string;
  answers: string;
  score: number;
  category: string;
  recommendations: string;
}) {
  const [{ id }] = await getDb().insert(assessments).values({
    userIdentifier: data.userIdentifier,
    answers: data.answers,
    score: data.score,
    category: data.category as any,
    recommendations: data.recommendations,
  }).$returningId();
  return getDb().query.assessments.findFirst({
    where: eq(assessments.id, id),
  });
}

export async function findUserAssessments(userIdentifier: string) {
  return getDb().query.assessments.findMany({
    where: eq(assessments.userIdentifier, userIdentifier),
    orderBy: desc(assessments.createdAt),
  });
}

export async function findAssessmentById(id: number) {
  return getDb().query.assessments.findFirst({
    where: eq(assessments.id, id),
  });
}