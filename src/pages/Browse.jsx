import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppNavbar from "../components/AppNavbar";

const API = "http://localhost:5000";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES  = ["All", "Textbooks", "Electronics", "Instruments", "Furniture", "Clothing", "Sports", "Stationery", "Other"];
const TYPES       = [{ value: "All", label: "All" }, { value: "SELL", label: "For Sale" }, { value: "RENT", label: "For Rent" }, { value: "BOTH", label: "Sale & Rent" }];
const CONDITIONS  = { NEW: "New", LIKE_NEW: "Like New", GOOD: "Good", FAIR: "Fair", POOR: "Poor" };
const SORT_OPTIONS = [{ value: "newest", label: "Newest first" }, { value: "price_asc", label: "Price: Low → High" }, { value: "price_desc", label: "Price: High → Low" }];

// ── Category gradient palettes ────────────────────────────────────────────────
const CAT_GRADIENTS = {
  Textbooks:   "from-blue-900/60 to-blue-950",
  Electronics: "from-purple-900/60 to-purple-950",
  Instruments: "from-amber-900/60 to-amber-950",
  Furniture:   "from-stone-800/60 to-stone-900",
  Clothing:    "from-pink-900/60 to-pink-950",
  Sports:      "from-green-900/60 to-green-950",
  Stationery:  "from-cyan-900/60 to-cyan-950",
  Other:       "from-zinc-800/60 to-zinc-900",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function typeLabel(type) {
  return TYPES.find((t) => t.value === type)?.label ?? type;
}

function formatPrice(listing) {
  if (listing.type === "SELL")        return `₹${listing.price?.toLocaleString("en-IN")}`;
  if (listing.type === "RENT")        return `₹${listing.rentPerDay}/day`;
  if (listing.type === "BOTH")        return `₹${listing.price?.toLocaleString("en-IN")} · ₹${listing.rentPerDay}/day`;
  return "—";
}

// ── Sub-components ────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const styles = { SELL: "bg-blue-500/15 text-blue-400 border-blue-500/20", RENT: "bg-amber-500/15 text-amber-400 border-amber-500/20", BOTH: "bg-purple/15 text-purple border-purple/20" };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles[type] ?? styles.BOTH}`}>
      {typeLabel(type)}
    </span>
  );
}

function CondBadge({ condition }) {
  const colors = { NEW: "text-green-400 bg-green-500/10", LIKE_NEW: "text-emerald-400 bg-emerald-500/10", GOOD: "text-yellow-400 bg-yellow-500/10", FAIR: "text-orange-400 bg-orange-500/10", POOR: "text-red-400 bg-red-500/10" };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors[condition] ?? ""}`}>
      {CONDITIONS[condition] ?? condition}
    </span>
  );
}

function SellerAvatar({ seller }) {
  const initials = seller.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return seller.profilePicUrl ? (
    <img src={seller.profilePicUrl} alt={seller.name} className="w-5 h-5 rounded-full object-cover" />
  ) : (
    <div className="w-5 h-5 rounded-full bg-purple/20 text-purple text-[9px] font-bold flex items-center justify-center">
      {initials}
    </div>
  );
}

function ListingCard({ listing, onClick }) {
  const gradient = CAT_GRADIENTS[listing.category] ?? CAT_GRADIENTS.Other;
  const img = listing.images?.[0]?.url;
  return (
    <button
      onClick={onClick}
      className="group bg-surface border border-border rounded-2xl overflow-hidden text-left hover:border-purple/30 hover:shadow-lg hover:shadow-purple/5 transition-all duration-200"
    >
      {/* Cover image / gradient placeholder */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {img ? (
          <img src={img} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v13.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75A.75.75 0 013.75 3z" />
            </svg>
          </div>
        )}
        {/* Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <TypeBadge type={listing.type} />
          <CondBadge condition={listing.condition} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <p className="text-[10px] text-muted/50 font-medium uppercase tracking-widest mb-1">{listing.category}</p>
        <h3 className="text-sm font-semibold text-primary leading-snug mb-2 line-clamp-2 group-hover:text-purple/90 transition-colors" style={{ fontFamily: "'Syne', sans-serif" }}>
          {listing.title}
        </h3>
        <p className="text-base font-bold text-primary mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
          {formatPrice(listing)}
        </p>
        <div className="flex items-center gap-1.5 pt-3 border-t border-border/60">
          <SellerAvatar seller={listing.seller} />
          <p className="text-xs text-muted truncate">{listing.seller.name}</p>
          <span className="ml-auto text-[10px] text-muted/40 truncate">{listing.seller.department?.split(" ")[0]}</span>
        </div>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
        <svg className="w-9 h-9 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
        </svg>
      </div>
      <p className="text-primary font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>No listings yet</p>
      <p className="text-muted text-sm max-w-xs">Be the first to list something — textbooks, gadgets, instruments, or anything your peers might need.</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-40 bg-border/40" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 bg-border/40 rounded w-1/3" />
        <div className="h-4 bg-border/40 rounded w-4/5" />
        <div className="h-5 bg-border/40 rounded w-1/2" />
        <div className="h-px bg-border/30 my-3" />
        <div className="h-3 bg-border/40 rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Browse() {
  const navigate = useNavigate();
  const [listings, setListings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [debouncedSearch, setDebounced] = useState("");
  const [activeType, setActiveType]     = useState("All");
  const [activeCategory, setActiveCat] = useState("All");
  const [sort, setSort]                 = useState("newest");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch)              params.set("search",    debouncedSearch);
      if (activeType !== "All")         params.set("type",      activeType);
      if (activeCategory !== "All")     params.set("category",  activeCategory);
      params.set("sort", sort);

      const { data } = await axios.get(`${API}/api/listings?${params}`);
      setListings(data.listings);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeType, activeCategory, sort]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return (
    <div className="min-h-screen bg-bg text-primary">
      <AppNavbar />

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8">

        {/* ── Page header ── */}
        <div className="animate-fade-up mb-8">
          <p className="text-xs font-medium text-purple tracking-widest uppercase mb-1">Marketplace</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Browse<span className="text-purple">.</span>
          </h1>
          <p className="text-muted mt-2 text-sm">Discover items for sale or rent posted by your peers.</p>
        </div>

        {/* ── Search bar ── */}
        <div className="animate-fade-up-delay-1 mb-5">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search for books, phones, instruments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl pl-11 pr-5 py-3.5 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all duration-150"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Filters row ── */}
        <div className="animate-fade-up-delay-2 flex flex-wrap items-center gap-3 mb-8">
          {/* Type pills */}
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1">
            {TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveType(value)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150
                  ${activeType === value ? "bg-purple text-white shadow-sm" : "text-muted hover:text-primary"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all duration-150
                  ${activeCategory === cat ? "bg-purple/10 border-purple/30 text-purple" : "border-border text-muted hover:text-primary hover:border-border/80"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort — pushed to right */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="ml-auto text-xs bg-surface border border-border rounded-xl px-3 py-2 text-muted focus:outline-none focus:border-purple/40 cursor-pointer"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <p className="text-xs text-muted/50 mb-5 animate-fade-in">
            {listings.length === 0 ? "No results" : `${listings.length} listing${listings.length === 1 ? "" : "s"} found`}
            {debouncedSearch && ` for "${debouncedSearch}"`}
          </p>
        )}

        {/* ── Card grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : listings.length === 0 ? (
            <EmptyState />
          ) : (
            listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => navigate(`/listing/${listing.id}`)}
              />
            ))
          )}
        </div>

      </main>
    </div>
  );
}
