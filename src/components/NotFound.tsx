import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, ArrowLeft, FileText } from 'lucide-react';

interface NotFoundProps {
  /** Called when the user chooses "Back to home" so the SPA navbar
   *  state (activeSection, scroll position) stays in sync. */
  onGoHome?: () => void;
}

/**
 * 404 page rendered for any URL that doesn't match a real route.
 *
 * Why this exists:
 *   Previously `main.tsx` had `<Route path="*" element={<App />} />`, which
 *   meant a typo like `/donate-today` silently rendered the homepage with a
 *   200 OK. That hid broken links from users and search engines. This
 *   component renders a real 404 with the original path shown, a single
 *   CTA back to home, and an option to open the adoption enquiry modal —
 *   matching the actual top-level actions on the site.
 */
export default function NotFound({ onGoHome }: NotFoundProps) {
  const location = useLocation();

  useEffect(() => {
    // Tell search engines / logs this is genuinely not a real page.
    document.title =
      'Page Not Found — Swami Vivekanand Seva Pratishthan (SVSP), Belagavi';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, follow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-[#f7f4ee] dark:bg-[#0c0a08] px-6 py-24"
    >
      <div className="max-w-xl w-full text-center space-y-6">
        <p className="text-7xl sm:text-8xl font-black text-[#e79a1f] dark:text-[#f4b223] tracking-tight">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-[#201c16] dark:text-[#fbf8f3]">
          We couldn't find that page
        </h1>
        <p className="text-sm sm:text-base text-[#4a4438] dark:text-[#c4b9a8] leading-relaxed">
          The link may be outdated, mistyped, or the page may have moved.
          <br />
          The rest of svspbelagavi.org is still here — please use one of the
          options below.
        </p>

        <code className="block bg-[#ece4d4]/60 dark:bg-white/5 border border-[#ece4d4] dark:border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-[#4a4438] dark:text-[#c4b9a8] break-all">
          {location.pathname}
        </code>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            onClick={onGoHome}
            className="inline-flex items-center gap-2 bg-[#e79a1f] hover:bg-[#cf8712] dark:bg-[#f4b223] dark:hover:bg-[#ffc94d] text-[#1c1206] font-bold rounded-xl px-6 py-3 text-sm shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
          >
            <Home size={16} />
            Back to homepage
          </Link>
          <Link
            to="/#donation-impact"
            className="inline-flex items-center gap-2 bg-[#e0407a] hover:bg-[#c72f65] dark:bg-[#f680ac] dark:hover:bg-[#f9a0c0] text-white font-bold rounded-xl px-6 py-3 text-sm shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            <Heart size={16} className="fill-white" />
            Donate to SVSP
          </Link>
        </div>

        <p className="text-xs text-[#8a8072] dark:text-[#8a8072] pt-4 flex items-center justify-center gap-1.5">
          <ArrowLeft size={12} />
          Or use the navigation menu at the top of this page.
        </p>
      </div>
    </main>
  );
}
