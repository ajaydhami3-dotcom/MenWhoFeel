import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Prevent multiple connections during hot-reloads in development
const globalForDb = globalThis as unknown as {
  postgres: postgres.Sql | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing! Set it in your environment (.env.local).");
}

// ssl: "require" — Supabase's pooled connection string requires SSL.
// This is the single shared Postgres connection for the whole app; do not
// create a second `postgres()` client elsewhere (see src/server/queries/connection.ts,
// which now just re-exports this one) — a second pool means double the
// connections against Supabase's pooler limit and a second place for SSL/config
// settings to silently drift out of sync with this one.
export const sql =
  globalForDb.postgres || postgres(connectionString, { prepare: false, ssl: "require" });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgres = sql;
}

export const db = drizzle(sql, { schema });