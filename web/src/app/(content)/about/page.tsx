import Link from "next/link";
import type { Metadata } from "next";
import {
  Check,
  Clock,
  Dog,
  Droplets,
  Leaf,
  Mail,
  MapPin,
  Phone,
  TreeDeciduous,
} from "lucide-react";

import { getGlobalTrees } from "@/lib/data/impact";
import { siteConfig } from "@/lib/site-config";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "About Us | Sproutt",
  description:
    "Workshops, tree plantation, river cleaning and animal care — and a tree count you can actually verify.",
};

const WORKING_TODAY = [
  "Workshops in schools and communities",
  "Tree plantation",
  "River cleaning",
  "Animal sanctuary operations",
  "Product sales with fixed tree counts",
];

const BUILDING_NEXT = [
  "Sproutt Academy — after-school Karate, Swimming, Boxing, Archery, Art and Robotics, all with sustainability wired in",
  "A Creative Café where families make things together",
  "Per-tree GPS location reporting, so you can visit your forest",
];

export default async function AboutPage() {
  // Live figure, not a hardcoded one — the copy claims it's updated live.
  const trees = await getGlobalTrees();

  return (
    <>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>
          <Leaf size={14} aria-hidden="true" /> About Sproutt
        </span>
        <h1 className={styles.title}>
          We don&apos;t lecture. <br />
          We show up with gloves on.
        </h1>
        <p className={styles.lede}>
          Sproutt exists because Gen Alpha deserves more than warnings about
          climate change. They deserve tools to fix it.
        </p>
      </section>

      <main className={styles.body}>
        <div className={styles.prose}>
          <h2>What we do today</h2>

          <h3>Creative workshops</h3>
          <p>
            We show up in school courtyards and community halls with paper,
            colours, and a lesson plan. Kids learn drawing, paper craft, and
            hands-on art — but with a difference. We use recycled materials
            where possible, natural colours when we can, and every session ends
            with a conversation about why the materials matter.
          </p>
          <p>
            It&apos;s not an art class with a lecture at the end. It&apos;s
            creativity that quietly wires responsibility into how they think.
          </p>

          <h3>Social impact</h3>
          <p>We don&apos;t just talk. We show up with gloves on.</p>

          <div className={styles.pillar}>
            <div className={styles.pillarTitle}>
              <TreeDeciduous size={17} aria-hidden="true" /> Tree plantation
            </div>
            <p>
              Every workshop, every product sale, every partnership funds real
              trees. Not offset credits bought in bulk. A count you can see.
            </p>
          </div>

          <div className={styles.pillar}>
            <div className={styles.pillarTitle}>
              <Droplets size={17} aria-hidden="true" /> River cleaning
            </div>
            <p>
              We partner with communities to clean Hyderabad&apos;s water
              bodies. One drive at a time.
            </p>
          </div>

          <div className={styles.pillar}>
            <div className={styles.pillarTitle}>
              <Dog size={17} aria-hidden="true" /> Animal care
            </div>
            <p>
              Sanctuary and rescue work for stray dogs and abandoned cows.
            </p>
          </div>

          <h2>How we count</h2>
          <p>
            Every product we sell carries a fixed tree count — visible before you
            buy, stored with your order forever, never revised after the fact.
          </p>
          <p>
            A seed kit funds ten trees. A tote funds two. When your order is
            paid, those trees are added to your total. You see the running figure
            and the full breakdown — which product, how many, when — on{" "}
            <Link href="/account">your account</Link>.
          </p>
          <p>
            If we raise a product&apos;s count next year, your past order keeps
            the number it was bought at. A future order gets the new one. Your
            figure can never be quietly revised — up or down — after the fact.
          </p>
        </div>

        <div className={styles.statBand}>
          <div className={styles.statNumber}>{trees.toLocaleString()}</div>
          <div className={styles.statLabel}>
            {trees === 1 ? "Tree funded so far" : "Trees funded so far"}
          </div>
          <div className={styles.statMeta}>
            <span>Updated live</span>
            <span>100% traceable to a specific product</span>
          </div>
        </div>

        <div className={styles.prose}>
          <h2>What we&apos;re still building</h2>
          <p>
            We&apos;d rather say this plainly than imply we&apos;re further along
            than we are.
          </p>
        </div>

        <div className={styles.splitGrid}>
          <div className={`${styles.splitCol} ${styles.splitColLive}`}>
            <div className={`${styles.splitTitle} ${styles.splitTitleLive}`}>
              <Check size={14} aria-hidden="true" /> Working today
            </div>
            <ul className={styles.tickList}>
              {WORKING_TODAY.map((item) => (
                <li key={item} className={styles.tickItem}>
                  <Check size={15} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.splitCol}>
            <div className={styles.splitTitle}>
              <Clock size={14} aria-hidden="true" /> Building next
            </div>
            <ul className={styles.tickList}>
              {BUILDING_NEXT.map((item) => (
                <li key={item} className={`${styles.tickItem} ${styles.tickItemSoon}`}>
                  <Clock size={15} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.prose}>
          <p>
            Ask us where things stand before you buy or partner. We&apos;ll
            answer honestly.
          </p>

          <h2>Where we&apos;re going</h2>
          <p>
            By 2030, we want &ldquo;eco-friendly&rdquo; to sound as obvious as
            &ldquo;brush your teeth.&rdquo; No guilt. No pressure. Just normal.
          </p>
          <p>
            We want every child to grow up knowing that creativity is the most
            powerful tool for change. That making things with your hands is not
            old-fashioned — it&apos;s the future. That sustainability isn&apos;t
            a sacrifice. It&apos;s just how things are supposed to be.
          </p>
          <p>
            <strong>
              We don&apos;t teach kids to &ldquo;save the planet.&rdquo; We teach
              them that this is just how things are supposed to be.
            </strong>
          </p>

          <h2>Get in touch</h2>
          <p>
            Questions, partnership ideas, or a hard question about our claims —
            all welcome.
          </p>

          <div className={styles.contactRow}>
            <a
              href={`mailto:${siteConfig.email.support}`}
              className={styles.contactPill}
            >
              <Mail size={15} aria-hidden="true" /> {siteConfig.email.support}
            </a>
            <a href={`tel:${siteConfig.phone.href}`} className={styles.contactPill}>
              <Phone size={15} aria-hidden="true" /> {siteConfig.phone.display}
            </a>
            <span className={styles.contactPill}>
              <MapPin size={15} aria-hidden="true" /> {siteConfig.location}
            </span>
          </div>

          <p style={{ marginTop: 28 }}>
            <Link href="/products">See what we make</Link> ·{" "}
            <Link href="/faqs">Read the FAQs</Link> ·{" "}
            <Link href="/help">Get help</Link>
          </p>
        </div>
      </main>
    </>
  );
}
