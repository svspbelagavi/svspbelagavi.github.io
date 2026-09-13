import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Navigate } from 'react-router-dom';

/**
 * Auth guard for the admin Dashboard.
 *
 * Waits for Firebase Auth to resolve the current user; redirects unauthenticated
 * visitors to /admin (the login page) instead of mounting the protected route.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0a08] text-amber-100">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-sm tracking-wide">Loading admin…</span>
        </div>
      </div>
    );
  }

  return authed ? <>{children}</> : <Navigate to="/admin" replace />;
}
