import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { auth } from "../firebase/config";
import { motion } from "motion/react";

/**
 * SVSP Admin Login
 *
 * Previously this was raw unstyled HTML with a hardcoded `window.location.href = "/dashboard"`
 * that ignored the React Router basename (so it broke under /swami-vivekanand-seva-pratishthan).
 * Now uses `useNavigate()` (basename-aware) and is fully styled to match the main site.
 */
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // basename-aware: works under both /swami-vivekanand-seva-pratishthan and / (custom domain)
      navigate("/dashboard");
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Friendlier messages for the common auth errors
      const code = err.code || "";
      const friendly =
        code === "auth/invalid-credential"
          ? "Incorrect email or password. Please try again."
          : code === "auth/too-many-requests"
          ? "Too many failed attempts. Try again in a few minutes."
          : code === "auth/network-request-failed"
          ? "Network error. Please check your connection."
          : err.message || "Login failed. Please try again.";
      setMessage(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0c0a08] text-amber-50 relative overflow-hidden">
      {/* ambient glow matching the public site */}
      <div className="pointer-events-none absolute -top-40 -left-32 w-[480px] h-[480px] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 w-[480px] h-[480px] rounded-full bg-rose-500/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-300/70 hover:text-amber-200 transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to site
        </a>

        <div className="bg-[#152128]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ShieldCheck className="text-amber-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
                SVSP Admin Login
              </h1>
              <p className="text-[11px] text-amber-200/60 font-mono tracking-wide">
                Restricted access · Authorised staff only
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-amber-100/80 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-300/60 pointer-events-none"
                />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="you@svspbelagavi.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0c0a08]/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white placeholder:text-amber-100/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#152128] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-amber-100/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-300/60 pointer-events-none"
                />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0c0a08]/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-white placeholder:text-amber-100/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#152128] transition"
                />
              </div>
            </div>

            {message && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium p-3 rounded-xl"
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm tracking-wide py-3 rounded-xl shadow-lg shadow-amber-900/30 transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-amber-100/40 mt-6 font-mono">
          Swami Vivekanand Seva Pratishthan · Belagavi
        </p>
      </motion.div>
    </div>
  );
}
