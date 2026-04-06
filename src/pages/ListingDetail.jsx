import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AppNavbar from "../components/AppNavbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";


const COND = { NEW: "Brand New", LIKE_NEW: "Like New", GOOD: "Good", FAIR: "Fair", POOR: "Poor" };
const TYPE_BADGE = {
  SELL: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  RENT: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  BOTH: "text-purple bg-purple/10 border-purple/20",
};
const CAT_GRADIENTS = {
  Textbooks: "from-blue-900/40 to-blue-950",
  Electronics: "from-purple-900/40 to-purple-950",
  Instruments: "from-amber-900/40 to-amber-950",
  Furniture: "from-stone-800/40 to-stone-900",
  Clothing: "from-pink-900/40 to-pink-950",
  Sports: "from-green-900/40 to-green-950",
  Stationery: "from-cyan-900/40 to-cyan-950",
  Other: "from-zinc-800/40 to-zinc-900",
};

function SellerAvatar({ seller, size = "w-11 h-11", text = "text-sm" }) {
  const initials = seller?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";
  return seller?.profilePicUrl ? (
    <img src={seller.profilePicUrl} alt={seller.name} className={`${size} rounded-full object-cover border border-purple/20`} />
  ) : (
    <div className={`${size} rounded-full bg-purple/15 border border-purple/20 flex items-center justify-center text-purple font-bold ${text}`}>
      {initials}
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 animate-pulse">
      <div className="h-3 w-24 bg-surface rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-[4/3] bg-surface border border-border rounded-2xl" />
        <div className="space-y-4">
          <div className="h-3 w-1/3 bg-surface rounded" />
          <div className="h-8 w-4/5 bg-surface rounded" />
          <div className="h-10 w-2/5 bg-surface rounded" />
          <div className="h-32 bg-surface border border-border rounded-2xl" />
          <div className="h-14 bg-surface border border-border rounded-2xl" />
          <div className="h-12 bg-surface rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const raw = localStorage.getItem("user");
  const currentUser = raw ? JSON.parse(raw) : null;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [contacting, setContacting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API}/api/listings/${id}`);
        setListing(data.listing);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleContact = async () => {
    setContacting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const txType = listing.type === "RENT" ? "RENT" : "BUY";
      const { data } = await axios.post(
        `${API}/api/transactions`,
        { listingId: listing.id, type: txType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/messages?conv=${data.transaction.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to open chat. Please try again.");
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-primary">
        <AppNavbar />
        <Skeleton />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-bg text-primary">
        <AppNavbar />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-primary font-semibold text-lg mb-1">Listing not found</p>
          <p className="text-muted text-sm mb-6">This listing may have been removed or the link is incorrect.</p>
          <button onClick={() => navigate("/browse")} className="text-sm font-semibold text-purple hover:text-purple/80 transition-colors">
            ← Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const isSeller = currentUser?.id === listing.sellerId || currentUser?.id === listing.seller?.id;
  const images = listing.images ?? [];
  const gradient = CAT_GRADIENTS[listing.category] ?? CAT_GRADIENTS.Other;

  return (
    <div className="min-h-screen bg-bg text-primary">
      <AppNavbar />

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate("/browse")}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Browse
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Image gallery ── */}
          <div className="space-y-3">
            <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-gradient-to-br ${gradient}`}>
              {images.length > 0 ? (
                <img
                  src={images[activeIdx]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <svg className="w-20 h-20 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v13.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75A.75.75 0 013.75 3z" />
                  </svg>
                </div>
              )}
              {/* Status badge */}
              {listing.status !== "AVAILABLE" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg uppercase tracking-widest">
                    {listing.status}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeIdx ? "border-purple" : "border-border hover:border-purple/40"
                      }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details panel ── */}
          <div className="space-y-5">

            {/* Badges + title + price */}
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-3">
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${TYPE_BADGE[listing.type]}`}>
                  {listing.type === "SELL" ? "For Sale" : listing.type === "RENT" ? "For Rent" : "Sale & Rent"}
                </span>
                <span className="text-[10px] text-muted/60 font-medium">{listing.category}</span>
                <span className="text-[10px] text-muted/30">·</span>
                <span className="text-[10px] text-muted/60">{COND[listing.condition]}</span>
              </div>

              <h1
                className="text-2xl sm:text-3xl font-extrabold text-primary leading-tight mb-3"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {listing.title}
              </h1>

              <div className="flex items-baseline gap-4">
                {listing.price != null && (
                  <p className="text-3xl font-bold text-primary" style={{ fontFamily: "'Syne', sans-serif" }}>
                    ₹{listing.price.toLocaleString("en-IN")}
                  </p>
                )}
                {listing.rentPerDay != null && (
                  <p className={`font-semibold ${listing.price != null ? "text-xl text-muted" : "text-3xl text-primary"}`} style={{ fontFamily: "'Syne', sans-serif" }}>
                    ₹{listing.rentPerDay}<span className="text-sm font-normal text-muted">/day</span>
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface border border-border rounded-2xl p-5">
              <p className="text-[10px] font-semibold text-muted/50 uppercase tracking-widest mb-2">Description</p>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Seller card */}
            <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
              <SellerAvatar seller={listing.seller} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary">{listing.seller?.name}</p>
                <p className="text-xs text-muted truncate">{listing.seller?.department}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted/50">{listing._count?.transactions ?? 0}</p>
                <p className="text-[10px] text-muted/30">inquiries</p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* CTA */}
            {isSeller ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/listings")}
                  className="py-3 rounded-xl border border-border text-sm text-muted hover:text-primary hover:border-border/80 transition-all"
                >
                  Manage
                </button>
                <button
                  onClick={() => navigate("/listings/new")}
                  className="py-3 rounded-xl bg-surface border border-border text-sm text-muted hover:text-primary hover:border-purple/30 transition-all"
                >
                  Post similar
                </button>
              </div>
            ) : (
              <button
                onClick={handleContact}
                disabled={contacting || listing.status !== "AVAILABLE"}
                className="w-full py-3.5 rounded-xl bg-purple hover:bg-purple/90 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {contacting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Opening chat…
                  </span>
                ) : listing.status !== "AVAILABLE" ? (
                  "No Longer Available"
                ) : (
                  "Contact Seller"
                )}
              </button>
            )}

            {/* Posted date */}
            <p className="text-[10px] text-muted/30 text-center">
              Listed {new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
