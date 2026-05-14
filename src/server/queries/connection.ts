import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../db/schema'; 

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing!");
}

// 🚨 ADDED SSL: 'REQUIRE' HERE 🚨
const client = postgres(connectionString, { 
  prepare: false, 
  ssl: 'require' 
});

const db = drizzle(client, { schema });

export function getDb() {
  return db;
}