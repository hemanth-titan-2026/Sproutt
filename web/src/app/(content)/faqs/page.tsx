import Link from "next/link";
import type { Metadata } from "next";
import { ChevronDown, HelpCircle } from "lucide-react";

import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "FAQs | Sproutt",
  description:
    "How Sproutt's tree contributions work, plus answers on accounts, orders and privacy.",
};

type Faq = { q: string; a: React.ReactNode };

const FAQ_GROUPS: { title: string; items: Faq[] }[] = [
  {
    title: "Trees & contributions",
    items: [
      {
        q: "How many trees does a product fund?",
        a: (
          <p>
            It depends on the product — each one carries its own count, shown on
            the product before you buy. A seed kit funds ten trees; a tote funds
            two. The number isn&apos;t a percentage of the price, it&apos;s set
            per product.
          </p>
        ),
      },
      {
        q: "When are the trees added to my total?",
        a: (
          <p>
            When your order is paid. Orders sitting in your cart or awaiting
            payment don&apos;t count toward your total — only completed ones do.
            If an order is later refunded, the trees come back off your total.
          </p>
        ),
      },
      {
        q: "If you change a product's tree count, does my past order change?",
        a: (
          <p>
            No. The count is recorded with your order at the moment of purchase.
            Later changes apply to future orders only, so the figure on your
            account can&apos;t be revised after the fact.
          </p>
        ),
      },
      {
        q: "Where do I see my contribution?",
        a: (
          <p>
            In the top-right corner of the site once you&apos;re signed in, and
            in full on <Link href="/account">your forest page</Link> — broken
            down by order and by product.
          </p>
        ),
      },
      {
        q: "Are the trees planted immediately?",
        a: (
          <p>
            No. Funding and planting are separate steps. Your order funds a
            specific number of trees straight away; planting happens in batches
            with our partners. We&apos;re still building out per-batch reporting,
            and we&apos;d rather say so than imply a precision we don&apos;t have
            yet.
          </p>
        ),
      },
    ],
  },
  {
    title: "Accounts & signing in",
    items: [
      {
        q: "Do I need an account to buy?",
        a: (
          <p>
            You need one to have your contribution tracked — the tree count is
            attached to your account, so there&apos;s nowhere to record it
            otherwise.
          </p>
        ),
      },
      {
        q: "I signed up but never got the confirmation email.",
        a: (
          <p>
            Check your spam folder first. If it&apos;s not there, wait a few
            minutes and try signing up again — the link is re-sent. Still
            nothing? <Link href="/help">Contact us</Link> and we&apos;ll sort it
            out.
          </p>
        ),
      },
      {
        q: "I forgot my password.",
        a: (
          <p>
            Use <Link href="/forgot-password">the reset page</Link>. We&apos;ll
            email you a link that works once and expires after an hour. For
            security we send the same confirmation whether or not an account
            exists for that address.
          </p>
        ),
      },
      {
        q: "I signed up with Google — do I have a password?",
        a: (
          <p>
            No. Google handles your sign-in, so there&apos;s no Sproutt password
            to reset. Just use <strong>Continue with Google</strong> each time.
          </p>
        ),
      },
      {
        q: "Can I change my name or profile picture?",
        a: (
          <p>
            Yes — those are yours to edit. Your tree count isn&apos;t editable by
            anyone, including you: it&apos;s calculated from your paid orders, so
            the number always reflects real purchases.
          </p>
        ),
      },
    ],
  },
  {
    title: "Orders & payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: (
          <p>
            Checkout isn&apos;t live yet. When it is, we&apos;ll list the
            accepted methods here and at checkout before you pay.
          </p>
        ),
      },
      {
        q: "What's your refund policy?",
        a: (
          <p>
            See <Link href="/terms">our Terms</Link> for the full position.
            Practically: if an order is refunded, the trees it funded are removed
            from your total, since the contribution was tied to that purchase.
          </p>
        ),
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        q: "What data do you keep about me?",
        a: (
          <p>
            Your name, email, profile picture if you signed in with Google, and
            your orders. That&apos;s it — we don&apos;t sell it or use it for
            advertising. The detail is in{" "}
            <Link href="/privacy">our Privacy Policy</Link>.
          </p>
        ),
      },
      {
        q: "Can I delete my account?",
        a: (
          <p>
            Yes. <Link href="/help">Ask us</Link> and we&apos;ll delete your
            account and personal data. Deleting removes your profile and order
            history, which also removes your contribution total.
          </p>
        ),
      },
    ],
  },
];

export default function FaqsPage() {
  return (
    <>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>
          <HelpCircle size={14} aria-hidden="true" /> FAQs
        </span>
        <h1 className={styles.title}>Questions, answered</h1>
        <p className={styles.lede}>
          Mostly about how the tree counting works — that&apos;s the part people
          ask about, and the part worth being precise on.
        </p>
      </section>

      <main className={styles.body}>
        {FAQ_GROUPS.map((group) => (
          <section key={group.title} className={styles.faqGroup}>
            <h2 className={styles.faqGroupTitle}>{group.title}</h2>

            {group.items.map((item) => (
              /* Native <details>: keyboard-accessible and works without JS,
                 so no client bundle for an accordion. */
              <details key={item.q} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>
                  {item.q}
                  <ChevronDown
                    size={18}
                    className={styles.faqChevron}
                    aria-hidden="true"
                  />
                </summary>
                <div className={styles.faqAnswer}>{item.a}</div>
              </details>
            ))}
          </section>
        ))}

        <div className={styles.prose}>
          <p>
            Didn&apos;t find it? <Link href="/help">Get in touch</Link> — real
            answers, not a bot.
          </p>
        </div>
      </main>
    </>
  );
}
