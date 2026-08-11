import Link from "next/link";
import type { Metadata } from "next";
import { ShoppingBag, TreeDeciduous } from "lucide-react";

import { getProducts } from "@/lib/data/products";
import { formatMoney } from "@/lib/data/impact";
import content from "../content.module.css";
import styles from "./products.module.css";

export const metadata: Metadata = {
  title: "Shop | Sproutt",
  description: "Every Sproutt product funds a set number of real trees.",
};

function ProductArt({
  imageUrl,
  trees,
}: {
  imageUrl: string | null;
  trees: number;
}) {
  return (
    <div className={styles.art}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className={styles.artPhoto} />
      ) : (
        <div className={styles.artMark} aria-hidden="true" />
      )}
      <span className={`${styles.treeTag} ${styles.treeTagOnArt}`}>
        <TreeDeciduous size={14} aria-hidden="true" />
        {trees} {trees === 1 ? "tree" : "trees"}
      </span>
    </div>
  );
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <section className={content.hero}>
        <span className={content.eyebrow}>
          <ShoppingBag size={14} aria-hidden="true" /> Shop
        </span>
        <h1 className={content.title}>Buy one thing, plant one tree</h1>
        <p className={content.lede}>
          Every product carries its own tree count, shown before you buy. When
          your order is paid, those trees are added to your total.
        </p>
      </section>

      <main className={styles.wrap}>
        {products.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>Nothing in the shop yet</h2>
            <p className={styles.emptyText}>
              No active products found. If you were expecting some, check that
              the migration in{" "}
              <code>supabase/migrations/0003_notebook_product.sql</code> has been
              run.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className={styles.card}
              >
                <ProductArt
                  imageUrl={product.image_url}
                  trees={product.trees_per_unit}
                />
                <div className={styles.cardBody}>
                  <h2 className={styles.cardName}>{product.name}</h2>
                  <p className={styles.cardDesc}>{product.description}</p>
                  <div className={styles.cardFoot}>
                    <span className={styles.price}>
                      {formatMoney(product.price_cents, product.currency)}
                    </span>
                    <span className={styles.treeTag}>
                      <TreeDeciduous size={14} aria-hidden="true" />
                      {product.trees_per_unit}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
