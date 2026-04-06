import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppNavbar from "../components/AppNavbar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";


const CATEGORIES = ["Textbooks", "Electronics", "Instruments", "Furniture", "Clothing", "Sports", "Stationery", "Other"];
const CONDITIONS = [
  { value: "NEW", label: "Brand New", desc: "Never used, original packaging" },
  { value: "LIKE_NEW", label: "Like New", desc: "Used once or twice, no signs of wear" },
  { value: "GOOD", label: "Good", desc: "Light use, minor wear" },
  { value: "FAIR", label: "Fair", desc: "Visible wear but fully functional" },
  { value: "POOR", label: "Poor", desc: "Heavy wear, may have defects" },
];
const TYPES = [
  { value: "SELL", label: "For Sale", icon: "🏷️", desc: "One-time purchase" },
  { value: "RENT", label: "For Rent", icon: "📅", desc: "Recurring rental" },
  { value: "BOTH", label: "Sale & Rent", icon: "🔄", desc: "Both options" },
];

// ── Image upload preview ───────────────────────────────────────────────────────
function ImageDropzone({ files, setFiles }) {
  const inputRef = useRef();

  const handleFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/") && f.size <= 8 * 1024 * 1024);
    setFiles((prev) => [...prev, ...valid].slice(0, 5));
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      {/* Grid of picked images */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {files.map((file, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-purple text-white px-1.5 py-0.5 rounded-md">Cover</span>
              )}
            </div>
          ))}
          {files.length < 5 && (
            <button
              type="button"
              onClick={() => inputRef.current.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-purple/40 flex items-center justify-center text-muted/40 hover:text-purple/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Drop zone */}
      {files.length === 0 && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-border hover:border-purple/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center group-hover:border-purple/30 transition-colors">
            <svg className="w-6 h-6 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v13.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75A.75.75 0 013.75 3z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted">Drag & drop or <span className="text-purple font-medium">click to upload</span></p>
            <p className="text-xs text-muted/40 mt-0.5">Up to 5 images · JPEG, PNG, WebP · Max 8 MB each</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted/40 mt-2">{files.length}/5 images selected · First image is the cover photo</p>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, hint, required, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">
          {label} {required && <span className="text-purple">*</span>}
        </label>
        {hint && <span className="text-[10px] text-muted/40">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted/30 focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all duration-150";

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NewListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "SELL",
    condition: "",
    price: "",
    rentPerDay: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.category) return setError("Please select a category.");
    if (!form.condition) return setError("Please select a condition.");
    if ((form.type === "SELL" || form.type === "BOTH") && !form.price)
      return setError("Please enter a sale price.");
    if ((form.type === "RENT" || form.type === "BOTH") && !form.rentPerDay)
      return setError("Please enter a rent per day price.");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) payload.append(k, v); });
      images.forEach((img) => payload.append("images", img));

      const { data } = await axios.post(`${API}/api/listings`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/listings", { state: { newId: data.listing.id } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showPrice = form.type === "SELL" || form.type === "BOTH";
  const showRentDay = form.type === "RENT" || form.type === "BOTH";

  return (
    <div className="min-h-screen bg-bg text-primary">
      <AppNavbar />

      <main className="max-w-2xl mx-auto px-5 sm:px-8 py-10">

        {/* ── Header ── */}
        <div className="animate-fade-up mb-8">
          <button
            onClick={() => navigate("/listings")}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors mb-5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            My Listings
          </button>
          <p className="text-xs font-medium text-purple tracking-widest uppercase mb-1">New Listing</p>
          <h1 className="text-4xl font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
            Post an Item<span className="text-purple">.</span>
          </h1>
          <p className="text-muted text-sm mt-2">Fill in the details and your listing goes live instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up-delay-1">

          {/* ── Images ── */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-primary mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Photos</h2>
            <ImageDropzone files={images} setFiles={setImages} />
          </div>

          {/* ── Basic info ── */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-5">
            <h2 className="text-sm font-semibold text-primary" style={{ fontFamily: "'Syne', sans-serif" }}>Details</h2>

            <Field label="Title" required hint="Be specific and descriptive">
              <input
                type="text"
                placeholder="e.g. Engineering Mathematics Vol. 1 by R.K. Jain"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                maxLength={120}
                className={inputClass}
              />
              <p className="text-[10px] text-muted/40 mt-1 text-right">{form.title.length}/120</p>
            </Field>

            <Field label="Description" required hint="Mention edition, specs, or flaws">
              <textarea
                placeholder="Describe the item — condition details, why you're selling, included accessories…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                maxLength={1000}
                className={`${inputClass} resize-none`}
              />
              <p className="text-[10px] text-muted/40 mt-1 text-right">{form.description.length}/1000</p>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer ${!form.category ? "text-muted/30" : ""}`}
                >
                  <option value="" disabled>Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Condition" required>
                <select
                  value={form.condition}
                  onChange={(e) => set("condition", e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer ${!form.condition ? "text-muted/30" : ""}`}
                >
                  <option value="" disabled>Select…</option>
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* ── Listing type ── */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-primary mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Listing Type</h2>
            <div className="grid grid-cols-3 gap-3">
              {TYPES.map(({ value, label, icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("type", value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-150
                    ${form.type === value
                      ? "border-purple bg-purple/8"
                      : "border-border hover:border-border/80"
                    }`}
                >
                  <div className="text-xl mb-2">{icon}</div>
                  <p className={`text-xs font-semibold mb-0.5 ${form.type === value ? "text-purple" : "text-primary"}`}>{label}</p>
                  <p className="text-[10px] text-muted/50">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-primary" style={{ fontFamily: "'Syne', sans-serif" }}>Pricing</h2>

            <div className={`grid gap-4 ${showPrice && showRentDay ? "grid-cols-2" : "grid-cols-1"}`}>
              {showPrice && (
                <Field label="Sale Price (₹)" required>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50 text-sm">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </Field>
              )}
              {showRentDay && (
                <Field label="Rent per Day (₹)" required>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50 text-sm">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      value={form.rentPerDay}
                      onChange={(e) => set("rentPerDay", e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </Field>
              )}
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-red-400 text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Submit ── */}
          <div className="flex items-center gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate("/listings")}
              className="flex-1 py-3 rounded-xl border border-border text-sm text-muted hover:text-primary hover:border-border/80 transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-purple hover:bg-purple/90 active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Publishing…
                </span>
              ) : "Publish listing"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
