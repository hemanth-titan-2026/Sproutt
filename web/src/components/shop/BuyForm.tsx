"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, ShoppingBag } from "lucide-react";

import { purchase, type PurchaseState } from "@/app/actions/orders";
import styles from "@/app/(content)/products/products.module.css";

function BuyButton({ trees }: { trees: number }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.buyBtn} disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={17} className="animate-spin" aria-hidden="true" />
          Placing your order…
        </>
      ) : (
        <>
          <ShoppingBag size={17} aria-hidden="true" />
          Buy now · plants {trees} {trees === 1 ? "tree" : "trees"}
        </>
      )}
    </button>
  );
}

/**
 * Quantity + buy control.
 *
 * Only the slug and quantity are submitted. Price and tree count are read from
 * the database server-side and snapshotted by a trigger, so nothing the browser
 * sends can influence what an order costs or what it contributes.
 */
export function BuyForm({
  slug,
  treesPerUnit,
  maxQuantity = 10,
}: {
  slug: string;
  treesPerUnit: number;
  maxQuantity?: number;
}) {
  const [state, formAction] = useActionState<PurchaseState, FormData>(
    purchase,
    undefined
  );
  const [quantity, setQuantity] = useState(1);
  const qtyId = useId();

  return (
    <>
      {state?.error && (
        <p className={styles.errorNote} role="alert">
          <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
          {state.error}
        </p>
      )}

      <form action={formAction}>
        <input type="hidden" name="slug" value={slug} />

        <div className={styles.buyRow}>
          <div className={styles.qtyGroup}>
            <label className={styles.qtyLabel} htmlFor={qtyId}>
              Qty
            </label>
            <select
              id={qtyId}
              name="quantity"
              className={styles.qtySelect}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <BuyButton trees={treesPerUnit * quantity} />
        </div>
      </form>
    </>
  );
}
