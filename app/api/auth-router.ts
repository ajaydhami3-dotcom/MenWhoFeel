import { z } from "zod";
import { createRouter, publicQuery } from "./middleware"; 
import { supabase } from "../src/lib/supabase";

export const authRouter = createRouter({
  // LOGIN
  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      
      if (error) throw new Error(error.message);
      return data;
    }),

  // REGISTER
  register: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
      });
      
      if (error) throw new Error(error.message);
      return data;
    }),

  // LOGOUT
  logout: publicQuery.mutation(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return { success: true };
  }),
});