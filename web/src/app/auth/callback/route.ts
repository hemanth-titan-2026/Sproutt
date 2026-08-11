import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth (Google) landing point.
 *
 * Google sends the browser here with a one-time `code`; we swap it for a
 * session, which writes the auth cookies via the server client.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/account";

  // Reject absolute or protocol-relative targets — otherwise this endpoint
  // becomes an open redirect that a phishing link could bounce through.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  // The user cancelled the Google consent screen, or Google rejected it.
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Sign-in link was incomplete. Try again.")}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Could not complete sign-in. Try again.")}`
    );
  }

  // Behind a proxy the public host differs from `origin`; prefer the forwarded
  // host so we don't redirect the user to an internal address.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = isLocal || !forwardedHost ? origin : `https://${forwardedHost}`;

  return NextResponse.redirect(`${base}${next}`);
}
