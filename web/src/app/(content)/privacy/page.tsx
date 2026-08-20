import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { siteConfig } from "@/lib/site-config";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Sproutt",
  description: "What data Sproutt collects, why, and what control you have over it.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>
          <ShieldCheck size={14} aria-hidden="true" /> Privacy
        </span>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lede}>
          What we collect, why we collect it, and how to get rid of it. This
          describes what the site actually does today — not what we might do
          later.
        </p>
        <span className={styles.updated}>
          Last updated: {siteConfig.legalLastUpdated}
        </span>
      </section>

      <main className={styles.body}>
        <div className={styles.prose}>
          <h2>Who we are</h2>
          <p>
            {siteConfig.legalName} (&ldquo;Sproutt&rdquo;, &ldquo;we&rdquo;)
            operates this website. Our registered address is{" "}
            {siteConfig.address}. For anything in this policy, contact us at{" "}
            <a href={`mailto:${siteConfig.email.privacy}`}>
              {siteConfig.email.privacy}
            </a>
            .
          </p>

          <h2>What we collect</h2>
          <p>We collect only what the site needs to function:</p>
          <ul>
            <li>
              <strong>Your email address</strong> — to identify your account and
              send account emails (confirmation, password resets).
            </li>
            <li>
              <strong>Your name</strong> — as you enter it at signup, or as
              provided by Google if you sign in with Google.
            </li>
            <li>
              <strong>Your profile picture</strong> — only if you sign in with
              Google, which supplies a link to it.
            </li>
            <li>
              <strong>Your password</strong> — stored only as a salted hash by
              our authentication provider. We never see or store the password
              itself.
            </li>
            <li>
              <strong>Your orders</strong> — what you bought, when, the amount,
              and the tree count attached to it.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> collect your date of birth, your location,
            your contacts, or your browsing activity on other sites. We do not
            run advertising or analytics trackers on this site.
          </p>

          <h2>Cookies</h2>
          <p>
            We use cookies for one purpose: keeping you signed in. These are
            strictly necessary — without them you would be signed out on every
            page. They contain your session token, are marked HTTP-only so
            scripts can&apos;t read them, and are refreshed as you browse.
          </p>
          <p>
            We do not use advertising, tracking, or third-party analytics
            cookies. Signing out clears the session.
          </p>

          <h2>Who processes your data</h2>
          <p>
            We use <strong>Supabase</strong> for our database and authentication.
            Your account and order records are stored there on our behalf, under
            their data processing terms. If you sign in with Google, Google
            handles that authentication and tells us your name, email address and
            profile picture — Google&apos;s own privacy policy governs what they
            do with your data.
          </p>
          <p>
            We do not sell your personal data, and we do not share it with
            anyone for marketing.
          </p>

          <h2>How your data is protected</h2>
          <ul>
            <li>
              Every database table enforces row-level access rules, so your
              account and orders are only readable by you.
            </li>
            <li>
              Your tree contribution total is calculated by the database from
              your paid orders. Nobody — including you — can edit it directly.
            </li>
            <li>Passwords are hashed, never stored or transmitted in the clear.</li>
            <li>Session cookies are HTTP-only and revalidated on every request.</li>
          </ul>
          <p>
            No system is perfectly secure. If we ever become aware of a breach
            affecting your data, we will tell you.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Your account data is kept for as long as your account exists. Order
            records may be retained longer where tax or accounting law requires
            it. When you delete your account, your profile and order history are
            deleted with it — which also removes your tree contribution total.
          </p>

          <h2>Your rights</h2>
          <p>You can ask us to:</p>
          <ul>
            <li>Show you a copy of the data we hold about you</li>
            <li>Correct anything inaccurate</li>
            <li>Delete your account and personal data</li>
            <li>Stop processing your data in a particular way</li>
          </ul>
          <p>
            Email{" "}
            <a href={`mailto:${siteConfig.email.privacy}`}>
              {siteConfig.email.privacy}
            </a>{" "}
            and we&apos;ll action it. You can edit your own name and profile
            picture yourself at any time from{" "}
            <Link href="/account">your account page</Link>.
          </p>

          <h2>Children</h2>
          <p>
            Sproutt isn&apos;t intended for children under 13, and we don&apos;t
            knowingly collect their data. If you believe a child has given us
            personal data, contact us and we&apos;ll remove it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we change how we handle your data, we&apos;ll update this page and
            the date at the top. Material changes will be communicated by email.
          </p>

          <h2>Contact</h2>
          <p>
            Privacy questions:{" "}
            <a href={`mailto:${siteConfig.email.privacy}`}>
              {siteConfig.email.privacy}
            </a>
            . Anything else: <Link href="/help">our help page</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
