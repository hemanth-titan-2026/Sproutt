import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";
import { supabasePublicKey, supabaseUrl } from "./env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Must be created per-request (never hoisted to a module-level singleton) —
 * it closes over this request's cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabasePublicKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't write cookies. Harmless here: proxy.ts
          // refreshes the session on every request, so the cookies are already
          // up to date by the time rendering starts.
        }
      },
    },
  });
}

/**
 * The current user, verified against Supabase Auth.
 *
 * Always use this rather than `getSession()` on the server — `getSession()`
 * trusts the cookie as-is, while `getUser()` revalidates it with the auth
 * server, so a tampered cookie can't impersonate someone.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
