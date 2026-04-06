import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppNavbar from "../components/AppNavbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";


const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "AVAILABLE", label: "Available" },
  { value: "SOLD", label: "Sold" },
  { value: "RENTED", label: "Rented" },
  { value: "INACTIVE", label: "Inactive" },
];

const STATUS_STYLE = {
  AVAILABLE: "text-green-400 bg-green-500/10 border-green-500/20",
  SOLD: "text-muted bg-border/30 border-border",
  RENTED: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  INACTIVE: "text-muted/50 bg-border/20 border-border/50",
};

const TYPE_LABEL = { SELL: "For Sale", RENT: "For Rent", BOTH: "Sale & Rent" };
const COND_LABEL = { NEW: "New", LIKE_NEW: "Like New", GOOD: "Good", FAIR: "Fair", POOR: "Poor" };

function formatPrice(listing) {
  if (listing.type === "SELL") return `₹${listing.price?.toLocaleString("en-IN")}`;
  if (listing.type === "RENT") return `₹${listing.rentPerDay}/day`;
  return `₹${listing.price?.toLocaleString("en-IN")} · ₹${listing.rentPerDay}/day`;
}

function StatCard({ value, label }) {
  return (
    <div className="bg-surface border border-border rounded-2xl px-5 py-4">
      <p className="text-2xl font-bold text-primary" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</p>
      <p className="text-muted text-xs mt-0.5">{label}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-36 bg-border/40" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 bg-border/40 rounded w-1/3" />
        <div className="h-4 bg-border/40 rounded w-4/5" />
        <div className="h-5 bg-border/40 rounded w-1/2" />
      </div>
    </div>
  );
}

function EmptyState({ onPost }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
        <svg className="w-9 h-9 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      </div>
      <p className="text-primary font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>No listings yet</p>
      <p className="text-muted text-sm max-w-xs mb-5">
        You haven't listed anything yet. Post an item and start earning from things you no longer need.
      </p>
      <button
        onClick={onPost}
        className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-purple hover:bg-purple/90 text-white transition-all duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Post your first item
      </button>
    </div>
  );
}

function ListingCard({ listing, onStatusChange, onEdit }) {
  const [busy, setBusy] = useState(false);
  const img = listing.images?.[0]?.url;

  const toggleStatus = async () => {
    const newStatus = listing.status === "INACTIVE" ? "AVAILABLE" : "INACTIVE";
    setBusy(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API}/api/listings/${listing.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onStatusChange(listing.id, newStatus);
    } catch { /* silent */ }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-border/80 transition-all duration-200 group">
      {/* Image */}
      <div className="relative h-36 bg-bg overflow-hidden">
        {img ? (
          <img src={img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v13.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75A.75.75 0 013.75 3z" />
            </svg>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLE[listing.status] ?? ""}`}>
            {listing.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] text-muted/50 font-medium uppercase tracking-widest">{listing.category}</span>
          <span className="text-[10px] text-muted/40">·</span>
          <span className="text-[10px] text-muted/50">{COND_LABEL[listing.condition]}</span>
          <span className="text-[10px] text-muted/40">·</span>
          <span className="text-[10px] text-muted/50">{TYPE_LABEL[listing.type]}</span>
        </div>
        <h3 className="text-sm font-semibold text-primary leading-snug mb-2 line-clamp-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          {listing.title}
        </h3>
        <div className="flex items-end justify-between">
          <p className="text-base font-bold text-primary" style={{ fontFamily: "'Syne', sans-serif" }}>{formatPrice(listing)}</p>
          <p className="text-[10px] text-muted/40">{listing._count?.transactions ?? 0} inquiry{listing._count?.transactions === 1 ? "" : "s"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          onClick={() => onEdit(listing.id)}
          className="flex-1 text-xs text-muted hover:text-primary border border-border hover:border-border/80 rounded-xl py-1.5 transition-colors duration-150"
        >
          Edit
        </button>
        {["SOLD", "RENTED"].includes(listing.status) ? (
          <button disabled className="flex-1 text-xs text-muted/30 border border-border/40 rounded-xl py-1.5 cursor-not-allowed">
            {listing.status === "SOLD" ? "Sold" : "Rented"}
          </button>
        ) : (
          <button
            onClick={toggleStatus}
            disabled={busy}
            className={`flex-1 text-xs rounded-xl py-1.5 transition-colors duration-150 disabled:opacity-40
              ${listing.status === "INACTIVE"
                ? "text-green-400 border border-green-500/20 hover:bg-green-500/5"
                : "text-muted/50 hover:text-muted border border-border hover:border-border/80"
              }`}
          >
            {busy ? "…" : listing.status === "INACTIVE" ? "Re-activate" : "Deactivate"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const fetchMine = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/api/listings/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListings(data.listings);
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMine();
  }, []);

  // Optimistic status update from card
  const handleStatusChange = (id, newStatus) => {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
  };

  // Navigate to edit page
  const handleEdit = (id) => navigate(`/listing/${id}/edit`);

  const filtered = tab === "all" ? listings : listings.filter((l) => l.status === tab);

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === "AVAILABLE").length,
    sold: listings.filter((l) => l.status === "SOLD").length,
    rented: listings.filter((l) => l.status === "RENTED").length,
  };

  return (
    <div className="min-h-screen bg-bg text-primary">
      <AppNavbar />

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8">

        {/* ── Header ── */}
        <div className="animate-fade-up flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-medium text-purple tracking-widest uppercase mb-1">Selling</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              My Listings<span className="text-purple">.</span>
            </h1>
            <p className="text-muted mt-2 text-sm">Manage everything you're selling or renting out.</p>
          </div>
          <button
            onClick={() => navigate("/listings/new")}
            className="shrink-0 flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-purple hover:bg-purple/90 text-white transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Post item
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="animate-fade-up-delay-1 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard value={stats.total} label="Total listings" />
          <StatCard value={stats.active} label="Available" />
          <StatCard value={stats.sold} label="Sold" />
          <StatCard value={stats.rented} label="Rented" />
        </div>

        {/* ── Status filter tabs ── */}
        <div className="animate-fade-up-delay-2 flex items-center gap-1 bg-surface border border-border rounded-xl p-1 w-fit mb-6">
          {STATUS_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all duration-150
                ${tab === value ? "bg-bg border border-border text-primary" : "text-muted hover:text-primary"}`}
            >
              {label}
              {value !== "all" && (
                <span className={`ml-1.5 text-[10px] ${tab === value ? "text-purple" : "text-muted/40"}`}>
                  {listings.filter((l) => l.status === value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState onPost={() => navigate("/listings/new")} />
          ) : (
            filtered.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>

      </main>
    </div>
  );
}
