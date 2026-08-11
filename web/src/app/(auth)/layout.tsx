import Link from "next/link";
import { Leaf } from "lucide-react";

import { getGlobalTrees } from "@/lib/data/impact";
import styles from "@/components/auth/auth.module.css";

/**
 * Shared shell for the auth routes: brand panel on the left, form on the right.
 * The tree count is read live so the number a visitor sees while signing up
 * matches the one on the landing page.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trees = await getGlobalTrees();

  return (
    <div className={styles.shell}>
      <aside className={styles.aside}>
        <div className={styles.asideGlow} aria-hidden="true" />

        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sproutt-logo-2.png" alt="Sproutt" className={styles.asideLogo} />
        </Link>

        <div className={styles.asideBody}>
          <span className={styles.asideKicker}>
            <Leaf size={14} aria-hidden="true" /> Gen Z for Gen Alpha
          </span>
          <h2 className={styles.asideTitle}>
            Every order you place <em>plants real trees.</em>
          </h2>
          <p className={styles.asideText}>
            Create an account to track your own forest — we&apos;ll show you exactly
            how many trees your purchases have funded.
          </p>
        </div>

        <div className={styles.asideStats}>
          <div className={styles.asideStat}>
            <span className={styles.asideStatValue}>{trees.toLocaleString()}</span>
            <span className={styles.asideStatLabel}>Trees funded</span>
          </div>
          <div className={styles.asideStat}>
            <span className={styles.asideStatValue}>100%</span>
            <span className={styles.asideStatLabel}>Traceable</span>
          </div>
        </div>
      </aside>

      <main className={styles.panel}>
        <div className={styles.card}>{children}</div>
      </main>
    </div>
  );
}
