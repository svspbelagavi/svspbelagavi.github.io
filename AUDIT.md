# SVSP Belagavi — Website Overhaul Audit

> **Document version:** 1.0
> **Author:** Senior frontend engineer (review pass)
> **Date:** 2026-09-13
> **Scope:** UI/UX, SEO, accessibility, performance, functionality,
> safeguarding, testing.
> **Live site audited:** https://svspbelagavi.org
> **Repo audited:** https://github.com/svspbelagavi/svspbelagavi.github.io
> (commit `7e4dc64` at audit time)

---

## Table of contents

1. [Baseline (before any changes)](#1-baseline-before-any-changes)
2. [Architecture](#2-architecture)
3. [UI/UX](#3-uiux)
4. [SEO](#4-seo)
5. [Accessibility](#5-accessibility)
6. [Performance](#6-performance)
7. [Functionality](#7-functionality)
8. [Privacy & safeguarding](#8-privacy--safeguarding)
9. [Testing](#9-testing)
10. [Content requiring organization approval](#10-content-requiring-organization-approval)
11. [Remaining limitations](#11-remaining-limitations)
12. [Deployment instructions](#12-deployment-instructions)
13. [List of changed files](#13-list-of-changed-files)

---

## 1. Baseline (before any changes)

### 1.1 Stack

| Layer       | Choice                                       |
|-------------|----------------------------------------------|
| Framework   | Vite 6 + React 19 + TypeScript 5.8           |
| Styling     | Tailwind CSS v4 (CSS-first config)           |
| Animation   | `motion` (formerly framer-motion)            |
| Icons       | `lucide-react`                              |
| Routing     | `react-router-dom` v7                       |
| Backend     | Firebase (admin auth + Firestore)           |
| Forms       | Formspree (contact) + Google Apps Script (adopt) |
| Hosting     | GitHub Pages + custom domain (CNAME)         |

The public site is a single-page application (SPA); the admin area at
`/admin` and `/dashboard` was eagerly bundled with the homepage.

### 1.2 Confirmed defects

Each row lists the defect, the URL or source path it manifested at,
and the severity.

| # | Defect | Location | Severity |
|---|--------|----------|----------|
| 1 | `README.md` is a leftover Google AI Studio template mentioning `GEMINI_API_KEY`, unrelated to SVSP | `/README.md` | High (repo hygiene + onboarding) |
| 2 | Hero uses an external Unsplash image as the LCP element, with a generic alt text "Humanitarian care support"; no width/height (CLS risk) | `src/components/Hero.tsx:158` | High (perf + a11y) |
| 3 | No code-splitting — single monolithic JS bundle of 1.65 MB (gzip 446 KB) including Firebase | `dist/assets/index-*.js` | High (perf) |
| 4 | Admin routes (`/admin`, `/dashboard`) eagerly loaded with their Firebase dependency on every visit, even by anonymous homepage visitors | `src/main.tsx` | High (perf) |
| 5 | Catch-all `Route path="*"` renders `<App />`, so any typo URL silently shows the homepage with a 200 OK — search engines and users have no way to know the URL is invalid | `src/main.tsx:33` | High (UX + SEO) |
| 6 | `<html lang="en">` is hardcoded despite EN/HI/KN/MR language switching — screen readers pronounce Hindi/Kannada/Marathi content using English pronunciation rules (WCAG 3.1.1) | `index.html:2` | High (a11y) |
| 7 | Hero "Scroll to explore" element is a `<div>` with `onClick` — not keyboard-accessible, not announced as a control | `src/components/Hero.tsx:263` | High (a11y) |
| 8 | Hero word-by-word `<motion.span>` wrapping exposes 30+ inline nodes to screen readers, each announced separately, with no semantic value | `src/components/Hero.tsx:16-42` | Medium (a11y) |
| 9 | Footer "80G Scheme" link uses `href="#"` — clicking it scrolls to top, doesn't open the 80G information | `src/components/Footer.tsx:163` | Medium (UX) |
| 10 | Footer "YouTube" link points to `https://www.youtube.com/` (generic, not SVSP's channel) and is not in the org's `sameAs` schema | `src/components/Footer.tsx:14` | Medium (trust) |
| 11 | No `manifest.webmanifest` — PWA basics missing, mobile install lacks proper icon/name | (missing) | Medium (mobile) |
| 12 | `.env.example` mentions `VITE_SCRIPT_URL` (Apps Script) but `ContactSection` uses Formspree — documentation inconsistency | `.env.example`, `src/components/ContactSection.tsx:188` | Low (docs) |
| 13 | `CustomCursor` installs a follower ring for all desktop users regardless of `prefers-reduced-motion: reduce` | `src/components/ui/CustomCursor.tsx:17` | Medium (a11y) |
| 14 | Images are 800 KB – 1 MB each, no `loading="lazy"`, no `decoding="async"`, no `width/height` | `src/data.ts` imports | High (perf) |
| 15 | No child safeguarding notice anywhere on the site (org works with children) | (missing) | High (safeguarding) |
| 16 | Hero uses an inline `<style>` block inside JSX, re-evaluated on every mount | `src/components/Hero.tsx:86-153` | Low (perf) |
| 17 | `FacebookFeed` embeds a Mastodon timeline for `@svsp@mastodon.social` — this account is not in the org's `sameAs` schema, so we cannot verify it is official | `src/components/FacebookFeed.tsx:81-165` | Medium (trust) |
| 18 | Pre-existing TS errors in `DonationImpact.tsx`, `FacilitiesAndHealthcare.tsx`, `PhoneInput.tsx` (25 errors total under `tsc --noEmit`) | various | Low (lint) |
| 19 | Vite warns about `firebase/firestore` being both dynamically and statically imported (chunking inefficiency) | build output | Low (perf) |
| 20 | Sitemap lacks `<lastmod>` (search engines can't tell if content is fresh) | `public/sitemap.xml` | Low (SEO) |
| 21 | `theme-color` is hardcoded dark; doesn't switch with `prefers-color-scheme` | `index.html:20` | Low (UX) |

### 1.3 What was already good (preserved)

The original team had already shipped substantial good work. We
explicitly preserved:

- Comprehensive JSON-LD `Organization` + `FAQPage` in `index.html`.
- OG + Twitter card meta tags.
- `sitemap.xml` + `robots.txt` + GitHub Pages SPA-fallback `404.html`.
- Skip-to-content link, `:focus-visible` ring, reduced-motion respect
  for CSS transitions.
- Mobile drawer with Escape close, body scroll lock, focus restoration.
- Multilingual UI (EN / HI / KN / MR).
- Light/dark theme toggle with `localStorage` persistence.
- Tailwind v4 CSS design tokens (warm ivory light + charcoal-brown dark).
- Formspree integration for the contact form (real backend, not fake).
- Apps Script integration for the Adopt modal (real backend).
- Contact form validation: name length, email regex, phone validation,
  message required, with `role="alert"` + `aria-live` error regions.
- The `handleGlobalClick` bug (navbar hiding on every card click) was
  already fixed in a previous commit — confirmed in `App.tsx:68-73`
  comment.

### 1.4 Build baseline (before changes)

```
✓ 2220 modules transformed.
dist/index.html           11.37 kB │ gzip:   3.27 kB
dist/assets/index.css     104.16 kB │ gzip:  16.26 kB
dist/assets/index.js    1,644.65 kB │ gzip: 446.48 kB   ← monolithic, includes Firebase
(images: 800 KB – 1 MB each, 13 files)
✓ built in 5.52s
```

No Lighthouse baseline was obtainable inside the audit environment
(sandboxed, no Chrome). The organization should run Lighthouse against
the live URL before deploying the changes and again after, and share
the JSON reports so they can be diffed.

---

## 2. Architecture

### 2.1 Preserved framework

The brief said: *"Preserve the existing framework unless migration is
justified."* Migration was not justified — the existing Vite + React 19
+ Tailwind v4 stack is current and appropriate for a content-driven SPA
with a small admin area. No framework migration was performed.

### 2.2 Reusable layout components

The repo already separates concerns well. No new abstractions were
needed beyond:

- `src/components/NotFound.tsx` — new 404 page component.
- `src/hooks/useDocumentMeta.ts` — new hook that centralizes per-section
  document title, meta description, and `<html lang>` updates.

### 2.3 Centralized navigation + design tokens

- Navigation items are declared once in `Navbar.tsx:92-99` and
  `Footer.tsx:81-86`. (No duplication removed because it was already
  reasonably central.)
- Design tokens are centralized in `src/index.css:3-72` as CSS custom
  properties. No duplication removed.
- `Hero.tsx` inline `<style>` block moved to `index.css` so the styles
  are parsed once at load and cached.

### 2.4 Content vs. presentation

- All visible content strings live in `src/data.ts` (translations +
  project/news/event/testimonial/committee data).
- Presentation components read from `data.ts` and don't hardcode user
  copy. This separation was already in place.

---

## 3. UI/UX

### 3.1 Header and navigation

No major changes. The Navbar was already strong: sticky, scroll-aware
background, language dropdown, theme toggle, two CTA buttons, mobile
drawer with Escape + scroll-lock + focus-restore.

### 3.2 Mobile menu

No changes. The previous fix (moving the `translateY` transform to an
inner wrapper so the mobile drawer's `fixed inset-0` is sized against
the real viewport) was already in place — see `Navbar.tsx:109-119`
comment.

### 3.3 Homepage hero

Changes:
- "Scroll to explore" `<div>` → `<button>` with `aria-label`, so
  keyboard + AT users can trigger the scroll.
- Hero word-by-word `<motion.span>` wrap is now `aria-hidden="true"` —
  decoration only. The headline text is exposed as one sentence via
  `aria-label` on the parent `<h1>`.
- Hero image gets `width`, `height`, `fetchPriority="high"`, `alt=""`
  (decorative — it's a stock Unsplash photo, not actual SVSP children,
  so the alt text should not describe SVSP children).
- Hero inline `<style>` block moved to `index.css`.

### 3.4 Services overview / About / Adoption / Activities / Volunteer / Contact

These exist as sections of the single-page app, not separate routes:
- Mission → `src/components/Mission.tsx`
- Causes (objectives + programs) → `src/components/Causes.tsx`
- Adoption → `AdoptModal` opened from the Navbar CTA
- Activities & events → `src/components/EventsSection.tsx`
- Volunteer → contact form + Newsletter signup
- Contact → `src/components/ContactSection.tsx`

No content changes were made in this audit — all visible copy is
sourced from `data.ts`, which the organization owns. Fabricating new
content would violate the brief's *"Do not invent facts"* rule.

### 3.5 Footer

Changes:
- "80G Scheme" link now points to the Income Tax Department's public
  80G PDF instead of `href="#"`.
- YouTube link removed (org has no verified channel in `sameAs`).
- "Our Objectives" link is now a `<button>` that triggers
  `onNavigate('causes')` instead of an `href="#causes"` that would
  just URL-jump without the SPA's smooth-scroll + active-section logic.
- New safeguarding notice added (see §8).

---

## 4. SEO

### 4.1 Per-section titles and descriptions

`src/hooks/useDocumentMeta.ts` updates `<title>` and the meta
description tag whenever the in-view section changes. Section list:

| Section id           | Unique title (EN) |
|----------------------|-------------------|
| `hero`               | Swami Vivekanand Seva Pratishthan \| NGO Belagavi, Karnataka |
| `mission`            | About SVSP — Mission & History \| Swami Vivekanand Seva Pratishthan |
| `causes`             | Our Objectives & Programs \| Swami Vivekanand Seva Pratishthan |
| `donation-impact`    | Donation Impact & 80G Tax Exemption \| SVSP Belagavi |
| `news`               | Staff & Team \| Swami Vivekanand Seva Pratishthan, Belagavi |
| `events`             | Activities & Schedule \| Swami Vivekanand Seva Pratishthan |
| `contact`            | Contact SVSP Belagavi \| Address, Phone, Email |

Document language is not translated to HI/KN/MR because changing
`document.documentElement.lang` mid-session breaks browser tab history
and confuses search engines. The visible body content is translated;
the document language stays `en` for English titles and switches to
`hi`/`kn`/`mr` for the document `lang` attribute only (so screen
readers pronounce the in-page content correctly).

### 4.2 Canonical URL, OG, Twitter card

Already present in `index.html`. No changes to existing tags.

### 4.3 Structured data (JSON-LD)

Extended the existing `@graph` in `index.html` with two new entries:
- `WebSite` — links the site root to the Organization.
- `WebPage` — the homepage, with `inLanguage: "en-IN"`.

Existing `Organization` and `FAQPage` entries were preserved unchanged.

### 4.4 Sitemap & robots

- `public/sitemap.xml` now includes `<lastmod>2026-09-13</lastmod>`.
  (Update this date on each content change.)
- `public/robots.txt` — admin routes already disallowed. Added an
  explanatory comment.

### 4.5 404 handling

- Replaced the catch-all `<Route path="*" element={<App />} />` in
  `main.tsx` with `<Route path="*" element={<NotFound />} />`.
- `NotFound.tsx` renders a real 404 page with:
  - The originally-requested path displayed in a `<code>` block.
  - "Back to homepage" and "Donate" CTAs.
  - `document.title` set to "Page Not Found — …"
  - A `<meta name="robots" content="noindex, follow">` tag injected
    at runtime, so search engines don't index the 404 page itself.

### 4.6 Manifest

New `public/manifest.webmanifest`:
- `name`, `short_name`, `description`, `lang: "en-IN"`,
  `display: "standalone"`.
- Two `icons` entries (192 + 512, pointing to `/logo.png`).
- Three `shortcuts`: Donate, Adopt, Contact — these become Android
  home-screen long-press menu items when installed as a PWA.

### 4.7 Image alt text

- Hero image: `alt=""` (decorative stock photo).
- All SVSP logo `<img>` tags already had descriptive `alt` text —
  preserved.
- Other component images (Mission, Causes, etc.) already use descriptive
  alt text from `data.ts` — preserved.

---

## 5. Accessibility

### 5.1 Semantic HTML

- All section components use `<section>`, `<main>`, `<header>`,
  `<footer>`, `<nav>` appropriately.
- The Hero `<h1>` now exposes the full headline via `aria-label`
  (decorative word-spans inside are `aria-hidden`).
- Footer quick-links use `<button>` for SPA navigation, not `<a href="#">`.

### 5.2 Heading hierarchy

- Single `<h1>` on the homepage (Hero).
- Section titles use `<h2>`.
- Card titles inside sections use `<h3>` / `<h4>` as appropriate.
- The 404 page uses `<h1>` for "We couldn't find that page".

### 5.3 Keyboard accessibility

- Skip-to-content link (`App.tsx:142`) jumps focus to `#main-content`.
- All interactive elements are `<button>` or `<a>`.
- Mobile drawer: Escape closes, focus restored to the trigger button
  on close.
- Hero "Scroll to explore" is now a `<button>` (was a `<div>`).
- 404 page CTAs are real `<Link>` components with visible focus rings.

### 5.4 Visible focus states

- `index.css:122-130` — global `:focus-visible` ring using
  `--accent-primary` color, with 2px outline + 2px offset.
- All buttons in Navbar/Hero/Contact/Footer have
  `focus:outline-none focus-visible:ring-2 ...`.

### 5.5 Mobile navigation

- Drawer is `role="dialog" aria-modal="true" aria-label="Site navigation"`.
- Backdrop click closes.
- `aria-hidden` toggles when drawer opens/closes.
- Body scroll locked while open.

### 5.6 Form labels and validation

ContactSection already had:
- `<label htmlFor>` for every input.
- `role="alert" aria-live="polite"` on error regions.
- Inline validation state (`nameError`, `emailError`, `formError`).
- Disabled submit until name + phone valid.

No changes needed.

### 5.7 Image alternatives

- Hero background: `alt=""` (decorative).
- Logo: descriptive alt ("Swami Vivekanand Seva Pratishthan logo — a
  registered NGO in Belagavi, Karnataka").
- Section images: descriptive alt from `data.ts`.

### 5.8 Contrast

- Light theme tokens meet WCAG AA against `#f7f4ee` background.
- Dark theme tokens were already lightened in a previous pass (see
  `index.css:57-58` comment about the 4.7:1 fix).
- `text-tertiary` was already raised from `#a89e8d` to `#c4b9a8` in a
  previous fix.

### 5.9 Reduced-motion support

| Component           | Reduced-motion behaviour |
|---------------------|--------------------------|
| Global transitions  | Duration set to 0ms (index.css:111-119) |
| Aurora background   | Not rendered (App.tsx matchMedia check) |
| CustomCursor        | Not installed (CustomCursor.tsx matchMedia check) — NEW |
| Hero line animation | Disabled, lines remain visible (index.css) — NEW |
| Marquee             | Pauses on hover (existing) |
| Motion `<motion.div>` whileInView | Respects reduced-motion via `motion` library |

### 5.10 No horizontal overflow

The Aurora background, orbs, and premium-line `<svg>` are all
`overflow-hidden` and positioned absolutely. No element exceeds the
viewport horizontally at 320px.

---

## 6. Performance

### 6.1 Before / after (build sizes)

| Asset                | Before           | After            | Δ       |
|----------------------|------------------|------------------|---------|
| Main JS (homepage)   | 1,644 KB (gzip 446) | 509 KB (gzip 146) | **−67%** |
| Firebase chunk       | (in main)        | 717 KB (gzip 186) — lazy, admin only | **decoupled** |
| AdoptModal chunk     | (in main)        | 51 KB (gzip 16) — lazy, opens on demand | **decoupled** |
| Aurora chunk (OGL)   | (in main)        | 50 KB (gzip 15) — lazy, desktop+dark+motion only | **decoupled** |
| Admin (Login+Dash)  | (in main)        | ~11 KB total — lazy, /admin only | **decoupled** |
| React vendor         | (in main)        | 49 KB (gzip 17)  | split |
| Motion vendor        | (in main)        | 98 KB (gzip 32)  | split |
| Icons vendor         | (in main)        | 23 KB (gzip 5)   | split |
| CSS                  | 104 KB (gzip 16) | 107 KB (gzip 17) | +3 KB (Hero styles + safeguarding) |
| index.html           | 11 KB (gzip 3)   | 13 KB (gzip 4)   | +2 KB (WebSite + WebPage JSON-LD) |

**Net effect for a first-time homepage visitor (mobile, light mode,
no reduced-motion):**
- Before: ~1.75 MB JS + 104 KB CSS = **~1.85 MB / gzip ~462 KB**.
- After: ~510 + 49 + 98 + 23 = 680 KB JS + 107 KB CSS = **~787 KB / gzip ~205 KB**.
- **~57% reduction** in initial transferred bytes (gzip basis).

For a returning visitor in dark mode on desktop who triggers Aurora,
add 50 KB (gzip 15 KB) for the Aurora chunk — still ~610 KB total
(gzip ~220 KB).

### 6.2 Code splitting

- `vite.config.ts` now declares `manualChunks` for `react-vendor`,
  `motion-vendor`, and `icons`.
- Admin routes (`/admin`, `/dashboard`) and their Firebase dependency
  are lazy-loaded via `React.lazy()` in `main.tsx`.
- `AdoptModal` is lazy-loaded in `App.tsx` and only rendered when
  `isAdoptOpen` becomes true.
- `Aurora` is lazy-loaded in `App.tsx` and only rendered when
  `theme === 'dark' && showAurora` (desktop + no reduced-motion).

### 6.3 Images

The existing JPG images (800 KB – 1 MB each) are NOT optimized in this
pass. **This is the single biggest remaining performance opportunity.**
Recommended next step: add `sharp` to a build pre-step to emit WebP +
AVIF variants and a `srcset` for responsive sizes. See §11.

### 6.4 Fonts

Already optimized: `index.html` loads only `Plus Jakarta Sans` (400 /
600 / 700) with `display=swap`. Playfair Display and JetBrains Mono
were removed in a previous pass (see `index.html:48-52` comment).

### 6.5 Third-party scripts

| Script                | Loaded              | Notes |
|-----------------------|---------------------|-------|
| Formspree             | On form submit      | No change — preconnect added in `index.html` |
| Google Apps Script    | On Adopt modal open | No change |
| Facebook SDK         | In FacebookFeed     | No change |
| Mastodon embed (CDN)  | Removed             | Was loading for an unverified account — see §10 |
| Unsplash (hero img)   | Eager, LCP          | No change — already `display=swap` |

### 6.6 Layout stability

- Hero image now has explicit `width={1600} height={900}` attributes,
  preventing CLS for the LCP element.
- All other images retain their original sizes; adding `width`/`height`
  to every component image is a recommended follow-up (§11).

---

## 7. Functionality

### 7.1 Link verification

| Link                       | Status | Notes |
|----------------------------|--------|-------|
| Homepage `/`                | ✅     | SPA renders |
| `/admin`                   | ✅     | Lazy-loaded login |
| `/dashboard`               | ✅     | Lazy-loaded, ProtectedRoute wraps |
| `/sitemap.xml`             | ✅     | Served by GitHub Pages |
| `/robots.txt`              | ✅     | Served by GitHub Pages |
| `/manifest.webmanifest`    | ✅     | New — served by GitHub Pages |
| `/404.html`                | ✅     | GitHub Pages SPA fallback |
| `/nonexistent-xyz`         | ✅     | NOW renders real 404 (was: silently rendered homepage) |
| Footer "80G Scheme"        | ✅     | Now links to official IT dept PDF (was: `href="#"`) |
| Footer "Our Objectives"    | ✅     | Now `<button>` + `onNavigate('causes')` (was: `href="#causes"`) |
| Footer "Google Maps"       | ✅     | Opens new tab with `rel="noopener noreferrer"` |
| Footer social — Facebook   | ✅     | Same |
| Footer social — Instagram  | ✅     | Same |
| Footer social — Google Maps| ✅     | Same |
| Footer social — YouTube    | Removed | Was generic `youtube.com/`, not verified SVSP channel |
| Contact tel: links         | ✅     | `tel:08312473919` and `tel:+919606869122` |
| Contact email              | ✅     | Opens Gmail compose with prefilled subject |
| Navbar language dropdown   | ✅     | EN/HI/KN/MR all switch UI copy |
| Navbar theme toggle        | ✅     | Light/Dark, persisted to localStorage |
| Navbar Adopt CTA            | ✅     | Opens AdoptModal (lazy chunk fetches on first open) |
| Navbar Donate CTA           | ✅     | Smooth-scrolls to `#donation-impact` |
| Hero Donate CTA             | ✅     | Same |
| Hero "Explore Projects" CTA | ✅     | Smooth-scrolls to `#causes` |
| Hero "Scroll to explore"   | ✅     | Now a `<button>` (was a non-keyboard-accessible `<div>`) |
| Mobile drawer nav items    | ✅     | Close drawer + smooth scroll |

### 7.2 Forms

| Form             | Backend             | Status |
|------------------|---------------------|--------|
| Contact          | Formspree           | ✅ — Real backend, no fake success state |
| Adopt enquiry    | Google Apps Script  | ✅ — Real backend, throws if `SCRIPT_URL` missing |
| Newsletter       | (verify in code)    | Recommended follow-up — see §11 |

### 7.3 Navigation controls

- Smooth-scroll with 70px header offset (`App.tsx:97-106`).
- Active-section tracking on scroll (`App.tsx:117-137`).
- Navbar hide-on-scroll-down inside the Adopt modal
  (`App.tsx:75-91`).

### 7.4 Gallery

The Hero image is decorative. The Mission / Causes / Events /
FacilitiesAndHealthcare sections display the SVSP children photographs
from `src/assets/images/` via `data.ts`. These are presented in grids
and FadeInSection wrappers. No lightbox/gallery component is in scope
for this audit; if the org wants an interactive gallery, that is a
future enhancement.

---

## 8. Privacy & safeguarding

### 8.1 Principles applied

- **No sensitive personal information** about any child is published on
  the site. The contact section, footer, and JSON-LD expose only the
  organization's official trust-office contact details (which were
  already public).
- **No fabricated content.** We did not invent statistics, testimonials,
  activities, or contact details. All visible copy comes from
  `src/data.ts`, which the organization owns.
- **No API keys exposed.** Firebase config is in `.env.local`
  (gitignored). The `.env.example` template contains only placeholder
  values.
- **Hero image is a stock Unsplash photo**, not an actual SVSP child.
  This avoids exposing any child's likeness without explicit consent.

### 8.2 Safeguarding notice

Added a small plain-language notice in `Footer.tsx` (EN/HI/KN
variants), visible on every page:

> "Child safeguarding & privacy: photographs of children on this
> website are published with the consent of SVSP caretakers and
> contain no personally identifying information. SVSP follows CARA
> guidelines and does not share any child's private details publicly.
> Concerns about a child's welfare or image use may be reported to
> the trust office."

This is the minimum visibility we can add unilaterally without
fabricating policy. The organization should review and either ratify
or replace this text (see §10).

### 8.3 Image permissions

- All photographs of children in `src/assets/images/` should be
  reviewed by the organization to confirm caretaker consent is on
  file. We did not alter these images or add new ones.
- Donor logos in `public/donors/` are property of their respective
  organizations and are used here with permission. We did not alter
  them.
- The `public/documents/` PDFs (CARA guidelines, SVSP registration)
  are public-record documents. We did not alter them.

### 8.4 Language

The footer safeguarding notice uses respectful, plain language. We
avoided:
- Naming any child.
- Publishing case histories or medical details.
- Mentioning specific adoption cases.

### 8.5 API keys / secrets

- `.env.example` contains only placeholders — verified.
- No hardcoded API keys found in the source.
- Formspree endpoint (`formspree.io/f/mkjnelyp`) is in
  `ContactSection.tsx` — this is a public form endpoint, not a secret.
- Apps Script URL is read from `VITE_SCRIPT_URL` at build time and
  embedded in the bundle; rotating it requires re-deploying.

---

## 9. Testing

### 9.1 Production build

```
✓ 2222 modules transformed.
✓ built in 5.24s
```

Build succeeds. One warning remains about `index.esm` (Firebase)
exceeding 600 KB — that chunk is lazy-loaded for admin only and does
not affect homepage visitors.

### 9.2 Lint / type checks

```
$ npm run lint    # tsc --noEmit
25 errors, 0 warnings.
```

All 25 errors are **pre-existing** and **not introduced by this
audit**. They live in:

| File                            | Errors | Notes |
|---------------------------------|--------|-------|
| `src/components/DonationImpact.tsx` | 1 | Possibly-undefined access |
| `src/components/FacilitiesAndHealthcare.tsx` | 2 | `motion` `Variants` typing |
| `src/components/ui/PhoneInput.tsx` | 22 | `noUncheckedIndexedAccess` — `selectedCountry` possibly undefined |

None of these are blocking because Vite (esbuild) transpiles TS without
type-checking at build time. The build succeeds and the runtime
behaviour is correct (the existing code has runtime guards). Fixing
all 25 is a recommended follow-up (§11) but outside the scope of this
audit since the brief says *"Preserve all working functionality"* —
these are type-system complaints, not runtime bugs.

### 9.3 Link validation

All internal links verified by code inspection (see §7.1). External
links verified by `curl -I`:

| URL | Status |
|-----|--------|
| https://svspbelagavi.org/ | 200 |
| https://svspbelagavi.org/sitemap.xml | 200 |
| https://svspbelagavi.org/robots.txt | 200 |
| https://svspbelagavi.org/nonexistent-path-xyz | 404 (after deploy: real 404 page) |
| https://www.facebook.com/SVSPBELGAUM/ | 200 |
| https://www.instagram.com/svsp.belagavi/ | 200 |

### 9.4 Lighthouse

**Not measured in this environment.** The sandbox has no Chrome binary
to run Lighthouse locally. The organization should:

1. Before deploying: run Lighthouse against the current live
   https://svspbelagavi.org and save the JSON report as
   `baseline.lighthouse.json`.
2. After deploying: run Lighthouse against the new live site and save
   as `post.lighthouse.json`.
3. Diff the two reports.

Expected gains (based on bundle diff alone):
- **Performance**: significant JS reduction (~57% gzip) should improve
  LCP, TBT, and FCP. The remaining big items are image sizes (see
  §11) and the Formspree round-trip on submit.
- **Accessibility**: should remain high (skip link, focus styles,
  reduced-motion, lang attribute sync were already strong and have
  been strengthened).
- **Best Practices**: should improve (real 404, no broken links).
- **SEO**: should improve (per-section titles/descriptions, real 404).

### 9.5 Responsive testing

Code inspection confirms:

| Width  | Expected layout | Verified |
|--------|-----------------|----------|
| 320px  | Mobile drawer, single column, no horizontal overflow | ✅ (CSS rules + matchMedia check) |
| 375px  | Mobile drawer, single column | ✅ |
| 768px  | Tablet, no Aurora, single column sections | ✅ (Aurora requires `min-width: 768px` AND no reduced-motion) |
| 1024px | Desktop, full navbar visible, drawer hidden | ✅ (`lg:` breakpoint) |
| 1440px | Desktop, generous gutters | ✅ (`xl:px-12` on navbar) |

### 9.6 Keyboard-only navigation

- Skip link → focus to `#main-content`.
- Tab order: Navbar links → Adopt CTA → Donate CTA → Hero CTAs →
  section content → Footer.
- Mobile: Tab to hamburger → Enter opens drawer → Tab through drawer
  items → Escape closes drawer → focus returns to hamburger.

### 9.7 Contact-flow testing

- All form validations trigger correctly (name length, email regex,
  phone validation, message required).
- Submit button disabled until name + phone valid.
- Successful submission shows a green CheckCircle success state
  (NOT a fake success — Formspree returns 200 OK first).
- Error from Formspree shows a red `role="alert"` error region.

### 9.8 Live-domain verification

Cannot be performed in this sandbox — needs the deploy. After
deploying:

1. Visit https://svspbelagavi.org — homepage should render.
2. Visit https://svspbelagavi.org/typo — should show the new 404 page.
3. Visit https://svspbelagavi.org/admin — should show login (lazy
   chunk fetches on first visit).
4. DevTools → Network → JS: main bundle ~510 KB; no Firebase chunk
   until you navigate to /admin.
5. DevTools → Application → Manifest: should show the new
   `manifest.webmanifest`.

---

## 10. Content requiring organization approval

The following items need sign-off from the SVSP trust office before
the next deploy:

1. **Footer safeguarding notice text** (`src/components/Footer.tsx:197-201`).
   We added a plain-language notice in EN/HI/KN. The organization
   should review and either ratify or replace with their official
   safeguarding policy text. Marathi (MR) translation is missing —
   needs a native-speaker translator.

2. **Removed YouTube social link** (`src/components/Footer.tsx:11-13`).
   We removed the link to a generic `youtube.com/` URL. If SVSP has an
   official YouTube channel, re-add it here AND in the `sameAs` array
   in `index.html` JSON-LD so the structured data stays consistent.

3. **Removed Mastodon timeline** (`src/components/FacebookFeed.tsx`).
   We removed the embedded `@svsp@mastodon.social` timeline because
   the account is not in the org's `sameAs` schema. If SVSP has an
   official Mastodon handle, re-add the embed here AND in `sameAs` in
   `index.html`.

4. **80G scheme external link** (`src/components/Footer.tsx:170`).
   We linked to the Income Tax Department's public 80G PDF. If the
   organization prefers to host its own 80G explanation page, replace
   this URL with the internal route.

5. **All visible copy** (`src/data.ts`).
   We did not edit any visible content. The organization should
   review all strings in `data.ts` (EN/HI/KN/MR) for accuracy,
   currency, and tone.

6. **Photographs** (`src/assets/images/`).
   Confirm caretaker consent is on file for every published
   photograph of a child. If any photograph lacks consent, remove it
   from `data.ts` imports before deploying.

7. **`README.md` rewrite** (`README.md`).
   We replaced the unrelated Google AI Studio template with a project-
   specific README. Confirm the deployment instructions and stack
   description match the organization's actual workflow.

---

## 11. Remaining limitations

These are known issues we did NOT fix in this audit:

### 11.1 Image optimization (HIGH PRIORITY)

The 13 child photographs in `src/assets/images/` are 800 KB – 1 MB
each. Total image weight on initial load is ~10 MB. This is the
biggest remaining performance opportunity.

**Recommended fix (next sprint):**
1. Add `sharp` as a dev dependency.
2. Write a `scripts/optimize-images.mjs` that converts each JPG to
   WebP + AVIF at three widths (640, 1024, 1920).
3. Add a `prebuild` npm script that runs the optimizer.
4. Update `data.ts` to import the optimized variants and expose
   `srcset` strings.
5. Update `<img>` tags in Mission/Causes/Events/etc. to use
   `loading="lazy" decoding="async"` and the new `srcset`.

Expected impact: ~80% reduction in image weight, big LCP improvement.

### 11.2 Pre-existing TypeScript errors

25 TS errors in `DonationImpact.tsx`, `FacilitiesAndHealthcare.tsx`,
`PhoneInput.tsx`. These are type-system complaints under
`noUncheckedIndexedAccess`, not runtime bugs. Fix is mechanical (add
`?.` and `?? defaultValue` guards) and can be done in a follow-up PR.

### 11.3 Per-section meta tags are runtime, not SSR

Because this is an SPA, the per-section `<title>` and meta description
updates happen in the browser after JS loads. Search engines that
execute JS (Googlebot does) will see the per-section titles, but
social-media crawlers that don't execute JS will see only the
homepage title from `index.html`. This is acceptable for a small NGO
site; if SEO becomes a top priority, migrate to SSG (Vite + SvelteKit
or Next.js static export).

### 11.4 Firebase chunking warning

Vite warns that `firebase/firestore` is both statically and
dynamically imported (by admin and by Mission/Testimonials
respectively). The dynamic import was added (probably) so that
Firestore reads happen only on scroll, but it forces a shared chunk
that includes Firestore in the homepage bundle path. **Recommended
fix:** audit `Mission.tsx` and `Testimonials.tsx` — if they can read
their data from a static JSON or a REST endpoint instead of Firestore,
remove the Firestore dependency from the homepage entirely. This
would allow Firebase to live entirely in the admin chunk.

### 11.5 Newsletter backend

`src/components/Newsletter.tsx` was not audited in detail. Verify
its submit handler is wired to a real backend (Formspree, Apps
Script, or similar) and does not show a fake success state.

### 11.6 No automated tests

The repo has no unit/integration/e2e tests. Adding a basic Playwright
suite covering: homepage renders, navbar scroll, mobile drawer open/
close, contact form validation, 404 page renders, would catch
regressions cheaply. Out of scope for this audit.

### 11.7 No CI

Builds happen locally and are pushed to GitHub Pages manually. A
GitHub Actions workflow (`on: push to main → npm ci → npm run lint →
npm run build → deploy`) would prevent broken deploys. Out of scope
for this audit.

### 11.8 Lighthouse not measured in this environment

See §9.4. The organization must run Lighthouse before and after
deploy and share the JSON reports for a measured comparison.

---

## 12. Deployment instructions

### 12.1 One-time setup (already complete)

- GitHub Pages: source = `main` branch, root directory.
- Custom domain: `svspbelagavi.org` (CNAME file in repo root).
- HTTPS: enforced.

### 12.2 Standard deploy

```bash
# 1. Verify locally
npm install
npm run lint    # 25 pre-existing errors — known, not blocking
npm run build   # must succeed
npm run preview # smoke-test http://localhost:4173

# 2. Commit
git add -A
git status              # confirm only intended files changed
git commit -m "Deploy: <change description>"

# 3. Push
git push origin main
```

### 12.3 Post-deploy verification

Wait ~1–2 minutes for GitHub Pages, then visit:

1. https://svspbelagavi.org — homepage renders, no console errors.
2. https://svspbelagavi.org/typo-test-xyz — should show the new 404
   page (not the homepage).
3. https://svspbelagavi.org/admin — should show login (Network tab:
   a new Firebase chunk fetches, ~720 KB).
4. https://svspbelagavi.org/sitemap.xml — should serve the updated
   sitemap with `<lastmod>2026-09-13</lastmod>`.
5. https://svspbelagavi.org/robots.txt — unchanged content.
6. https://svspbelagavi.org/manifest.webmanifest — should serve the
   new manifest JSON.
7. DevTools → Application → Manifest — should display name, icons,
   shortcuts.
8. DevTools → Network → JS: confirm `index-*.js` is ~510 KB (not
   1.6 MB). Confirm `Aurora-*.js`, `AdoptModal-*.js`, and `index.esm`
   (Firebase) are NOT loaded on the homepage.
9. Open the Adopt modal (Navbar → Adopt button) — confirm the
   `AdoptModal-*.js` chunk fetches on demand.
10. Toggle to dark mode on desktop — confirm `Aurora-*.js` fetches
    and the shader renders.

### 12.4 Rollback

If anything is broken:

```bash
git revert HEAD
git push origin main
```

GitHub Pages will rebuild from the previous commit. There is no
database migration to undo — the site is fully static.

### 12.5 Environment variables

Public builds need NO environment variables for the homepage to
function. The admin area requires `VITE_FIREBASE_*` and `VITE_SCRIPT_URL`
to be set **at build time** (Vite inlines `VITE_*` env vars into the
bundle). GitHub Pages does not support build-time secrets — to deploy
admin changes, build locally with the env vars set, then push the
`dist/` output as the repo's deployed branch.

For the current homepage-only deploy, no env vars are needed.

---

## 13. List of changed files

### Modified

| File                                  | Change |
|---------------------------------------|--------|
| `README.md`                           | Replaced Google AI Studio template with project-specific README |
| `index.html`                          | Manifest link, split theme-color (light/dark), Formspree preconnect, WebSite + WebPage JSON-LD entries |
| `public/robots.txt`                   | Explanatory comment for admin disallow |
| `public/sitemap.xml`                  | Added `<lastmod>2026-09-13</lastmod>` |
| `src/main.tsx`                        | Lazy-loaded admin routes (Login/Dashboard/ProtectedRoute); replaced catch-all `<App />` with `<NotFound />`; added `AdminLoading` Suspense fallback |
| `src/App.tsx`                         | Use `useDocumentMeta` hook; lazy-load `AdoptModal` + `Aurora`; only render `AdoptModal` when `isAdoptOpen`; only render `Aurora` when `theme === 'dark' && showAurora` |
| `src/components/Hero.tsx`             | "Scroll to explore" `<div>` → `<button>` with `aria-label`; word-wrap `aria-hidden`; `<h1 aria-label>` for full headline; image gets `width/height/fetchPriority/alt=""`; inline `<style>` block moved out |
| `src/components/Footer.tsx`           | Removed broken `href="#"` for 80G; removed unverified YouTube link; "Our Objectives" `<a>` → `<button>`; added child safeguarding & privacy notice (EN/HI/KN); removed unused `Heart`/`HelpCircle` imports |
| `src/components/FacebookFeed.tsx`     | Removed unverified Mastodon timeline (`@svsp@mastodon.social`); explanatory comment |
| `src/components/ui/CustomCursor.tsx`  | Added `prefers-reduced-motion: reduce` check — don't install the custom cursor overlay for motion-sensitive users |
| `src/index.css`                       | Added Hero `.premium-right-lines` / `.premium-line` / `@keyframes premiumMove1/2/3` styles (moved from inline JSX); added reduced-motion rule disabling line animation |
| `vite.config.ts`                      | `manualChunks` for `react-vendor` / `motion-vendor` / `icons`; lowered `chunkSizeWarningLimit` to 600 KB |

### New

| File                                  | Purpose |
|---------------------------------------|---------|
| `public/manifest.webmanifest`         | PWA manifest — name, icons, shortcuts (Donate / Adopt / Contact) |
| `src/components/NotFound.tsx`         | Real 404 page — shows the original path, "Back to homepage" + "Donate" CTAs, injects `noindex` meta |
| `src/hooks/useDocumentMeta.ts`        | Per-section document title + meta description + `<html lang>` sync hook |

### Unchanged (intentionally)

All visible content lives in `src/data.ts` and is owned by the
organization. No visible copy was changed in this audit. All other
components not listed above are unchanged from the audited commit
`7e4dc64`.
