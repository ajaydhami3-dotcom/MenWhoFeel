import { getDb } from "./connection";
import { selfHelpGuides } from "@db/schema";
import { eq } from "drizzle-orm";

export async function findAllGuides(category?: string) {
  if (category) {
    return getDb().query.selfHelpGuides.findMany({
      where: eq(selfHelpGuides.category, category as any),
      orderBy: selfHelpGuides.createdAt,
    });
  }
  return getDb().query.selfHelpGuides.findMany({
    orderBy: selfHelpGuides.createdAt,
  });
}

export async function findFeaturedGuides() {
  return getDb().query.selfHelpGuides.findMany({
    where: eq(selfHelpGuides.featured, true),
    limit: 4,
  });
}

export async function findGuideById(id: number) {
  return getDb().query.selfHelpGuides.findFirst({
    where: eq(selfHelpGuides.id, id),
  });
}

export async function findGuidesByCategory(category: string) {
  return getDb().query.selfHelpGuides.findMany({
    where: eq(selfHelpGuides.category, category as any),
    orderBy: selfHelpGuides.createdAt,
  });
}
