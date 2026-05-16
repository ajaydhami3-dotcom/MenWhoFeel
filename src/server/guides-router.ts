import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection"; // <-- Swapped to getDb
import { resources } from "../db/schema"; 

export const guidesRouter = createRouter({
  getAllResources: publicQuery.query(async () => {
    // <-- Added getDb() here
    // This now fetches from the 'resources' table with the correct categories
    return await getDb().select().from(resources);
  }),
});