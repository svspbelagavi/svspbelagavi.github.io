import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { motion } from "motion/react";
import { Loader2, Save, LayoutDashboard, FileText, Newspaper, Phone } from "lucide-react";

/**
 * SVSP Admin Dashboard
 *
 * Defence-in-depth: even though /dashboard is wrapped in <ProtectedRoute>,
 * we still verify auth here. If a stale module somehow mounts this component
 * without an authenticated user, we refuse to fetch data.
 */
export default function Dashboard() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [mission, setMission] = useState("");
  const [about, setAbout] = useState("");
  const [donation, setDonation] = useState("");
  const [established, setEstablished] = useState("");
  const [boysCapacity, setBoysCapacity] = useState("");
  const [girlsCapacity, setGirlsCapacity] = useState("");
  const [childrenCount, setChildrenCount] = useState("");

  const [events, setEvents] = useState("");
  const [news, setNews] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authed) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [siteDoc, newsDoc, eventsDoc, contactDoc, missionDoc] = await Promise.all([
        getDoc(doc(db, "siteContent", "main")),
        getDoc(doc(db, "news", "main")),
        getDoc(doc(db, "events", "main")),
        getDoc(doc(db, "Contact", "main")),
        getDoc(doc(db, "siteContent", "mission")),
      ]);

      if (siteDoc.exists()) {
        setMission(siteDoc.data().mission || "");
        setAbout(siteDoc.data().about || "");
        setDonation(siteDoc.data().donation || "");
      }
      if (missionDoc.exists()) {
        setEstablished(missionDoc.data().established || "");
        setBoysCapacity(missionDoc.data().boysCapacity || "");
        setGirlsCapacity(missionDoc.data().girlsCapacity || "");
        setChildrenCount(missionDoc.data().childrenCount || "");
      }
      if (newsDoc.exists()) setNews(newsDoc.data().content || "");
      if (eventsDoc.exists()) setEvents(eventsDoc.data().content || "");
      if (contactDoc.exists()) {
        setPhone(contactDoc.data().phone || "");
        setEmail(contactDoc.data().email || "");
        setAddress(contactDoc.data().address || "");
      }
    } catch (err) {
      console.error("[Dashboard] loadData failed:", err);
      setFeedback({ type: "err", msg: "Failed to load content from server." });
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await Promise.all([
        updateDoc(doc(db, "siteContent", "main"), { mission, about, donation }),
        updateDoc(doc(db, "news", "main"), { content: news }),
        updateDoc(doc(db, "events", "main"), { content: events }),
        updateDoc(doc(db, "Contact", "main"), { phone, email, address }),
      ]);
      setFeedback({ type: "ok", msg: "Changes saved successfully." });
    } catch (err) {
      console.error("[Dashboard] save failed:", err);
      setFeedback({ type: "err", msg: "Save failed. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0a08] text-amber-100">
        <div className="flex items-center gap-3">
          <Loader2 size={18} className="animate-spin text-amber-400" />
          <span className="font-mono text-sm">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0a08] text-amber-100 px-4">
        <div className="text-center max-w-sm">
          <p className="font-mono text-sm text-amber-300/80">
            Not authenticated. Redirecting to login…
          </p>
        </div>
      </div>
    );
  }

  const Field = ({
    label,
    icon: Icon,
    value,
    onChange,
    textarea = false,
    rows = 4,
    type = "text",
  }: {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    value: string;
    onChange: (v: string) => void;
    textarea?: boolean;
    rows?: number;
    type?: string;
  }) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-bold text-amber-100/80 uppercase tracking-wide font-mono">
        <Icon size={12} className="text-amber-400" />
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full bg-[#0c0a08]/60 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition resize-y"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0c0a08]/60 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0c0a08] text-amber-50 px-4 py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <header className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <LayoutDashboard className="text-amber-400" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
              SVSP Admin Dashboard
            </h1>
            <p className="text-xs text-amber-200/60 font-mono">
              Manage site content · Mission · News · Contact details
            </p>
          </div>
        </header>

        <div className="bg-[#152128]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Established Year" icon={FileText} value={established} onChange={setEstablished} />
            <Field label="Total Children" icon={FileText} value={childrenCount} onChange={setChildrenCount} />
            <Field label="Boys Capacity" icon={FileText} value={boysCapacity} onChange={setBoysCapacity} />
            <Field label="Girls Capacity" icon={FileText} value={girlsCapacity} onChange={setGirlsCapacity} />
          </div>

          <Field label="Mission" icon={FileText} value={mission} onChange={setMission} textarea rows={4} />
          <Field label="About Us" icon={FileText} value={about} onChange={setAbout} textarea rows={4} />
          <Field label="Donation Details" icon={FileText} value={donation} onChange={setDonation} textarea rows={4} />
          <Field label="Events" icon={Newspaper} value={events} onChange={setEvents} textarea rows={4} />
          <Field label="News" icon={Newspaper} value={news} onChange={setNews} textarea rows={4} />
          <Field label="Phone" icon={Phone} value={phone} onChange={setPhone} />
          <Field label="Email" icon={Phone} value={email} onChange={setEmail} type="email" />
          <Field label="Address" icon={Phone} value={address} onChange={setAddress} textarea rows={3} />

          {feedback && (
            <div
              role="alert"
              aria-live="polite"
              className={`flex items-center gap-2 text-xs font-medium p-3 rounded-xl border ${
                feedback.type === "ok"
                  ? "bg-green-500/10 border-green-500/30 text-green-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {feedback.msg}
            </div>
          )}

          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 text-slate-950 font-extrabold text-sm tracking-wide py-3 px-8 rounded-xl shadow-lg shadow-amber-900/30 transition-all duration-200 active:scale-[0.98]"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? "Saving…" : "Save Changes"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
