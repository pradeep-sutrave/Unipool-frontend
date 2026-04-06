import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Logo mark (the three-circle UniPool mark) ─────────────────────────────────
function LogoMark({ size = 36 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="32" r="16" fill="#111111" />
      <circle cx="42" cy="21" r="14" fill="#3D3580" />
      <circle cx="42" cy="43" r="14" fill="#2A2A2A" />
      <circle cx="22" cy="32" r="7" fill="#F5F5F5" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 border-r border-border relative overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 30% 60%, rgba(61,53,128,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Top — wordmark */}
        <div className="flex items-center gap-3 relative">
          <LogoMark size={36} />
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span className="text-primary">Uni</span><span className="text-purple">Pool</span>
          </span>
        </div>

        {/* Middle — headline */}
        <div className="relative">
          <p className="text-xs font-medium text-purple tracking-widest uppercase mb-4">
            RGUKT Campus Marketplace
          </p>
          <h2
            className="text-5xl font-extrabold text-primary leading-[1.1] mb-6"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Everything you need,<br />
            <span className="text-purple">already on campus.</span>
          </h2>
          <p className="text-muted text-base leading-relaxed max-w-xs">
            Buy, sell, and rent items within your university community — textbooks, instruments, gadgets, and more.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mt-10">
            {[["Share", "Anything useful"], ["Rent", "Save money"], ["Connect", "With peers"]].map(([n, l]) => (
              <div key={n}>
                <p
                  className="text-2xl font-bold text-primary"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {n}
                </p>
                <p className="text-muted text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — footer note */}
        <p className="text-muted/40 text-xs relative">
          Exclusively for RGUKT students
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <LogoMark size={30} />
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            <span className="text-primary">Uni</span><span className="text-purple">Pool</span>
          </span>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-primary mb-1.5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Welcome back
            </h1>
            <p className="text-muted text-sm">Sign in to your campus account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="animate-fade-up-delay-1">
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@rgukt.ac.in"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-primary placeholder:text-muted/40 text-sm focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="animate-fade-up-delay-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-muted uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs text-purple/70 hover:text-purple transition-colors duration-150"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-11 text-primary placeholder:text-muted/40 text-sm focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted/50 hover:text-muted transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
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
            <div className="animate-fade-up-delay-3 pt-1">
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
                    Signing in…
                  </span>
                ) : "Sign in"}
              </button>
            </div>
          </form>

          <hr className="hr-gradient my-6" />

          <p className="text-center text-muted/60 text-sm">
            No account?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:text-purple transition-colors duration-150"
            >
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}