import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import NotFound from './components/NotFound';
import './index.css';

/* ──────────────────────────────────────────────────────────────────────
   Lazy-loaded admin area
   ──────────────────────────────────────────────────────────────────────
   The admin Login + Dashboard pull in the entire Firebase SDK (auth +
   firestore + app). Eager-loading them on the homepage cost every visitor
   ~200KB of JS they would never use. They are now split into a separate
   chunk that is only fetched when a user actually navigates to /admin or
   /dashboard.
   ────────────────────────────────────────────────────────────────────── */
const Login = lazy(() => import('./admin/Login'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const ProtectedRoute = lazy(() => import('./admin/ProtectedRoute'));

/** Minimal loading state shown while a lazy chunk is being fetched. */
function AdminLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        color: '#4a4438',
        background: '#f7f4ee',
      }}
    >
      Loading…
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*
      basename removed for the svspbelagavi.org domain migration.
      When deploying back to GitHub Pages under /swami-vivekanand-seva-pratishthan,
      set basename="/swami-vivekanand-seva-pratishthan" again, or — preferred —
      serve from a custom domain root.
    */}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        {/* Admin area — lazy-loaded to keep Firebase out of the homepage bundle */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminLoading />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<AdminLoading />}>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Suspense>
          }
        />

        {/* Genuine 404 — previously this rendered <App />, which silently
            showed the homepage for any typo URL. Now we render a real 404
            page so users + search engines know the URL doesn't exist. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
