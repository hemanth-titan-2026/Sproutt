import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Clock, PartyPopper, Sprout, TreeDeciduous } from "lucide-react";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/data/impact";
import { cancelOrder } from "@/app/actions/orders";
import content from "../../content.module.css";
import styles from "../../products/products.module.css";

export const metadata: Metadata = {
  title: "Order | Sproutt",
};

type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  trees_total: number;
  created_at: string;
  paid_at: string | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price_cents: number;
    trees_per_unit: number;
    products: { name: string; slug: string } | null;
  }[];
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);

  const supabase = await createClient();
  // RLS scopes this to the caller's own orders, so someone else's order id
  // returns nothing rather than someone else's receipt.
  const { data } = await supabase
    .from("orders")
    .select(
      `id, status, total_cents, trees_total, created_at, paid_at,
       order_items ( id, quantity, unit_price_cents, trees_per_unit,
         products ( name, slug ) )`
    )
    .eq("id", id)
    .maybeSingle();

  const order = data as unknown as OrderRow | null;
  if (!order) notFound();

  const isPaid = order.status === "paid" || order.status === "fulfilled";
  const placedOn = new Date(order.paid_at ?? order.created_at);

  return (
    <main className={`${styles.wrap} ${styles.wrapTop}`}>
      <div className={styles.receipt}>
        <div className={styles.receiptHero}>
          {isPaid ? (
            <>
              <PartyPopper size={34} className={styles.receiptIcon} aria-hidden="true" />
              <h1 className={styles.receiptTitle}>Your order is in</h1>
              <p className={styles.receiptSub}>
                Thank you — your forest just got bigger.
              </p>
            </>
          ) : (
            <>
              <Clock size={34} className={styles.receiptIcon} aria-hidden="true" />
              <h1 className={styles.receiptTitle}>Order awaiting payment</h1>
              <p className={styles.receiptSub}>
                We&apos;ve reserved your order. Trees are credited once payment
                completes.
              </p>
            </>
          )}
        </div>

        {isPaid && (
          <div className={styles.treesWon}>
            <div className={styles.treesWonNumber}>
              {order.trees_total.toLocaleString()}
            </div>
            <div className={styles.treesWonLabel}>
              {order.trees_total === 1 ? "tree funded" : "trees funded"} by this
              order
            </div>
          </div>
        )}

        <div className={styles.receiptBox}>
          <div className={styles.receiptRow}>
            <span className={styles.receiptKey}>Order</span>
            <span className={styles.receiptVal}>#{order.id.slice(0, 8)}</span>
          </div>
          <div className={styles.receiptRow}>
            <span className={styles.receiptKey}>Placed</span>
            <span className={styles.receiptVal}>
              {placedOn.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className={styles.receiptRow}>
            <span className={styles.receiptKey}>Status</span>
            <span className={styles.receiptVal} style={{ textTransform: "capitalize" }}>
              {order.status}
            </span>
          </div>

          {order.order_items.map((item) => (
            <div key={item.id} className={styles.receiptRow}>
              <span className={styles.receiptKey}>
                {item.products?.name ?? "Product"} × {item.quantity}
              </span>
              <span className={styles.receiptVal}>
                {formatMoney(item.unit_price_cents * item.quantity)}
                {" · "}
                {item.trees_per_unit * item.quantity}{" "}
                {item.trees_per_unit * item.quantity === 1 ? "tree" : "trees"}
              </span>
            </div>
          ))}

          <div className={styles.receiptRow}>
            <span className={styles.receiptKey}>Total</span>
            <span className={styles.receiptVal}>
              {formatMoney(order.total_cents)}
            </span>
          </div>
        </div>

        {!isPaid && (
          <div className={`${content.callout} ${content.calloutWarn}`} style={{ marginTop: 22 }}>
            <Clock size={18} className={content.calloutIcon} aria-hidden="true" />
            <span>
              Checkout isn&apos;t connected to a payment provider yet, so this
              order can&apos;t be paid from the site. It contributes no trees
              until it is.
            </span>
          </div>
        )}

        <div className={styles.receiptActions}>
          <Link href="/account" className={styles.primaryBtn}>
            <Sprout size={16} aria-hidden="true" /> View my forest
          </Link>
          <Link href="/products" className={styles.ghostBtn}>
            <TreeDeciduous size={16} aria-hidden="true" /> Keep shopping
          </Link>
          {!isPaid && (
            <form action={cancelOrder}>
              <input type="hidden" name="orderId" value={order.id} />
              <button type="submit" className={styles.ghostBtn}>
                Cancel order
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
