import { useEffect } from 'react';
import { Lang } from '../types';

/**
 * Per-section document metadata for the SPA.
 *
 * Why this exists:
 *   The site is a single React route (`/`), so without per-section titles
 *   and descriptions the browser tab and search-engine snippets were
 *   identical no matter which section the user scrolled to. This map is
 *   consumed by `useDocumentMeta()` below to update `<title>`, the meta
 *   description, and `<html lang>` whenever the active section changes.
 *
 * Each entry uses the EN copy as the canonical source; we don't translate
 * titles into HI/KN/MR because changing the document language mid-session
 * breaks browser tab history and is bad for SEO. Translation applies to
 * the in-page visible content only.
 */
interface SectionMeta {
  title: string;
  description: string;
}

const SECTION_META: Record<string, SectionMeta> = {
  hero: {
    title: 'Swami Vivekanand Seva Pratishthan | NGO Belagavi, Karnataka',
    description:
      'SVSP is a registered NGO in Belagavi, Karnataka caring for 100+ orphaned children since 1982. Shelter, education, healthcare. Donate (80G), volunteer, or adopt. svspbelagavi.org',
  },
  mission: {
    title: 'About SVSP — Mission & History | Swami Vivekanand Seva Pratishthan',
    description:
      'Since 1982, Swami Vivekanand Seva Pratishthan has sheltered, schooled, and cared for orphaned and underprivileged children in Belagavi, Karnataka. Registered under the Bombay Public Trust Act.',
  },
  causes: {
    title: 'Our Objectives & Programs | Swami Vivekanand Seva Pratishthan',
    description:
      'Child welfare, education, healthcare, nutrition, and rehabilitation programs run by SVSP Belagavi — including CARA-aligned adoption facilitation.',
  },
  'donation-impact': {
    title: 'Donation Impact & 80G Tax Exemption | SVSP Belagavi',
    description:
      'How your donation supports children at SVSP Belagavi. Donations are eligible for 50% tax deduction under Section 80G of the Indian Income Tax Act.',
  },
  news: {
    title: 'Staff & Team | Swami Vivekanand Seva Pratishthan, Belagavi',
    description:
      'Meet the dedicated staff and team behind Swami Vivekanand Seva Pratishthan — caretakers, teachers, and administrators serving children in Belagavi since 1982.',
  },
  events: {
    title: 'Activities & Schedule | Swami Vivekanand Seva Pratishthan',
    description:
      'Recent activities, events, and the annual schedule of Swami Vivekanand Seva Pratishthan, Belagavi.',
  },
  contact: {
    title: 'Contact SVSP Belagavi | Address, Phone, Email',
    description:
      'Swami Vivekanand Seva Pratishthan, Nyay Marg, Near SP Office, Double Road, Subhash Nagar, Belagavi — 590016. Phone: 0831 247 3919 / +91 96068 69122.',
  },
};

const DEFAULT_META: SectionMeta = {
  title: 'Swami Vivekanand Seva Pratishthan | NGO Belagavi, Karnataka',
  description:
    'SVSP is a registered NGO in Belagavi, Karnataka caring for 100+ orphaned children since 1982. Shelter, education, healthcare. Donate (80G), volunteer, or adopt. svspbelagavi.org',
};

/**
 * Updates `<title>`, meta description, and `<html lang>` whenever the
 * active section or selected language changes.
 *
 * - `activeSection` is the id of the section currently in view (e.g. "mission").
 * - `lang` is the user's selected UI language ("EN" | "HI" | "KN" | "MR").
 *
 * The `<html lang>` attribute is updated so screen readers pronounce content
 * using the right pronunciation rules (WCAG 3.1.1).
 */
export function useDocumentMeta(activeSection: string, lang: Lang) {
  useEffect(() => {
    const meta: SectionMeta =
      SECTION_META[activeSection] ?? DEFAULT_META;
    document.title = meta.title;

    // Update or create the meta description tag.
    let descTag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.name = 'description';
      document.head.appendChild(descTag);
    }
    descTag.content = meta.description;

    // Sync <html lang> with the user's selected UI language so AT
    // announces content using the correct pronunciation rules.
    const htmlLang: Record<Lang, string> = {
      EN: 'en',
      HI: 'hi',
      KN: 'kn',
      MR: 'mr',
    };
    document.documentElement.lang = htmlLang[lang];
  }, [activeSection, lang]);
}
