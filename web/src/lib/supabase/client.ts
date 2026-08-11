"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { supabasePublicKey, supabaseUrl } from "./env";

let cached: SupabaseClient<Database> | undefined;

/**
 * Supabase client for Client Components. Memoised so every component shares one
 * connection and one auth state listener.
 */
export function createClient(): SupabaseClient<Database> {
  cached ??= createBrowserClient<Database>(supabaseUrl(), supabasePublicKey());
  return cached;
}
