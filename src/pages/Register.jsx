import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical & Electronic Engineering",
  "Chemical Engineering",
  "Metallurgical and Materials Engineering",
  "Other",
];

function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="32" r="16" fill="#111111" />
      <circle cx="42" cy="21" r="14" fill="#3D3580" />
      <circle cx="42" cy="43" r="14" fill="#2A2A2A" />
      <circle cx="22" cy="32" r="7" fill="#F5F5F5" />
    </svg>
  );
}

// Reusable input field
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-surface border border-border rounded-xl px-4 py-3 text-primary placeholder:text-muted/40 text-sm focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all duration-200";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/register`, {
        name: form.name,
        email: form.email,
        department: form.department,
        password: form.password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Too short", color: "bg-red-500", w: "w-1/4" };
    if (p.length < 8) return { label: "Weak", color: "bg-orange-400", w: "w-2/4" };
    if (p.length < 12) return { label: "Good", color: "bg-yellow-400", w: "w-3/4" };
    return { label: "Strong", color: "bg-green-400", w: "w-full" };
  };
  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 border-r border-border relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 40%, rgba(61,53,128,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="flex items-center gap-3 relative">
          <LogoMark size={36} />
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span className="text-primary">Uni</span><span className="text-purple">Pool</span>
          </span>
        </div>

        <div className="relative">
          <p className="text-xs font-medium text-purple tracking-widest uppercase mb-4">
            Join your campus
          </p>
          <h2
            className="text-5xl font-extrabold text-primary leading-[1.1] mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            One account.<br />
            <span className="text-purple">Endless possibilities.</span>
          </h2>
          <p className="text-muted text-base leading-relaxed max-w-xs">
            List your unused items, discover what your peers are offering, and build a sustainable campus community.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3">
            {[
              "List books, instruments & gadgets",
              "Rent instead of buying new",
              "Chat directly with sellers",
              "Safe, campus-only community",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple/15 border border-purple/25 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-muted text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted/40 text-xs relative">Exclusively for RGUKT students</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <LogoMark size={30} />
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span className="text-primary">Uni</span><span className="text-purple">Pool</span>
          </span>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-7">
            <h1
              className="text-3xl font-bold text-primary mb-1.5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Create account
            </h1>
            <p className="text-muted text-sm">Join your campus marketplace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name */}
            <div className="animate-fade-up-delay-1">
              <Field label="Full Name">
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Email */}
            <div className="animate-fade-up-delay-2">
              <Field label="College Email">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@rgukt.ac.in"
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Department */}
            <div className="animate-fade-up-delay-2">
              <Field label="Department">
                <div className="relative">
                  <select
                    name="department"
                    required
                    value={form.department}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none cursor-pointer pr-10 ${form.department === "" ? "text-muted/40" : "text-primary"}`}
                  >
                    <option value="" disabled>Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d} className="bg-surface text-primary">{d}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </Field>
            </div>

            {/* Password */}
            <div className="animate-fade-up-delay-3">
              <Field label="Password">
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/50 hover:text-muted transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {/* Password strength bar */}
                {strength && (
                  <div className="mt-2">
                    <div className="h-0.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                    </div>
                    <p className="text-xs text-muted/60 mt-1">{strength.label}</p>
                  </div>
                )}
              </Field>
            </div>

            {/* Confirm Password */}
            <div className="animate-fade-up-delay-4">
              <Field label="Confirm Password">
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className={`${inputClass} pr-11 ${form.confirmPassword && form.confirmPassword !== form.password
                        ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20"
                        : form.confirmPassword && form.confirmPassword === form.password
                          ? "border-green-500/40 focus:border-green-500/60 focus:ring-green-500/20"
                          : ""
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/50 hover:text-muted transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      {showConfirm
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                      }
                    </svg>
                  </button>
                </div>
              </Field>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/15 rounded-xl px-4 py-3 animate-fade-in">
                <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="animate-fade-up-delay-5 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple hover:bg-[#5a52b8] active:scale-[0.98] text-white font-semibold py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : "Create account"}
              </button>
            </div>
          </form>

          <hr className="hr-gradient my-6" />

          <p className="text-center text-muted/60 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:text-purple transition-colors duration-150"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}