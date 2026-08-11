import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, Scale } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | Sproutt",
  description: "The terms you agree to when using Sproutt.",
};

export default function TermsPage() {
  return (
    <>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>
          <Scale size={14} aria-hidden="true" /> Legal
        </span>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lede}>
          The agreement between you and Sproutt. We&apos;ve kept it in plain
          language — vague terms protect nobody.
        </p>
        <span className={styles.updated}>
          Last updated: {siteConfig.legalLastUpdated}
        </span>
      </section>

      <main className={styles.body}>
        <div className={styles.callout + " " + styles.calloutWarn}>
          <AlertTriangle size={18} className={styles.calloutIcon} aria-hidden="true" />
          <span>
            <strong>Draft — needs legal review before launch.</strong> Written by
            your developer, not a lawyer. Consumer protection, refund and
            liability rules vary by jurisdiction and often override what a
            website&apos;s terms say. Have a qualified advisor review this, and
            fill in the company details in <code>src/lib/site-config.ts</code>,
            before you publish.
          </span>
        </div>

        <div className={styles.prose}>
          <h2>1. Who these terms are with</h2>
          <p>
            These terms are between you and {siteConfig.legalName}, registered at{" "}
            {siteConfig.address}. By using this site or creating an account, you
            agree to them. If you don&apos;t, please don&apos;t use the site.
          </p>

          <h2>2. Your account</h2>
          <ul>
            <li>
              You must give accurate information when you sign up, and keep your
              password to yourself.
            </li>
            <li>
              You&apos;re responsible for activity under your account. Tell us
              promptly if you think someone else has access.
            </li>
            <li>
              You must be old enough to enter a contract where you live, and at
              least 13.
            </li>
            <li>
              We may suspend or close an account that&apos;s being used to break
              these terms, defraud us, or attack the service.
            </li>
          </ul>

          <h2>3. Orders</h2>
          <p>
            An order isn&apos;t accepted until we confirm it. If a product is
            listed at the wrong price or is unavailable, we may decline the order
            and refund you in full — we&apos;ll tell you if that happens.
          </p>
          <p>
            Prices include applicable taxes unless stated otherwise at checkout.
          </p>

          <h2>4. The tree commitment</h2>
          <p>
            This is the part that makes Sproutt what it is, so we want to be
            exact about what we&apos;re promising.
          </p>
          <ul>
            <li>
              Each product displays the number of trees it funds. When your order
              is paid, that number is added to your contribution total.
            </li>
            <li>
              The count is <strong>fixed at the time of purchase</strong>. If we
              later change a product&apos;s tree count, your completed orders keep
              the number they were bought at.
            </li>
            <li>
              <strong>Funding and planting are separate.</strong> Your purchase
              funds a specific number of trees. Planting happens in batches with
              our partners, on their schedules and subject to season, site and
              weather. We do not promise a planting date for an individual order.
            </li>
            <li>
              If an order is cancelled or refunded, its trees are removed from
              your total, because the contribution was tied to that purchase.
            </li>
            <li>
              Your contribution total reflects funded trees. It is not a claim
              about carbon offset, and we don&apos;t market it as a certified
              offset.
            </li>
          </ul>

          <h2>5. Cancellations and refunds</h2>
          <p>
            You may have a statutory right to cancel and be refunded, which these
            terms don&apos;t take away. Where such a right applies, it stands
            regardless of anything else on this page.
          </p>
          <p>
            To request a refund, contact us at{" "}
            <a href={`mailto:${siteConfig.email.support}`}>
              {siteConfig.email.support}
            </a>
            . Refunded orders have their trees removed from your total, as above.
          </p>

          <h2>6. Acceptable use</h2>
          <p>Please don&apos;t:</p>
          <ul>
            <li>Try to break, overload, or gain unauthorised access to the service</li>
            <li>Attempt to alter your own or anyone else&apos;s contribution total</li>
            <li>Scrape or copy the site&apos;s content for a competing service</li>
            <li>Use the site to break the law or infringe someone&apos;s rights</li>
          </ul>

          <h2>7. Our content</h2>
          <p>
            The Sproutt name, logo, site design, text and images belong to us or
            our licensors. You may not reuse them commercially without our
            written permission. You keep ownership of anything you submit, and
            grant us permission to use it as needed to operate the service.
          </p>

          <h2>8. Availability</h2>
          <p>
            We aim to keep the site running, but we don&apos;t guarantee
            uninterrupted access. We may change, suspend or discontinue features
            — including this site — and we&apos;ll give reasonable notice where a
            change materially affects you.
          </p>

          <h2>9. Liability</h2>
          <p>
            Nothing here limits our liability for death or personal injury caused
            by our negligence, for fraud, or for anything else that can&apos;t be
            limited by law.
          </p>
          <p>
            Subject to that, we aren&apos;t liable for indirect or consequential
            losses, and our total liability relating to an order is limited to
            the amount you paid for it.
          </p>

          <h2>10. Changes to these terms</h2>
          <p>
            We may update these terms. The date at the top shows the last
            substantive change. If a change materially affects your rights,
            we&apos;ll tell you by email. Continuing to use the site after a
            change means you accept it.
          </p>

          <h2>11. Governing law</h2>
          <p>
            These terms are governed by the laws of {siteConfig.jurisdiction},
            and its courts have jurisdiction over any dispute — without removing
            any consumer protection you have where you live.
          </p>

          <h2>12. Contact</h2>
          <p>
            Legal enquiries:{" "}
            <a href={`mailto:${siteConfig.email.legal}`}>
              {siteConfig.email.legal}
            </a>
            . For everything else, see <Link href="/help">our help page</Link> or
            read <Link href="/privacy">our Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
