/**
 * Company details used across the legal and info pages.
 *
 * ⚠️ FILL THESE IN before launch. Everything marked TODO is a placeholder —
 * a privacy policy or terms page that names no real entity, address or
 * contact route is not enforceable and, in most jurisdictions, not compliant.
 * Changing them here updates every page at once.
 */
export const siteConfig = {
  name: "Sproutt",

  /** Legal entity name, if it differs from the brand. TODO: confirm. */
  legalName: "Sproutt", // TODO: e.g. "Sproutt Technologies Pvt. Ltd."

  /** City shown publicly. TODO: full registered address before launch. */
  location: "Hyderabad, India",

  /** TODO: your registered business address (needed on the legal pages). */
  address: "Hyderabad, India",

  email: {
    support: "hello@sproutt.life",
    privacy: "hello@sproutt.life", // TODO: split out if you want a separate inbox
    legal: "hello@sproutt.life", // TODO: split out if you want a separate inbox
  },

  /** Shown in the footer. Kept in E.164-ish form so tel: links dial correctly. */
  phone: {
    display: "+91 91003 52220",
    href: "+919100352220",
  },

  /** Courts / law governing the Terms. TODO: confirm with your advisor. */
  jurisdiction: "India",

  /**
   * Date these documents were last substantively changed. Deliberately a fixed
   * string, not new Date() — a legal document's "last updated" must not move
   * on its own every time the page renders.
   */
  legalLastUpdated: "6 August 2026",

  /** TODO: replace with your real profiles (also used by the footer). */
  social: {
    x: "https://x.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
  },
} as const;
