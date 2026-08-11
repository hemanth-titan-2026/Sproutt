import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Email link landing point — handles both signup confirmation and password
 * recovery. Supabase appends `token_hash` and `type` to the link we set as
 * `emailRedirectTo` / `redirectTo`.
 *
 * For recovery this verification is what creates the short-lived session that
 * lets /reset-password accept a new password.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/account";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("That link is invalid or incomplete.")}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    const target = type === "recovery" ? "/forgot-password" : "/login";
    return NextResponse.redirect(
      `${origin}${target}?error=${encodeURIComponent(
        "That link has expired or was already used. Request a new one."
      )}`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
