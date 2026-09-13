# SVSP Belagavi — Website

Official website of **Swami Vivekanand Seva Pratishthan (SVSP)**, a registered
humanitarian NGO in Belagavi, Karnataka, India, caring for orphaned and
underprivileged children since 1982.

🌐 **Live:** https://svspbelagavi.org
📦 **Repo:** https://github.com/svspbelagavi/svspbelagavi.github.io

---

## Stack

| Layer       | Choice                                   |
|-------------|------------------------------------------|
| Framework   | Vite + React 19 + TypeScript             |
| Styling     | Tailwind CSS v4 (CSS-first config)      |
| Animation   | `motion` (formerly framer-motion)        |
| Icons       | `lucide-react`                          |
| Routing     | `react-router-dom` v7                    |
| Backend     | Firebase (admin area only, lazy-loaded) |
| Forms       | Formspree (contact) + Google Apps Script (adopt modal) |
| Hosting     | GitHub Pages + custom domain (CNAME)     |

The public site is a single-page application (SPA). The admin area at
`/admin` and `/dashboard` is split into a separate lazy-loaded chunk so
its Firebase dependency (~720 KB) is never fetched by homepage visitors.

---

## Local development

**Prerequisites:** Node.js ≥ 20.

```bash
npm install

# Dev server on http://localhost:5173 (vite) or :3000 (npm script)
npm run dev

# Type-check
npm run lint

# Production build → dist/
npm run build

# Preview the built bundle
npm run preview

# Clean build artefacts
npm run clean
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable                     | Purpose                                  |
|------------------------------|------------------------------------------|
| `VITE_FIREBASE_API_KEY`      | Firebase Auth (admin only)               |
| `VITE_FIREBASE_AUTH_DOMAIN`  | e.g. `svsp-admin.firebaseapp.com`        |
| `VITE_FIREBASE_PROJECT_ID`   | e.g. `svsp-admin`                        |
| `VITE_FIREBASE_STORAGE_BUCKET` |                                        |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` |                                  |
| `VITE_FIREBASE_APP_ID`       |                                          |
| `VITE_SCRIPT_URL`            | Google Apps Script URL for the Adopt modal |

> **Note:** The public contact form uses [Formspree](https://formspree.io)
> (endpoint hardcoded in `src/components/ContactSection.tsx`). The Adopt
> modal in `src/components/AdoptModal.tsx` uses Google Apps Script via
> `VITE_SCRIPT_URL`. Never commit `.env.local`.

---

## Project structure

```
.
├── index.html              # Document shell with SEO meta + JSON-LD
├── public/
│   ├── 404.html            # GitHub Pages SPA fallback
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── manifest.webmanifest
│   ├── logo.png
│   ├── og-banner.jpg
│   ├── donors/             # Donor logos
│   └── documents/          # Public-facing PDFs (CARA, registration)
├── src/
│   ├── main.tsx            # Entry — routes + lazy-loaded admin
│   ├── App.tsx             # Homepage SPA shell
│   ├── index.css           # Tailwind v4 + design tokens + Hero styles
│   ├── data.ts             # Translations (EN/HI/KN/MR) + content
│   ├── types.ts            # Shared types
│   ├── hooks/
│   │   └── useDocumentMeta.ts  # Per-section <title>/description/<html lang>
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Mission.tsx
│   │   ├── Causes.tsx
│   │   ├── FacebookFeed.tsx
│   │   ├── DonationImpact.tsx
│   │   ├── NewsSection.tsx
│   │   ├── EventsSection.tsx
│   │   ├── FacilitiesAndHealthcare.tsx
│   │   ├── Testimonials.tsx
│   │   ├── KeyDonors.tsx
│   │   ├── ContactSection.tsx
│   │   ├── Newsletter.tsx
│   │   ├── Footer.tsx
│   │   ├── AdoptModal.tsx         # Lazy-loaded
│   │   ├── NotFound.tsx           # Real 404 page
│   │   └── ui/                    # Reusable primitives
│   ├── admin/                     # Lazy-loaded — only fetched on /admin
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── ProtectedRoute.tsx
│   ├── firebase/config.ts         # Firebase init (admin only)
│   └── utils/validation.ts
├── vite.config.ts                # manualChunks: react / motion / icons
└── tsconfig.json
```

---

## Deployment (GitHub Pages)

This repo deploys via GitHub Pages on every push to `main`. The custom
domain `svspbelagavi.org` is configured via the `CNAME` file.

### One-time setup (already done)

1. Repo → Settings → Pages → Source = `main` / root.
2. Repo → Settings → Pages → Custom domain = `svspbelagavi.org` → Enforce HTTPS.

### On every push to `main`

```bash
git add -A
git commit -m "Deploy: <change description>"
git push origin main
```

GitHub Pages will rebuild and serve from `dist/`. There is no separate CI
build step — GitHub Pages serves the built `dist/` files. (If you change
the build process, run `npm run build` locally and verify `dist/index.html`
exists before pushing.)

### Verifying a deployment

1. Wait ~1–2 minutes for GitHub Pages to rebuild.
2. Visit https://svspbelagavi.org and verify the homepage loads.
3. Visit https://svspbelagavi.org/sitemap.xml, /robots.txt, /manifest.webmanifest.
4. Visit an unknown path (e.g. `/xyz`) → should show the real 404 page.
5. Visit `/admin` → should show the admin login (lazy-loaded).

---

## Accessibility

The site targets WCAG 2.2 AA. Highlights:

- Skip-to-content link on every page.
- `:focus-visible` outline globally.
- Mobile drawer: Escape closes, body scroll locked, focus restored to
  the trigger button on close, click-outside closes, viewport resize
  past `lg` closes.
- `<html lang>` updates dynamically when the UI language changes
  (EN / HI / KN / MR) — see `src/hooks/useDocumentMeta.ts`.
- All decorative animations honour `prefers-reduced-motion: reduce`
  (Hero lines, Aurora background, custom cursor).
- Form labels, `aria-live` error regions, `role="alert"` on validation.

---

## SEO

- Unique `<title>` and meta description per in-view section
  (`useDocumentMeta`).
- Canonical URL, OpenGraph, Twitter card, theme-color.
- JSON-LD `@graph` with `Organization`, `FAQPage`, `WebSite`, `WebPage`.
- `sitemap.xml` + `robots.txt` (admin routes disallowed).
- Real 404 page (no silent SPA fallback to homepage).

---

## Child safeguarding & privacy

The organization works with children. We:

- Publish child photographs only with the consent of SVSP caretakers.
- Never publish a child's full name, date of birth, case history, or
  other personally identifying information.
- Follow CARA guidelines for any adoption-related communication.
- Display a safeguarding notice in the footer of every page.
- The Hero background photo uses a **stock Unsplash image** (not actual
  SVSP children) to avoid exposing any child's likeness without
  consent.

If you have a concern about a child's welfare or about how an image is
used, contact the trust office using the details in the footer.

---

## License & content

Source code: see repository.
Content (text, photographs, logos, donor marks): © Swami Vivekanand
Seva Pratishthan. All rights reserved. Donor logos are property of
their respective organizations and are used here with permission.

---

## Contributing

Pull requests welcome. Please run `npm run lint` and `npm run build`
before submitting.
