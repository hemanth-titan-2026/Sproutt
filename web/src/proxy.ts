import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before every matched request.
 *
 * Two jobs:
 *  1. Refresh the Supabase session and write the rotated auth cookies onto the
 *     response. Server Components can't set cookies, so without this the
 *     session would silently expire mid-visit.
 *  2. An optimistic redirect for protected/auth-only routes. This is a UX
 *     shortcut, not the security boundary — every protected page still calls
 *     getUser() itself, and the database is guarded by Row Level Security.
 */

/** Signed-out visitors get bounced to /login. */
const PROTECTED_PREFIXES = ["/account"];

/** Signed-in visitors get bounced away from these. */
const AUTH_ONLY_PREFIXES = ["/login", "/signup", "/forgot-password"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  // Not configured yet (fresh clone, no .env.local) — let the request through
  // so the app still renders instead of 500ing on every route.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        // no-store headers: a response carrying auth cookies must never be
        // cached by a CDN, or one user's session could be served to another.
        for (const [header, headerValue] of Object.entries(headers)) {
          response.headers.set(header, headerValue);
        }
      },
    },
  });

  // Do not remove: this call is what refreshes the session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/account";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: return this exact response object. Building a fresh
  // NextResponse here would drop the refreshed auth cookies set above.
  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files. Note /reset-password is
     * deliberately NOT in AUTH_ONLY_PREFIXES — the recovery link signs the user
     * in first, so they arrive there already authenticated.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|woff2?)$).*)",
  ],
};
