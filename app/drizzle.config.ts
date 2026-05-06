import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// 1. Try to load the .env file from the current 'app' folder
dotenv.config({ path: './.env' });

// 2. If it's one folder up, uncomment the line below instead!
// dotenv.config({ path: '../.env' });

if (!process.env.DATABASE_URL) {
  console.log("⚠️ WARNING: DATABASE_URL is still empty! Check your .env file path and name.");
}

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});