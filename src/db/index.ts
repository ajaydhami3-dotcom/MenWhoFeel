import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Cache the pool on globalThis unconditionally (not just in dev) so it
// survives both hot-reloads in development AND any module re-evaluation
// during `next build`'s static generation — NODE_ENV is "production"
// during a build too, so a dev-only condition here means the build gets
// none of this caching and can end up creating (and never closing) a
// fresh pool each time the module is touched.
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
// hit Supabase's own pooler, and with no connect_timeout a request that
// can't get a slot just hangs rather than failing fast.
//
// max:1 is what Supabase recommends for serverless/edge *runtime* —
// many parallel function invocations, each holding a couple of
// connections, is what the pooler is built for, not a handful of
// instances each holding ten. But `next build`'s static generation is a
// completely different concurrency shape: one bounded build machine
// generating many pages, where every single page also re-renders the
// root layout (Footer runs its own DB query — see Footer.tsx) — so with
// max:1, dozens of concurrent page generations end up serialized through
// one connection, and enough of them queue past the 60s per-page limit
// even though each individual query is fast. NEXT_PHASE is set to
// "phase-production-build" specifically during the build step (not
// during normal serverless request handling), so this uses a higher
// ceiling only in that phase.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const sql =
  globalForDb.postgres ||
  postgres(connectionString, {
    prepare: false,
    ssl: "require",
    max: isBuildPhase ? 10 : 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (!globalForDb.postgres) {
  globalForDb.postgres = sql;
}

export const db = drizzle(sql, { schema });