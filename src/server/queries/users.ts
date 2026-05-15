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

  // Note: Auto-admin promotion logic was removed here. 
  // All new signups will default to whatever your database schema defines (likely "user").

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}