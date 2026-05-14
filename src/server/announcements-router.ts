import { createRouter, publicQuery } from "./middleware";
import { db } from "../db"; 
import { announcements } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const announcementsRouter = createRouter({
  // Fetch all active broadcasts, newest first
  getActive: publicQuery.query(async () => {
    return await db.select()
      .from(announcements)
      .where(eq(announcements.active, true))
      .orderBy(desc(announcements.createdAt));
  }),
});