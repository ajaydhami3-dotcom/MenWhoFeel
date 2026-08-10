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
// max:1 at runtime was the actual cause of the slow/hanging article and
// story pages (bug hunt, Aug 2026): those pages fire 6-13 DB queries per
// request — several explicitly wrapped in Promise.all to run concurrently
// (see intel/[slug]/page.tsx, pillar-content.ts) — but with only one real
// connection in the pool, postgres-js can't actually run any of them at
// the same time. Every "parallel" query just queues behind the one
// connection and runs sequentially, so Promise.all bought nothing and
// each page paid the full sum of its query latencies instead of just the
// slowest one. Under any extra load that queue is also what tipped pages
// into not loading at all rather than just being slow.
//
// max:5 keeps this well inside what Supabase's pooler is built for
// (many clients, each holding a handful of connections — this is Supavisor
// in transaction mode, not a direct Postgres connection with a hard cap)
// while giving one request's concurrent queries somewhere to actually run
// concurrently. `next build`'s static generation is a different
// concurrency shape again — one bounded build machine generating many
// pages at once, each re-rendering the root layout too (Footer runs its
// own DB query) — so it keeps its own higher ceiling. NEXT_PHASE is set
// to "phase-production-build" specifically during the build step (not
// during normal serverless request handling), so that ceiling only
// applies there.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const sql =
  globalForDb.postgres ||
  postgres(connectionString, {
    prepare: false,
    ssl: "require",
    max: isBuildPhase ? 10 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (!globalForDb.postgres) {
  globalForDb.postgres = sql;
}

export const db = drizzle(sql, { schema });