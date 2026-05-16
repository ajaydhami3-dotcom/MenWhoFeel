import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection"; // <-- Swapped to getDb
import { announcements } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const announcementsRouter = createRouter({
  // Fetch all active broadcasts, newest first
  getActive: publicQuery.query(async () => {
    // <-- Added getDb() here
    return await getDb().select() 
      .from(announcements)
      .where(eq(announcements.active, true))
      .orderBy(desc(announcements.createdAt));
  }),
});