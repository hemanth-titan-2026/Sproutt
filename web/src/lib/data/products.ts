import "server-only";

import { createClient } from "@/lib/supabase/server";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  currency: string;
  trees_per_unit: number;
};

const PRODUCT_FIELDS =
  "id, slug, name, description, image_url, price_cents, currency, trees_per_unit";

/** Active products, cheapest first. Readable by anyone — RLS allows it. */
export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("is_active", true)
      .order("price_cents", { ascending: true });

    if (error) return [];
    return (data ?? []) as Product[];
  } catch {
    // Supabase not configured — let the page render an empty shop rather than 500.
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    return (data as Product) ?? null;
  } catch {
    return null;
  }
}
