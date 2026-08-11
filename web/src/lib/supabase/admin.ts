import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { supabaseUrl } from "./env";

/**
 * Service-role client. Bypasses Row Level Security entirely.
 *
 * Use it ONLY in trusted server code — the payment webhook that flips an order
 * to 'paid' (and therefore mints tree contributions), admin scripts, and the
 * like. Never import this into a Client Component: the key must never reach the
 * browser. The `server-only` import above turns a mistake into a build error.
 */
export function createAdminClient() {
  const key =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY). See web/.env.local.example."
    );
  }

  return createClient<Database>(supabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
