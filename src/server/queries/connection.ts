import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../db/schema'; // Keep your original path here

// We explicitly type the global cache using your schema so TypeScript knows all your tables
const globalForDb = globalThis as unknown as {
  db: PostgresJsDatabase<typeof schema> | undefined;
};

export function getDb() {
  if (globalForDb.db) {
    return globalForDb.db;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing!");
  }

  // 🚨 SSL: 'REQUIRE' 🚨
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