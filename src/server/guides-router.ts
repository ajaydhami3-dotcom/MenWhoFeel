import { createRouter, publicQuery } from "./middleware";
import { db } from "../db"; 
import { resources } from "../db/schema"; 

export const guidesRouter = createRouter({
  getAllResources: publicQuery.query(async () => {
    // This now fetches from the 'resources' table with the correct categories
    return await db.select().from(resources);
  }),
});