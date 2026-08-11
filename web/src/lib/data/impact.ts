import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Shown only if Supabase can't be reached. Zero, deliberately: the counter is a
 * public claim, so an unreachable database must never make it invent trees.
 */
export const FALLBACK_GLOBAL_TREES = 0;

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  trees_contributed: number;
};

export type MyImpact = {
  trees_contributed: number;
  orders_count: number;
  products_count: number;
};

export type ContributingOrder = {
  id: string;
  status: string;
  total_cents: number;
  trees_total: number;
  paid_at: string | null;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price_cents: number;
    trees_per_unit: number;
    products: { name: string; slug: string; image_url: string | null } | null;
  }[];
};

/**
 * Community-wide tree count (baseline + every paid order).
 * Backed by a security-definer RPC, so anonymous visitors can read the headline
 * number without gaining access to anyone's orders.
 */
export async function getGlobalTrees(): Promise<number> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("global_trees_planted");
    if (error || typeof data !== "number") return FALLBACK_GLOBAL_TREES;
    return data;
  } catch {
    // Supabase not configured yet — keep the page rendering.
    return FALLBACK_GLOBAL_TREES;
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, trees_contributed")
    .eq("id", userId)
    .maybeSingle();

  return (data as Profile) ?? null;
}

/** Trees, order count and item count for the signed-in user, in one round trip. */
export async function getMyImpact(): Promise<MyImpact> {
  const empty: MyImpact = { trees_contributed: 0, orders_count: 0, products_count: 0 };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("my_impact");
    if (error) return empty;
    // The RPC returns a single-row table.
    const row = Array.isArray(data) ? data[0] : data;
    return (row as MyImpact) ?? empty;
  } catch {
    return empty;
  }
}

/**
 * The user's counted orders with their line items, so the account page can show
 * which product contributed how many trees. RLS scopes this to the caller.
 */
export async function getContributingOrders(): Promise<ContributingOrder[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `id, status, total_cents, trees_total, paid_at, created_at,
         order_items ( id, quantity, unit_price_cents, trees_per_unit,
           products ( name, slug, image_url ) )`
      )
      .in("status", ["paid", "fulfilled"])
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []) as unknown as ContributingOrder[];
  } catch {
    return [];
  }
}

export function formatMoney(cents: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
