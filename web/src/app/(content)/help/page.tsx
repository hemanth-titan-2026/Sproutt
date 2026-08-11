import Link from "next/link";
import type { Metadata } from "next";
import {
  KeyRound,
  LifeBuoy,
  Mail,
  MessageCircleQuestion,
  Sprout,
  UserPlus,
} from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Help | Sproutt",
  description: "Get help with your Sproutt account, orders and tree contributions.",
};

const QUICK_LINKS = [
  {
    href: "/faqs",
    icon: MessageCircleQuestion,
    title: "Read the FAQs",
    text: "How tree counts work, when they're credited, and what happens on a refund.",
  },
  {
    href: "/forgot-password",
    icon: KeyRound,
    title: "Reset your password",
    text: "We'll email you a link. It works once and expires after an hour.",
  },
  {
    href: "/account",
    icon: Sprout,
    title: "Check your forest",
    text: "Your contribution total, broken down by order and by product.",
  },
  {
    href: "/signup",
    icon: UserPlus,
    title: "Create an account",
    text: "Needed to have your tree contributions tracked against your orders.",
  },
];

export default function HelpPage() {
  return (
    <>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>
          <LifeBuoy size={14} aria-hidden="true" /> Help
        </span>
        <h1 className={styles.title}>How can we help?</h1>
        <p className={styles.lede}>
          Most things are answered below or in the FAQs. If not, email us —
          a person reads it.
        </p>
      </section>

      <main className={styles.body}>
        <div className={styles.cardGrid}>
          {QUICK_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.card}>
              <item.icon size={22} className={styles.cardIcon} aria-hidden="true" />
              <div className={styles.cardTitle}>{item.title}</div>
              <p className={styles.cardText}>{item.text}</p>
            </Link>
          ))}
        </div>

        <div className={styles.prose}>
          <h2>Common problems</h2>

          <h3>I never got my confirmation email</h3>
          <p>
            Check your spam folder first — that&apos;s where it usually is. If
            it&apos;s genuinely missing, try signing up again with the same
            address; the link gets re-sent. Still stuck? Email us and we&apos;ll
            confirm your account manually.
          </p>

          <h3>My reset link says it&apos;s expired</h3>
          <p>
            Reset links work once and expire an hour after they&apos;re sent —
            including if you&apos;ve already opened one. Just{" "}
            <Link href="/forgot-password">request a new one</Link>.
          </p>

          <h3>I signed in with Google and there&apos;s no password</h3>
          <p>
            That&apos;s expected. Google handles your sign-in, so there&apos;s no
            Sproutt password to reset — use <strong>Continue with Google</strong>{" "}
            each time.
          </p>

          <h3>My tree count looks wrong</h3>
          <p>
            Your total is calculated from paid orders only. Orders that
            haven&apos;t been paid yet don&apos;t count, and refunded orders have
            their trees removed. If it still looks wrong after checking{" "}
            <Link href="/account">your breakdown</Link>, email us with your order
            reference and we&apos;ll investigate.
          </p>

          <h3>I want my account deleted</h3>
          <p>
            Email us from the address on the account and we&apos;ll delete it,
            along with your profile and order history. That also removes your
            contribution total — see <Link href="/privacy">our Privacy Policy</Link>.
          </p>

          <h2>Contact us</h2>
          <p>
            Email is the fastest route. Include your account email and, if
            it&apos;s about an order, the order reference from your account page.
          </p>
          <div className={styles.contactRow}>
            <a
              href={`mailto:${siteConfig.email.support}`}
              className={styles.contactPill}
            >
              <Mail size={15} aria-hidden="true" /> {siteConfig.email.support}
            </a>
          </div>

          <h2>Related</h2>
          <p>
            <Link href="/about">About Sproutt</Link> ·{" "}
            <Link href="/faqs">FAQs</Link> ·{" "}
            <Link href="/privacy">Privacy Policy</Link> ·{" "}
            <Link href="/terms">Terms of Service</Link>
          </p>
        </div>
      </main>
    </>
  );
}
