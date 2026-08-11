/**
 * Supabase environment resolution.
 *
 * Supabase is mid-migration on key naming: older projects issue `anon` /
 * `service_role` JWTs, newer ones issue `sb_publishable_...` / `sb_secret_...`.
 * Both work with the same client, so we accept either name and fail loudly if
 * neither is present.
 */

export function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Copy web/.env.local.example to web/.env.local and fill it in."
    );
  }
  return url;
}

/** Public, browser-safe key. Row Level Security is what protects your data. */
export function supabasePublicKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY). See web/.env.local.example."
    );
  }
  return key;
}
