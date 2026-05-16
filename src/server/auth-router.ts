import { z } from "zod";
import { createRouter, publicQuery } from "./middleware"; 
import { supabase } from "@/lib/supabase"; 
import { getDb } from "./queries/connection"; // <-- Swapped to getDb
import { users } from "../db/schema"; 

export const authRouter = createRouter({
  // LOGIN - Handled purely by Supabase Auth
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

  // REGISTER - Supabase Auth + Drizzle Database Sync
  register: publicQuery
    .input(z.object({ 
      email: z.string().email(), 
      password: z.string(),
      name: z.string().optional() // Added name so they can set it on signup
    }))
    .mutation(async ({ input }) => {
      // 1. Create the secure user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
      });
      
      if (error) throw new Error(error.message);
      
      // 2. THE UPGRADE: Instantly create their profile in your Drizzle database
      if (data.user) {
        // <-- Added getDb() here
        await getDb().insert(users).values({
          unionId: data.user.id, // This links your DB to Supabase Auth
          email: input.email,
          name: input.name || "Anonymous User",
        });
      }

      return data;
    }),

  // LOGOUT
  logout: publicQuery.mutation(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return { success: true };
  }),
});