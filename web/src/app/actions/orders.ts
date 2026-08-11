"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Purchase flow.
 *
 * The security model, because it's the whole point of the schema:
 *
 *   - A signed-in user may create their OWN order, and only as 'pending'.
 *     Row Level Security enforces both.
 *   - A user may NOT update an order's status. There is no RLS update policy
 *     on `orders`, so a crafted request cannot flip an order to 'paid' and
 *     mint tree contributions out of nothing.
 *   - Line item prices and tree counts are snapshotted server-side by a
 *     database trigger, read from the products table. Whatever the client
 *     sends for those fields is discarded.
 *
 * Marking an order paid is therefore privileged. Today that's done by
 * `settleWithTestCheckout` below, which is a STAND-IN for a real payment
 * provider and is disabled unless you explicitly opt in. See the comment there.
 */

const purchaseSchema = z.object({
  slug: z.string().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(10),
});

export type PurchaseState = { error?: string } | undefined;

/** True only when the developer has explicitly opted into fake payments. */
function testCheckoutEnabled() {
  return process.env.SPROUTT_ALLOW_TEST_CHECKOUT === "true";
}

/**
 * Completes an order without taking payment.
 *
 * This is the intended checkout for now — Sproutt has no payment provider yet,
 * by choice. Clicking "Buy now" creates the order and marks it paid, which
 * credits the trees.
 *
 * ⚠️ Understand the trade-off before enabling this on a public site: orders
 * complete for free, so anyone can award themselves trees and inflate the
 * public counter. It stays behind SPROUTT_ALLOW_TEST_CHECKOUT so that turning
 * it on is always a deliberate act, never a default.
 *
 * When you do add Razorpay/Stripe: delete this function and move the same
 * status update into a route handler that first verifies the provider's webhook
 * signature. Nothing else in the flow needs to change — the database triggers
 * do the tree accounting either way.
 */
async function settleWithTestCheckout(orderId: string, userId: string) {
  const admin = createAdminClient();

  // Re-check ownership and status with the privileged client. The caller
  // already owns this order, but a privileged write should never trust that
  // from its caller.
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.user_id !== userId || order.status !== "pending") {
    return;
  }

  await admin.from("orders").update({ status: "paid" }).eq("id", orderId);
}

export async function purchase(
  _prevState: PurchaseState,
  formData: FormData
): Promise<PurchaseState> {
  const parsed = purchaseSchema.safeParse({
    slug: formData.get("slug"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    return { error: "That doesn't look like a valid order. Try again." };
  }

  const { slug, quantity } = parsed.data;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/products/${slug}`)}`);
  }

  const supabase = await createClient();

  // Look the product up server-side. The client sends a slug, never a price or
  // a tree count.
  const { data: product } = await supabase
    .from("products")
    .select("id, name, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) {
    return { error: "That product isn't available right now." };
  }

  // 1. Create the order. RLS pins user_id to the caller and status to 'pending'.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, status: "pending" })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "We couldn't start your order. Please try again." };
  }

  // 2. Add the line item. The snapshot trigger fills in price and tree count.
  const { error: itemError } = await supabase
    .from("order_items")
    .insert({ order_id: order.id, product_id: product.id, quantity });

  if (itemError) {
    // Don't strand an empty pending order. Deleting a pending order is
    // permitted by RLS; a paid one is not.
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "We couldn't add that item to your order. Please try again." };
  }

  // 3. Settle. With a real provider this is where you'd hand off to their
  //    hosted checkout and let the webhook mark the order paid.
  if (testCheckoutEnabled()) {
    await settleWithTestCheckout(order.id, user.id);
  }

  revalidatePath("/", "layout");
  redirect(`/orders/${order.id}`);
}

/** Discard an unpaid order. */
export async function cancelOrder(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const supabase = await createClient();
  // RLS restricts this to the caller's own pending orders.
  await supabase.from("orders").delete().eq("id", orderId).eq("status", "pending");

  revalidatePath("/", "layout");
  redirect("/products");
}
