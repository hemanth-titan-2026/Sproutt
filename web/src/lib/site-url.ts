import "server-only";

import { headers } from "next/headers";

/**
 * Absolute origin for this deployment, used to build email confirmation and
 * password reset links.
 *
 * Prefers NEXT_PUBLIC_SITE_URL. Falls back to the forwarded host so preview
 * deployments still produce working links. Whatever this resolves to must be
 * listed under Supabase -> Authentication -> URL Configuration -> Redirect URLs,
 * otherwise Supabase silently rewrites the link to the Site URL.
 */
export async function getSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}
