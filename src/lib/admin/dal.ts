import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Verifies that the current visitor is signed in AND has the `admin` role
 * on the `users` table, redirecting to /admin/login if not. Call this at
 * the top of every admin layout, page, and Server Action that touches admin
 * data — `cache()` means calling it more than once per request is free.
 *
 * src/proxy.ts already redirects signed-out visitors before they reach any
 * of this, but it deliberately stops at "is someone logged in" and never
 * touches Postgres (see the comment there). This function is what actually
 * checks the `admin` role, close to the data, the way Next.js's own
 * authentication guide recommends.
 */
export const verifyAdminSession = cache(async () => {
  const supabase = await createSupabaseServerClient();

  // getClaims() verifies the JWT signature against the project's published
  // keys — unlike getSession(), it can't be spoofed by a tampered cookie.
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/admin/login");
  }

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.unionId, data.claims.sub))
    .limit(1);

  const adminUser = rows[0];

  if (!adminUser || adminUser.role !== "admin") {
    // Can't clear the cookie itself from here (Server Components can't set
    // cookies), but this does revoke the refresh token server-side right
    // away rather than leaving it live for its full natural lifetime.
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  return { claims: data.claims, adminUser };
});
