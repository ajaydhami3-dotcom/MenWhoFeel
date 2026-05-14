import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Explicitly tell Drizzle to read the .env.local file
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL!, 
  },
});