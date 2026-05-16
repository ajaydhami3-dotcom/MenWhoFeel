import { createClient } from "@supabase/supabase-js";

// We provide fallback dummy strings so the Next.js build worker doesn't crash 
// if it evaluates this file before Vercel injects the environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://build-bypass.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "build-bypass-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);