import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, KeyRound, LogOut, Sprout, TreeDeciduous } from "lucide-react";

import { getCurrentUser } from "@/lib/supabase/server";
import {
  formatMoney,
  getContributingOrders,
  getMyImpact,
  getProfile,
} from "@/lib/data/impact";
import { signOut } from "@/app/actions/auth";
import styles from "./account.module.css";

export const metadata: Metadata = {
  title: "My forest | Sproutt",
  description: "Track the trees your Sproutt orders have funded.",
};

function initialsOf(name: string | null, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  // proxy.ts already redirects signed-out visitors, but this check is the
  // actual security boundary — never rely on the proxy alone.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const [params, profile, impact, orders] = await Promise.all([
    searchParams,
    getProfile(user.id),
    getMyImpact(),
    getContributingOrders(),
  ]);

  const displayName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Friend";

  const avatarUrl =
    profile?.avatar_url ??
    (user.user_metadata?.avatar_url as string | undefined) ??
    null;

  const trees = impact.trees_contributed;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={15} /> Back to Sproutt
        </Link>

        {params.updated === "password" && (
          <div className={styles.notice} role="status">
            <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Your password was updated. Use it next time you sign in.</span>
          </div>
        )}

        <header className={styles.header}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className={styles.avatar}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className={styles.avatar} aria-hidden="true">
              {initialsOf(displayName, user.email)}
            </span>
          )}

          <div className={styles.identity}>
            <h1 className={styles.name}>{displayName}</h1>
            <p className={styles.email}>{user.email}</p>
          </div>

          <div className={styles.headerActions}>
            <Link href="/forgot-password" className={styles.ghostBtn}>
              <KeyRound size={15} /> Change password
            </Link>
            <form action={signOut}>
              <button type="submit" className={styles.ghostBtn}>
                <LogOut size={15} /> Sign out
              </button>
            </form>
          </div>
        </header>

        <section className={styles.hero}>
          <p className={styles.heroLabel}>Your contribution so far</p>
          <div className={styles.heroValue}>
            <span className={styles.heroNumber}>{trees.toLocaleString()}</span>
            <span className={styles.heroUnit}>
              {trees === 1 ? "tree funded" : "trees funded"}
            </span>
          </div>
          <p className={styles.heroText}>
            {trees > 0
              ? "Every product carries its own tree count, so this number grows with exactly what you buy. We plant in batches with our partners and log each one."
              : "Every product on Sproutt funds a set number of trees. Place your first order and this number starts climbing."}
          </p>

          <div className={styles.heroStats}>
            <div>
              <span className={styles.heroStatValue}>{impact.orders_count}</span>
              <span className={styles.heroStatLabel}>
                {impact.orders_count === 1 ? "Order" : "Orders"}
              </span>
            </div>
            <div>
              <span className={styles.heroStatValue}>{impact.products_count}</span>
              <span className={styles.heroStatLabel}>
                {impact.products_count === 1 ? "Item" : "Items"}
              </span>
            </div>
            <div>
              <span className={styles.heroStatValue}>
                {(trees * 21).toLocaleString()} kg
              </span>
              <span className={styles.heroStatLabel}>CO₂ / year (est.)</span>
            </div>
          </div>
        </section>

        <h2 className={styles.sectionTitle}>Where your trees came from</h2>
        <p className={styles.sectionSub}>
          Each line shows the product, how many you bought, and the trees it
          funded at the time of purchase.
        </p>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <Sprout size={30} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Your forest is waiting</h3>
            <p className={styles.emptyText}>
              You haven&apos;t completed an order yet. Once you do, every product&apos;s
              tree count lands here — itemised, so you can see exactly what you funded.
            </p>
            <Link href="/#products" className={styles.primaryBtn}>
              Browse products <Sprout size={16} />
            </Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map((order) => {
              const placedOn = new Date(order.paid_at ?? order.created_at);
              return (
                <article key={order.id} className={styles.order}>
                  <div className={styles.orderHead}>
                    <div>
                      <div className={styles.orderId}>
                        Order #{order.id.slice(0, 8)}
                        <span className={styles.badge}>{order.status}</span>
                      </div>
                      <div className={styles.orderMeta}>
                        {placedOn.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {formatMoney(order.total_cents)}
                      </div>
                    </div>
                    <span className={styles.orderTrees}>
                      <TreeDeciduous size={15} />
                      {order.trees_total.toLocaleString()}{" "}
                      {order.trees_total === 1 ? "tree" : "trees"}
                    </span>
                  </div>

                  <ul className={styles.items}>
                    {order.order_items.map((item) => (
                      <li key={item.id} className={styles.item}>
                        <span>
                          <span className={styles.itemName}>
                            {item.products?.name ?? "Product"}
                          </span>{" "}
                          <span className={styles.itemQty}>× {item.quantity}</span>
                        </span>
                        <span className={styles.itemTrees}>
                          {(item.quantity * item.trees_per_unit).toLocaleString()} trees
                          <span className={styles.itemMath}>
                            ({item.trees_per_unit} per item)
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
