"use client";

import { useRef, useEffect, useState } from "react";
import CanvasSequence from "@/components/CanvasSequence";
import styles from "./page.module.css";
import { motion, useScroll, useTransform, animate } from "framer-motion";
import { Leaf, Sparkles, Globe, Menu, X } from "lucide-react";
import { Footer } from "@/components/Footer";
import UserMenu from "@/components/UserMenu";
import { useGlobalTrees } from "@/lib/hooks/useSprouttUser";

function ImpactCounter({ value }) {
  const nodeRefDesktop = useRef(null);
  const nodeRefTablet = useRef(null);
  const nodeRefMobile = useRef(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (v) => {
        const rounded = Math.round(v);
        if (nodeRefDesktop.current) nodeRefDesktop.current.textContent = rounded.toLocaleString() + " Trees";
        if (nodeRefTablet.current) nodeRefTablet.current.textContent = (rounded / 1000).toFixed(1) + "K";
        if (nodeRefMobile.current) nodeRefMobile.current.textContent = Math.round(rounded / 1000) + "K";
      }
    });
    return () => controls.stop();
  }, [value]);

  return (
    <div className={styles.impactCounter} title="Together our community has funded this many trees. Every week we plant them with our sustainability partners.">
      <span>🌳</span>
      <span ref={nodeRefDesktop} className={styles.counterDesktop}>0 Trees</span>
      <span ref={nodeRefTablet} className={styles.counterTablet}>0.0K</span>
      <span ref={nodeRefMobile} className={styles.counterMobile}>0K</span>
    </div>
  );
}

// Products and About are real routes now; the rest are still in-page anchors.
const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Vision", href: "#vision" },
  { label: "Contact", href: "/help" },
];

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.25, 1, 0.5, 1] }}
  >
    {children}
  </motion.div>
);

const BlurFadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 1.1, delay, ease: [0.25, 1, 0.5, 1] }}
  >
    {children}
  </motion.div>
);

/**
 * Deterministic pseudo-random in [0, 1).
 *
 * Math.random() here caused a hydration mismatch: the server rendered one set
 * of particle positions and the client generated different ones on hydration.
 * This hashes the index instead, so both sides agree while the field still
 * looks scattered. Uses Math.imul and integer ops only — those are exactly
 * specified in JS, so Node and the browser produce identical bits (unlike
 * Math.sin, whose precision is implementation-defined).
 */
function seededRandom(index, salt) {
  let h = Math.imul(index + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Static once seeded, so it lives outside the component rather than being
// rebuilt on every render.
const VISION_PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: seededRandom(i, 0) * 100,
  y: seededRandom(i, 1) * 100,
  size: seededRandom(i, 2) * 4 + 2,
  dur: seededRandom(i, 3) * 12 + 14,
  delay: seededRandom(i, 4) * 8,
}));

function VisionParticles() {
  const particles = VISION_PARTICLES;
  return (
    <div className={styles.visionParticlesContainer} aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={styles.visionParticle}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -28, 0], opacity: [0.18, 0.55, 0.18] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`ray-${i}`}
          className={styles.visionLightRay}
          style={{ left: `${20 + i * 30}%` }}
          animate={{ opacity: [0, 0.06, 0], scaleY: [0.8, 1.1, 0.8] }}
          transition={{ duration: 18 + i * 4, delay: i * 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // Community-wide total: baseline trees + every tree funded by a paid order.
  const globalTrees = useGlobalTrees();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className={styles.main}>
      {/* Background Canvas Sequence */}
      <CanvasSequence />

      {/* Navigation */}
      <nav className={styles.navContainer}>
        <div className={`${styles.navInner} ${isScrolled ? styles.scrolled : ''}`}>
          <div className={styles.navLogoWrapper}>
            <img src="/sproutt-logo-2.png" alt="Sproutt Logo" className={styles.navLogo} />
          </div>
          
          <div className={styles.navLinks}>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={styles.navLink}>
                {link.label}
              </a>
            ))}
          </div>

          <div className={styles.navRight}>
            <div className={styles.navCounterWrap}>
              <ImpactCounter value={globalTrees} />
            </div>
            <UserMenu />
          </div>

          <button 
            className={styles.mobileMenuBtn} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} color="#1F2E1E" /> : <Menu size={24} color="#1F2E1E" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <motion.div 
            className={styles.mobileDropdown}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className={styles.mobileCtaWrapper}>
              <ImpactCounter value={globalTrees} />
            </div>
          </motion.div>
        )}
      </nav>

      {/* Section 1: Hero */}
      <section className={`${styles.section} ${styles.hero}`}>
        <motion.div
          className={styles.heroBadge}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <span>•</span> Gen Z for Gen Alpha <span>•</span>
        </motion.div>
        
        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Growing Tomorrow, <br/><i style={{ fontStyle: 'italic', color: 'var(--color-secondary)' }}>Starts Today.</i>
        </motion.h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          An optimistic rebellion against a world that forgot how to make things with hands.
        </motion.p>
      </section>

      {/* ── NEW: How We Think ── */}
      <section className={styles.howWeThinkSection} id="about">
        <div className={styles.hwt_inner}>
          <BlurFadeIn>
            <div className={styles.hwt_headerPanel}>
              <span className={styles.hwt_leafLeft} aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 28C4 28 9 12 24 7C24 7 24 21 9 26L4 28Z" fill="#2C4A25" opacity="0.55"/><path d="M9 26C9 26 16 16 24 7" stroke="#2C4A25" strokeWidth="1.3" opacity="0.45"/></svg>
              </span>
              <div className={styles.hwt_headerText}>
                <p className={styles.hwt_eyebrow}>Our Beliefs</p>
                <h2 className={styles.hwt_heading}>How We Think</h2>
                <p className={styles.hwt_sub}>Three beliefs.<br />One movement.</p>
              </div>
              <span className={styles.hwt_leafRight} aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M28 28C28 28 23 12 8 7C8 7 8 21 23 26L28 28Z" fill="#2C4A25" opacity="0.55"/><path d="M23 26C23 26 16 16 8 7" stroke="#2C4A25" strokeWidth="1.3" opacity="0.45"/></svg>
              </span>
            </div>
          </BlurFadeIn>

          <div className={styles.hwt_grid}>
            {[
              {
                num: '01',
                title: 'Roots Before Branches',
                body: `We don't start with solutions.\nWe start with soil.\n\nEvery child is a seed.\nEvery lesson is water.\nEvery creative act is sunlight.\n\nWe don't force growth —\nwe create the conditions for it.\n\nSustainability isn't taught.\nIt's grown.`,
                tagline: '"Nurture first.\nNature does the rest."',
                icon: (
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <ellipse cx="22" cy="15" rx="9" ry="11" stroke="#1F3B2D" strokeWidth="1.7" fill="rgba(44,74,37,0.10)"/>
                    <path d="M22 26V38" stroke="#1F3B2D" strokeWidth="1.7" strokeLinecap="round"/>
                    <path d="M22 32 C18 29 13 31 11 35" stroke="#1F3B2D" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <path d="M22 32 C26 29 31 31 33 35" stroke="#1F3B2D" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <circle cx="22" cy="15" r="3.5" fill="#2C4A25" opacity="0.22"/>
                  </svg>
                ),
              },
              {
                num: '02',
                title: 'Mess Over Perfection',
                body: `A child with clay on their hands learns more than a child with clean nails.\n\nWe celebrate smudges,\nmistakes,\nand happy accidents.\n\nBecause the planet doesn't need perfect people.\n\nIt needs people who aren't afraid to get their hands dirty.\n\nArt is messy.\n\nChange is messy.\n\nWe're okay with both.`,
                tagline: '"Clean hands save nothing.\n\nDirty hands change everything."',
                icon: (
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <rect x="18" y="4" width="8" height="22" rx="4" stroke="#1F3B2D" strokeWidth="1.7" fill="rgba(44,74,37,0.10)"/>
                    <path d="M15 24 Q22 34 29 24" stroke="#1F3B2D" strokeWidth="1.7" fill="rgba(44,74,37,0.12)" strokeLinecap="round"/>
                    <path d="M18 26 L17 40 Q22 42 27 40 L26 26" stroke="#1F3B2D" strokeWidth="1.5" fill="rgba(44,74,37,0.10)" strokeLinejoin="round"/>
                    <circle cx="32" cy="12" r="3" fill="#2C4A25" opacity="0.2"/>
                    <circle cx="10" cy="18" r="2" fill="#2C4A25" opacity="0.15"/>
                  </svg>
                ),
              },
              {
                num: '03',
                title: 'Small Over Loud',
                body: `We don't believe in grand gestures that disappear by Monday.\n\nWe believe in small actions that slowly become forests.\n\nOne notebook.\n\nOne tree.\n\nOne child who chooses differently.\n\nReal revolutions don't begin with megaphones.\n\nThey begin with one tiny seed that refuses to stay buried.`,
                tagline: '"Tiny actions.\n\nTitanic impact."',
                icon: (
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                    <path d="M22 40 V26" stroke="#1F3B2D" strokeWidth="1.7" strokeLinecap="round"/>
                    <path d="M22 26 C22 26 14 19 14 11 C14 6.5 17.7 4 22 4 C26.3 4 30 6.5 30 11 C30 19 22 26 22 26Z" stroke="#1F3B2D" strokeWidth="1.7" fill="rgba(44,74,37,0.10)"/>
                    <path d="M22 16 C18.5 16 16 18 16 20" stroke="#1F3B2D" strokeWidth="1.3" strokeLinecap="round" opacity="0.4"/>
                    <path d="M22 40 C19 38 14 39 12 41" stroke="#1F3B2D" strokeWidth="1.4" strokeLinecap="round" opacity="0.35"/>
                    <path d="M22 40 C25 38 30 39 32 41" stroke="#1F3B2D" strokeWidth="1.4" strokeLinecap="round" opacity="0.35"/>
                  </svg>
                ),
              },
            ].map((card, i) => (
              <div key={card.num} className={styles.hwt_cardWrapper}>
                <motion.div
                  className={styles.hwt_card}
                  initial={{ opacity: 0, y: 48 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.9, delay: i * 0.18, ease: [0.25, 1, 0.5, 1] }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                  }}
                >
                  <motion.div
                    className={styles.hwt_iconWrapper}
                    whileHover={{ rotate: 8, scale: 1.12 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  >
                    {card.icon}
                  </motion.div>
                  <h3 className={styles.hwt_cardTitle}>{card.title}</h3>
                  <p className={styles.hwt_cardBody}>{card.body}</p>
                </motion.div>

                {/* External quote */}
                <motion.div
                  className={styles.hwt_quoteBlock}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.18 + 0.35, ease: [0.25, 1, 0.5, 1] }}
                >
                  <div className={styles.hwt_quoteDivider} />
                  <p className={styles.hwt_quoteText}>{card.tagline}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW: Vision ── */}
      <section className={styles.visionSectionNew} id="vision">
        <VisionParticles />
        <div className={styles.vsn_inner}>
          <BlurFadeIn>
            <blockquote className={styles.vsn_quote}>
              By 2030,<br />
              every child in India will know<br />
              that creativity is the most powerful tool<br />
              for saving the planet.
            </blockquote>
            <p className={styles.vsn_attr}>— The Sprouttt Vision</p>
          </BlurFadeIn>
        </div>
      </section>

      {/* Section 2: Philosophy */}
      <section className={styles.section}>
        <FadeIn>
          <h2 className={styles.title}>Our Philosophy</h2>
        </FadeIn>
        <div className={styles.philosophyGrid}>
          <FadeIn delay={0.1}>
            <div className={`${styles.card} glass`}>
              <div className={styles.cardIcon}><Leaf color="var(--color-primary)" /></div>
              <div className={styles.cardTitle}>Grow</div>
              <div className={styles.cardDesc}>Every great future starts with one idea.</div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className={`${styles.card} glass`}>
              <div className={styles.cardIcon}><Sparkles color="var(--color-primary)" /></div>
              <div className={styles.cardTitle}>Create</div>
              <div className={styles.cardDesc}>Technology should inspire creativity.</div>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className={`${styles.card} glass`}>
              <div className={styles.cardIcon}><Globe color="var(--color-primary)" /></div>
              <div className={styles.cardTitle}>Sustain</div>
              <div className={styles.cardDesc}>Innovation should always respect nature.</div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 3: Vision */}
      <section className={`${styles.section} ${styles.vision}`}>
        <div className={styles.visionLeft}>
          <FadeIn>
            <h2>Our Vision</h2>
          </FadeIn>
        </div>
        <div className={styles.visionRight}>
          <FadeIn delay={0.2}>
            <p>
              Sproutt exists because Gen Alpha deserves more than warnings about
              climate change. They deserve tools to fix it.
            </p>
            <div className={styles.visionManifesto}>
              {[
                ["We don't lecture.", "We create."],
                ["We don't protest.", "We build."],
                ["We don't wait for permission.", "We start."],
              ].map(([negation, action]) => (
                <p key={action} className={styles.visionLine}>
                  <span className={styles.visionNegation}>{negation}</span>
                  <span className={styles.visionAction}>{action}</span>
                </p>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>


      {/* Section 6: Why Sproutt */}
      <section className={`${styles.section} ${styles.whySproutt}`}>
        <FadeIn>
          <h2 className={styles.bigQuote}>
            "We don't chase trends.<br/>We grow ideas that outlive them."
          </h2>
        </FadeIn>
      </section>

      {/* Section 7: CTA */}
      <section className={`${styles.section} ${styles.cta}`}>
        <FadeIn>
          <h2 className={styles.title}>Let's Grow Something Meaningful.</h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <button className={styles.button}>Start Your Journey</button>
        </FadeIn>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
