import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Leaf, Recycle, TreeDeciduous, Truck } from "lucide-react";

import { getProductBySlug } from "@/lib/data/products";
import { formatMoney } from "@/lib/data/impact";
import { getCurrentUser } from "@/lib/supabase/server";
import { BuyForm } from "@/components/shop/BuyForm";
import styles from "../products.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product not found | Sproutt" };

  return {
    title: `${product.name} | Sproutt`,
    description:
      product.description ??
      `${product.name} — funds ${product.trees_per_unit} tree(s) with every purchase.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, user] = await Promise.all([
    getProductBySlug(slug),
    getCurrentUser(),
  ]);

  if (!product) notFound();

  return (
    <main className={`${styles.wrap} ${styles.wrapTop}`}>
      <Link href="/products" className={styles.backLink}>
        <ArrowLeft size={15} /> Back to shop
      </Link>

      <div className={styles.detail}>
        <div className={`${styles.art} ${styles.artLarge}`}>
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt="" className={styles.artPhoto} />
          ) : (
            <div className={styles.artMark} aria-hidden="true" />
          )}
          <span className={`${styles.treeTag} ${styles.treeTagOnArt}`}>
            <TreeDeciduous size={14} aria-hidden="true" />
            Plants {product.trees_per_unit}{" "}
            {product.trees_per_unit === 1 ? "tree" : "trees"}
          </span>
        </div>

        <div>
          <h1 className={styles.detailName}>{product.name}</h1>

          <div className={styles.detailPrice}>
            {formatMoney(product.price_cents, product.currency)}
          </div>
          <div className={styles.detailPriceNote}>
            Inclusive of taxes. Shipping calculated at checkout.
          </div>

          <p className={styles.detailDesc}>{product.description}</p>

          <ul className={styles.specs}>
            <li className={styles.spec}>
              <TreeDeciduous size={16} className={styles.specIcon} aria-hidden="true" />
              <span>
                Funds <strong>{product.trees_per_unit}</strong>{" "}
                {product.trees_per_unit === 1 ? "tree" : "trees"} per unit. The
                count is locked in when you buy, so it can&apos;t be revised later.
              </span>
            </li>
            <li className={styles.spec}>
              <Recycle size={16} className={styles.specIcon} aria-hidden="true" />
              <span>Made from recycled materials, with plant-based inks.</span>
            </li>
            <li className={styles.spec}>
              <Leaf size={16} className={styles.specIcon} aria-hidden="true" />
              <span>
                Trees are added to <Link href="/account">your forest</Link> as
                soon as the order is paid.
              </span>
            </li>
            <li className={styles.spec}>
              <Truck size={16} className={styles.specIcon} aria-hidden="true" />
              <span>Plastic-free packaging. Shipped within 3–5 working days.</span>
            </li>
          </ul>

          <BuyForm slug={product.slug} treesPerUnit={product.trees_per_unit} />

          {!user && (
            <p className={styles.signedOutNote}>
              You&apos;ll be asked to <Link href={`/login?next=/products/${product.slug}`}>sign in</Link>{" "}
              first — your trees need an account to be credited to.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
