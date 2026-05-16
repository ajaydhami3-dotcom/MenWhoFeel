import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../db/schema'; 

// Standard Next.js pattern to prevent exhausting DB connections during hot-reloads
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

export function getDb() {
  // If we already have a connection, reuse it
  if (globalForDb.db) {
    return globalForDb.db;
  }

  const connectionString = process.env.DATABASE_URL;

  // We only throw this error if a function actually tries to query the database,
  // preventing it from crashing the build worker.
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing!");
  }

  // 🚨 ADDED SSL: 'REQUIRE' HERE 🚨
  const client = postgres(connectionString, { 
    prepare: false, 
    ssl: 'require' 
  });

  const db = drizzle(client, { schema });
  
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.db = db;
  }

  return db;
}