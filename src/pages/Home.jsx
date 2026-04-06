import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

function LogoMark({ size = 32 }) {
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
  { label: "Browse",      path: "/browse"   },
  { label: "My Listings", path: "/listings" },
  { label: "Messages",    path: "/messages" },
];

const ACTIONS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: "Browse Listings",
    desc: "Discover items for sale or rent posted by your peers.",
    tag: "Explore",
    path: "/browse",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    title: "Post an Item",
    desc: "List anything — textbooks, gadgets, instruments, furniture.",
    tag: "List",
    highlight: true,
    path: "/listings/new",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "Messages",
    desc: "Chat with buyers and sellers to close deals.",
    tag: "Chat",
    path: "/messages",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: "My Transactions",
    desc: "Track active rentals, purchases, and pending requests.",
    tag: "Track",
    path: "/listings",
  },
];


export default function Home() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";
  const avatarSrc = user?.profilePicUrl ?? null;

  const [stats, setStats] = useState({ listings: "-", transactions: "-", messages: "-" });

  // Fetch dashboard stats
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/api/listings/mine`, { headers }).catch(() => ({ data: { listings: [] } })),
      axios.get(`${API}/api/messages/conversations`, { headers }).catch(() => ({ data: { conversations: [] } })),
    ]).then(([listingsRes, convsRes]) => {
      const listings = listingsRes.data.listings ?? [];
      const convs    = convsRes.data.conversations ?? [];
      setStats({
        listings:     listings.filter((l) => l.status === "AVAILABLE").length,
        transactions: convs.length,
        messages:     convs.reduce((sum, c) => sum + (c.messages?.length ?? 0), 0),
      });
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-bg text-primary">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          {/* Left — logo */}
          <div className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <span
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <span className="text-primary">Uni</span><span className="text-purple">Pool</span>
            </span>
          </div>

          {/* Center — nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="text-sm text-muted hover:text-primary px-3.5 py-1.5 rounded-lg hover:bg-surface transition-all duration-150"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right — user */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-muted hover:text-primary hover:bg-surface transition-all duration-150">
              <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-border">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="w-7 h-7 rounded-full object-cover border border-purple/25"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-purple/20 border border-purple/25 flex items-center justify-center text-purple text-xs font-bold">
                  {initials}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-xs text-muted/60 hover:text-muted transition-colors duration-150 hidden sm:block"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10">

        {/* ── Welcome strip ── */}
        <div className="animate-fade-up mb-10">
          <p className="text-xs font-medium text-purple tracking-widest uppercase mb-1">
            Dashboard
          </p>
          <h1
            className="text-4xl sm:text-5xl font-extrabold text-primary leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {user
              ? <>Hey, {user.name.split(" ")[0]}<span className="text-purple">.</span></>
              : <>Welcome<span className="text-purple">.</span></>
            }
          </h1>
          <p className="text-muted mt-2 text-sm">
            What would you like to do today?
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="animate-fade-up-delay-1 grid grid-cols-3 gap-3 mb-10">
          {[
            { value: stats.listings,     label: "Active listings"  },
            { value: stats.transactions, label: "Conversations"    },
            { value: stats.messages,     label: "Messages sent"    },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="bg-surface border border-border rounded-2xl px-5 py-4"
            >
              <p
                className="text-2xl font-bold text-primary"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {value}
              </p>
              <p className="text-muted text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Action cards ── */}
        <div className="animate-fade-up-delay-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {ACTIONS.map(({ icon, title, desc, tag, highlight, path }, i) => (
            <button
              key={title}
              onClick={() => path && navigate(path)}
              className={`group text-left bg-surface border rounded-2xl p-6 transition-all duration-200 cursor-pointer
                ${highlight
                  ? "border-purple/30 hover:border-purple/60 hover:bg-purple/5"
                  : "border-border hover:border-border/80 hover:bg-surface/80"
                }`}
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200
                  ${highlight
                    ? "bg-purple/15 text-purple group-hover:bg-purple/25"
                    : "bg-bg text-muted group-hover:text-primary"
                  }`}
                >
                  {icon}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors duration-200
                  ${highlight
                    ? "text-purple bg-purple/10 border border-purple/15"
                    : "text-muted/60 bg-bg border border-border"
                  }`}
                >
                  {tag}
                </span>
              </div>
              <h3
                className={`font-semibold mb-1.5 transition-colors duration-150
                  ${highlight ? "text-primary" : "text-primary/80 group-hover:text-primary"}`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>

        {/* ── Profile card ── */}
        {user && (
          <div className="animate-fade-up-delay-3">
            <p className="text-xs font-medium text-muted uppercase tracking-widest mb-3">
              Your profile
            </p>
            <div className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="w-11 h-11 rounded-full object-cover border border-purple/25"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-purple/15 border border-purple/20 flex items-center justify-center text-purple font-bold text-base">
                    {initials}
                  </div>
                )}
                <div>
                  <p
                    className="font-semibold text-primary text-sm"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {user.name}
                  </p>
                  <p className="text-muted text-xs mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-xs text-muted/60 bg-bg border border-border rounded-lg px-3 py-1.5">
                  {user.department?.split(" ").slice(0, 2).join(" ")}
                </span>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-xs text-purple hover:text-purple/80 transition-colors duration-150 font-medium">
                  Edit →
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark size={20} />
            <span className="text-xs" style={{ fontFamily: "'Syne', sans-serif" }}>
              <span className="text-muted/50">Uni</span><span className="text-purple/50">Pool</span>
            </span>
          </div>
          <p className="text-xs text-muted/30">RGUKT Campus · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}