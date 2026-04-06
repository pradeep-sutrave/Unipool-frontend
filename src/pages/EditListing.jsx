import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AppNavbar from "../components/AppNavbar";

const API = "http://localhost:5000";

const CATEGORIES  = ["Textbooks", "Electronics", "Instruments", "Furniture", "Clothing", "Sports", "Stationery", "Other"];
const CONDITIONS  = [
  { value: "NEW",      label: "Brand New"  },
  { value: "LIKE_NEW", label: "Like New"   },
  { value: "GOOD",     label: "Good"       },
  { value: "FAIR",     label: "Fair"       },
  { value: "POOR",     label: "Poor"       },
];
const TYPES = [
  { value: "SELL", label: "For Sale",     hint: "One-time transfer"  },
  { value: "RENT", label: "For Rent",     hint: "Borrow by the day"  },
  { value: "BOTH", label: "Sale & Rent",  hint: "Buyer decides"      },
];

// ── Image thumbnail (existing, non-removable) ─────────────────────────────────
function ExistingThumb({ src, index }) {
  return (
    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
      <img src={src} alt={`img-${index}`} className="w-full h-full object-cover" />
      {index === 0 && (
        <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-semibold bg-purple/80 text-white py-0.5">
          Cover
        </span>
      )}
    </div>
  );
}

// ── New image preview (removable) ────────────────────────────────────────────
function NewThumb({ file, onRemove }) {
  const url = URL.createObjectURL(file);
  return (
    <div
      className="relative w-20 h-20 rounded-xl overflow-hidden border border-purple/30 group cursor-pointer"
      onClick={onRemove}
    >
      <img src={url} alt="new" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <span className="absolute top-1 right-1 text-[9px] bg-purple/80 text-white px-1.5 py-0.5 rounded-full">New</span>
    </div>
  );
}

// ── Field components ──────────────────────────────────────────────────────────
function Label({ children }) {
  return <label className="block text-xs font-semibold text-muted/70 uppercase tracking-widest mb-1.5">{children}</label>;
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted/40
        focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all"
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-primary
        focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all appearance-none"
    >
      {children}
    </select>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EditListing() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState("");
  const [success, setSuccess]   = useState(false);

  // Existing listing data
  const [existing, setExisting] = useState(null);

  // Form state
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("");
  const [condition,   setCondition]   = useState("");
  const [type,        setType]        = useState("SELL");
  const [price,       setPrice]       = useState("");
  const [rentPerDay,  setRentPerDay]  = useState("");
  const [newFiles,    setNewFiles]    = useState([]);

  // Load existing listing
  useEffect(() => {
    const load = async () => {
      try {
        const token    = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/api/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const l = data.listing;
        setExisting(l);
        setTitle(l.title ?? "");
        setDescription(l.description ?? "");
        setCategory(l.category ?? "");
        setCondition(l.condition ?? "");
        setType(l.type ?? "SELL");
        setPrice(l.price != null ? String(l.price) : "");
        setRentPerDay(l.rentPerDay != null ? String(l.rentPerDay) : "");
      } catch {
        setError("Listing not found or you don't have permission to edit it.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleFileChange = (e) => {
    const picks = Array.from(e.target.files ?? []);
    const totalAllowed = 5 - (existing?.images?.length ?? 0);
    setNewFiles((prev) => [...prev, ...picks].slice(0, totalAllowed));
    e.target.value = "";
  };

  const removeNew = (idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    if (!title.trim())       return "Title is required.";
    if (title.length > 100)  return "Title must be 100 characters or less.";
    if (!description.trim()) return "Description is required.";
    if (!category)           return "Please select a category.";
    if (!condition)          return "Please select a condition.";
    if ((type === "SELL" || type === "BOTH") && !price) return "Sale price is required.";
    if ((type === "RENT" || type === "BOTH") && !rentPerDay) return "Rent per day is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const form  = new FormData();
      form.append("title",       title.trim());
      form.append("description", description.trim());
      form.append("category",    category);
      form.append("condition",   condition);
      form.append("type",        type);
      if (type === "SELL" || type === "BOTH") form.append("price",      price);
      if (type === "RENT" || type === "BOTH") form.append("rentPerDay", rentPerDay);
      newFiles.forEach((f) => form.append("images", f));

      await axios.patch(`${API}/api/listings/${id}`, form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => navigate(`/listing/${id}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-primary">
        <AppNavbar />
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-1/3" />
          <div className="h-48 bg-surface border border-border rounded-2xl" />
          <div className="h-12 bg-surface rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && !existing) {
    return (
      <div className="min-h-screen bg-bg text-primary">
        <AppNavbar />
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => navigate("/listings")} className="mt-4 text-sm text-purple hover:underline">
            ← Back to My Listings
          </button>
        </div>
      </div>
    );
  }

  const totalImgs = (existing?.images?.length ?? 0) + newFiles.length;
  const canAddMore = totalImgs < 5;

  return (
    <div className="min-h-screen bg-bg text-primary">
      <AppNavbar />

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-8">

        {/* Back */}
        <button onClick={() => navigate(`/listing/${id}`)} className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors mb-6">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to listing
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium text-purple tracking-widest uppercase mb-1">Editing</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Update Listing<span className="text-purple">.</span>
          </h1>
          <p className="text-muted mt-1.5 text-sm">Make changes and save to update your listing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Images ── */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <Label>Photos ({totalImgs}/5)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {existing?.images?.map((img, i) => (
                <ExistingThumb key={img.id ?? i} src={img.url} index={i} />
              ))}
              {newFiles.map((file, i) => (
                <NewThumb key={i} file={file} onRemove={() => removeNew(i)} />
              ))}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl border border-dashed border-border hover:border-purple/40 bg-bg hover:bg-surface flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <svg className="w-5 h-5 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[10px] text-muted/40">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {existing?.images?.length > 0 && (
              <p className="text-[10px] text-muted/40 mt-2">Existing photos can't be removed. You can add {5 - totalImgs} more.</p>
            )}
          </div>

          {/* ── Title ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Title</Label>
              <span className="text-[10px] text-muted/40">{title.length}/100</span>
            </div>
            <Input
              type="text"
              placeholder="e.g. Engineering Mathematics — R.K. Jain"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* ── Description ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Description</Label>
              <span className="text-[10px] text-muted/40">{description.length}/600</span>
            </div>
            <textarea
              placeholder="Describe the condition, edition, any defects, or reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={600}
              rows={4}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted/40
                focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all resize-none"
            />
          </div>

          {/* ── Category + Condition ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="">Select condition</option>
                {CONDITIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* ── Listing type ── */}
          <div>
            <Label>Listing type</Label>
            <div className="grid grid-cols-3 gap-3">
              {TYPES.map(({ value, label, hint }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-150
                    ${type === value
                      ? "border-purple bg-purple/8 text-primary"
                      : "border-border bg-surface text-muted hover:border-border/80 hover:text-primary"
                    }`}
                >
                  <span className="text-xs font-semibold mb-0.5">{label}</span>
                  <span className="text-[10px] text-muted/50 leading-tight">{hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Price fields ── */}
          {(type === "SELL" || type === "BOTH") && (
            <div>
              <Label>Sale price (₹)</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 350"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}
          {(type === "RENT" || type === "BOTH") && (
            <div>
              <Label>Rent per day (₹)</Label>
              <Input
                type="number"
                min={0}
                placeholder="e.g. 25"
                value={rentPerDay}
                onChange={(e) => setRentPerDay(e.target.value)}
              />
            </div>
          )}

          {/* ── Error / Success ── */}
          {error && (
            <div className="flex items-start gap-2 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-500/8 border border-green-500/20 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <p className="text-green-400 text-sm font-medium">Listing updated! Redirecting…</p>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/listing/${id}`)}
              className="flex-1 py-3.5 rounded-xl border border-border text-sm text-muted hover:text-primary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className="flex-1 py-3.5 rounded-xl bg-purple hover:bg-purple/90 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </span>
              ) : "Save changes"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
