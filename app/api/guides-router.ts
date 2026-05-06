import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllGuides,
  findFeaturedGuides,
  findGuideById,
  findGuidesByCategory,
} from "./queries/guides";

export const guidesRouter = createRouter({
  list: publicQuery
    .input(z.object({ category: z.string().optional() }).optional())
    .query(({ input }) => findAllGuides(input?.category)),

  featured: publicQuery.query(() => findFeaturedGuides()),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => findGuideById(input.id)),

  byCategory: publicQuery
    .input(z.object({ category: z.string() }))
    .query(({ input }) => findGuidesByCategory(input.category)),
});
