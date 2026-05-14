import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prevent multiple connections during hot-reloads in development
const globalForDb = globalThis as unknown as {
  postgres: postgres.Sql | undefined;
};

const connectionString = process.env.DATABASE_URL!;

export const sql = globalForDb.postgres || postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgres = sql;
}

export const db = drizzle(sql, { schema });