import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
type InsertUser = typeof schema.users.$inferInsert;
import { getDb } from "./connection";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  await getDb()
    .insert(schema.users)
    .values(values)
    .onConflictDoUpdate({
      target: schema.users.unionId, // Targets the unique column to check for conflicts
      set: updateSet,
    });
}