import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://build-bypass.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "build-bypass-key";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getClaims() verifies the JWT against Supabase's published keys rather
  // than trusting whatever's sitting in the cookie. This only confirms
  // *someone* is signed in — deliberately not a Postgres lookup, both
  // because Proxy runs on every request (including prefetches) and because
  // a second connection pool here would compete with the one in src/db
  // against Supabase's pooler limit. The actual `admin` role check lives in
  // src/lib/admin/dal.ts, right next to the data it's protecting.
  const { data, error } = await supabase.auth.getClaims();
  const isSignedIn = !error && !!data?.claims;

  if (isLoginPage) {
    // Already signed in and revisiting the login page — send them on to the
    // dashboard. The `error` param is the one exception: that's how the
    // (protected) layout sends a signed-in-but-not-admin user back here, and
    // redirecting them straight back to /admin would just bounce them in a
    // loop. Skip the auto-redirect whenever it's present so the login page
    // actually gets to render and show the "no admin access" message.
    if (isSignedIn && !request.nextUrl.searchParams.has("error")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  if (!isSignedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
