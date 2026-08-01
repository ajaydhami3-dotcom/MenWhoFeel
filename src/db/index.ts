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
//
// max/idle_timeout/connect_timeout: previously unset, which meant
// postgres-js's defaults (max: 10, no connect_timeout) were what actually
// hit Supabase's own pooler. During `next build`'s static generation —
// many pages, each opening several queries, all funneling through one
// process — that's enough to exhaust the pooler's own connection ceiling,
// and with no connect_timeout, a request that can't get a slot just hangs
// rather than failing fast. That's the exact shape of "succeeds on ~28
// pages, then times out after 60s" rather than an immediate, consistent
// failure. max: 1 is the value Supabase's own docs recommend for
// serverless/edge/build contexts specifically — many short-lived
// processes each holding a couple of connections is what the pooler is
// built for, not a handful of processes each holding ten.
export const sql =
  globalForDb.postgres ||
  postgres(connectionString, {
    prepare: false,
    ssl: "require",
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgres = sql;
}

export const db = drizzle(sql, { schema });