import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";


function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="32" r="16" fill="#111111" />
      <circle cx="42" cy="21" r="14" fill="#3D3580" />
      <circle cx="42" cy="43" r="14" fill="#2A2A2A" />
      <circle cx="22" cy="32" r="7" fill="#F5F5F5" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Browse", path: "/browse" },
  { label: "My Listings", path: "/listings" },
  { label: "Messages", path: "/messages" },
];

// ── Notification dropdown ─────────────────────────────────────────────────────
function NotifDropdown({ notifs, onClose, onApprove, onDecline, approving }) {
  const navigate = useNavigate();

  const go = (convId) => {
    onClose();
    navigate(`/messages?conv=${convId}`);
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-xs font-semibold text-primary">Notifications</p>
        {notifs.length > 0 && (
          <span className="text-[10px] text-muted/50">{notifs.length} pending</span>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-9 px-4 text-center">
          <div className="w-10 h-10 rounded-xl bg-bg border border-border flex items-center justify-center mb-2.5">
            <svg className="w-5 h-5 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <p className="text-xs text-muted">You're all caught up!</p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
          {notifs.map((n) => (
            <div key={n.id} className="px-4 py-3 hover:bg-bg/50 transition-colors">
              {/* Header */}
              <div className="flex items-start gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary leading-snug">
                    {n.buyer?.name} wants to {n.type === "RENT" ? "rent" : "buy"}
                  </p>
                  <button
                    onClick={() => go(n.id)}
                    className="text-[11px] text-purple hover:text-purple/80 truncate block max-w-full text-left"
                  >
                    {n.listing?.title}
                  </button>
                </div>
              </div>
              {/* Approve / Decline */}
              <div className="flex items-center gap-2 ml-9">
                <button
                  onClick={() => onDecline(n.id)}
                  disabled={approving === n.id}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/8 transition-all disabled:opacity-40"
                >
                  Decline
                </button>
                <button
                  onClick={() => onApprove(n.id)}
                  disabled={approving === n.id}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-green-500/12 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-40"
                >
                  {approving === n.id ? "…" : "✓ Approve"}
                </button>
                <button
                  onClick={() => go(n.id)}
                  className="ml-auto text-[11px] text-muted/50 hover:text-muted transition-colors"
                >
                  Chat →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-2.5 border-t border-border">
        <button
          onClick={() => { onClose(); navigate("/messages"); }}
          className="text-xs text-purple hover:text-purple/80 transition-colors w-full text-left"
        >
          View all messages →
        </button>
      </div>
    </div>
  );
}

// ── Main navbar ───────────────────────────────────────────────────────────────
export default function AppNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const bellRef = useRef();

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";
  const avatarSrc = user?.profilePicUrl ?? null;

  const [open, setOpen] = useState(false); // bell dropdown open
  const [notifs, setNotifs] = useState([]);    // pending requests as seller
  const [approving, setApproving] = useState(null); // id currently being approved

  // Load pending requests for the notification bell
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data } = await axios.get(`${API}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const convs = data.conversations ?? [];
      // Requests the logged-in user needs to act on (as seller, status=PENDING)
      const pending = convs.filter(
        (c) => c.status === "PENDING" && c.listing?.seller?.id === user?.id
      );
      setNotifs(pending);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 s
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [pathname]); // re-fetch when navigating

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleApprove = async (transactionId) => {
    setApproving(transactionId);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API}/api/transactions/${transactionId}/status`,
        { status: "ACTIVE" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifs((prev) => prev.filter((n) => n.id !== transactionId));
    } catch { /* silent */ }
    finally { setApproving(null); }
  };

  const handleDecline = async (transactionId) => {
    setApproving(transactionId);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API}/api/transactions/${transactionId}/status`,
        { status: "CANCELLED" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifs((prev) => prev.filter((n) => n.id !== transactionId));
    } catch { /* silent */ }
    finally { setApproving(null); }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">

        {/* Logo */}
        <button onClick={() => navigate("/home")} className="flex items-center gap-2.5 group shrink-0">
          <LogoMark size={28} />
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            <span className="text-primary">Uni</span><span className="text-purple">Pool</span>
          </span>
        </button>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, path }) => {
            const isActive = pathname === path || pathname.startsWith(path + "/");
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`text-sm px-3.5 py-1.5 rounded-lg transition-all duration-150
                  ${isActive
                    ? "text-primary bg-surface border border-border font-medium"
                    : "text-muted hover:text-primary hover:bg-surface"
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right — notification bell + user */}
        <div className="flex items-center gap-3">

          {/* Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className={`relative p-2 rounded-lg transition-all duration-150
                ${open ? "text-primary bg-surface border border-border" : "text-muted hover:text-primary hover:bg-surface"}`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {notifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 leading-none">
                  {notifs.length > 9 ? "9+" : notifs.length}
                </span>
              )}
            </button>

            {open && (
              <NotifDropdown
                notifs={notifs}
                onClose={() => setOpen(false)}
                onApprove={handleApprove}
                onDecline={handleDecline}
                approving={approving}
              />
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-border">
            <button onClick={() => navigate("/profile")} className="shrink-0">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-purple/25 hover:border-purple/60 transition-colors" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-purple/20 border border-purple/25 hover:border-purple/60 flex items-center justify-center text-purple text-xs font-bold transition-colors">
                  {initials}
                </div>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-muted/60 hover:text-muted transition-colors duration-150 hidden sm:block"
            >
              Sign out
            </button>
          </div>
        </div>

      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex border-t border-border">
        {NAV_LINKS.map(({ label, path }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors duration-150
                ${isActive ? "text-purple border-t border-purple -mt-px" : "text-muted hover:text-primary"}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
