import { db as sharedDb } from "../../db";

// This used to open its own separate Postgres connection pool (with its own
// SSL settings) alongside the one in src/db/index.ts. Two pools against the
// same Supabase database meant double the open connections for no benefit,
// and the two clients could drift out of sync (this one had ssl: 'require',
// the other didn't). getDb() now just returns the one shared client so
// there's a single connection pool and a single place to configure it.
export function getDb() {
  return sharedDb;
}