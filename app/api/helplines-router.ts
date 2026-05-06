import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllHelplines,
  findHelplinesByCountry,
} from "./queries/helplines";

export const helplinesRouter = createRouter({
  list: publicQuery.query(() => findAllHelplines()),

  byCountry: publicQuery
    .input(z.object({ countryCode: z.string() }))
    .query(({ input }) => findHelplinesByCountry(input.countryCode)),
});
