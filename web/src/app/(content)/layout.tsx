import Link from "next/link";

import { Footer } from "@/components/Footer";
import styles from "./content.module.css";

/**
 * Shell for the info and legal pages. Sticky brand header, centred prose
 * column, and the same footer as the landing page so these pages don't feel
 * like a dead end.
 */
export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" aria-label="Sproutt home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sproutt-logo-2.png" alt="Sproutt" className={styles.headerLogo} />
        </Link>

        <nav className={styles.headerNav}>
          <Link href="/products" className={styles.headerLink}>
            Shop
          </Link>
          <Link href="/about" className={styles.headerLink}>
            About
          </Link>
          <Link href="/faqs" className={styles.headerLink}>
            FAQs
          </Link>
          <Link href="/help" className={styles.headerLink}>
            Help
          </Link>
          <Link href="/account" className={styles.headerLink}>
            My forest
          </Link>
        </nav>
      </header>

      {children}

      <Footer />
    </div>
  );
}
