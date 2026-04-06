import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

// ── Logo ──────────────────────────────────────────────────────────────────────
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

// ── Departments ───────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "Computer Science and Engineering",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Mathematics and Humanities",
  "Physics",
  "Chemistry",
];

// ── Input field wrapper ───────────────────────────────────────────────────────
function Field({ label, id, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted tracking-wide uppercase">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted/50 mt-0.5">{hint}</p>}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium animate-fade-up
      ${isSuccess ? "bg-surface border-purple/30 text-primary" : "bg-surface border-red-500/30 text-red-400"}`}>
      <span className={`w-2 h-2 rounded-full ${isSuccess ? "bg-purple" : "bg-red-500"}`} />
      {message}
    </div>
  );
}

// ── Avatar display — handles both URL and initials ────────────────────────────
function Avatar({ src, initials, size = "w-20 h-20", textSize = "text-2xl" }) {
  if (src) {
    return (
      <img
        src={src}
        alt="Profile"
        className={`${size} rounded-full object-cover border-2 border-purple/30`}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-purple/15 border-2 border-purple/25 flex items-center justify-center text-purple font-bold ${textSize}`}
      style={{ fontFamily: "'Syne', sans-serif" }}
    >
      {initials}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function UpdateProfile() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const storedUser = raw ? JSON.parse(raw) : null;

  // Profile fields
  const [name, setName] = useState(storedUser?.name ?? "");
  const [department, setDepartment] = useState(storedUser?.department ?? "");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassSection, setShowPassSection] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(storedUser?.profilePicUrl ?? null);
  const [avatarPreview, setAvatarPreview] = useState(null); // local blob preview
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // General UI
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const displayAvatar = avatarPreview ?? avatarUrl;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3500);
  };

  // ── Handle file picked from disk ──────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return showToast("Image must be smaller than 5 MB.", "error");
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Upload avatar immediately when user picks a file & clicks Upload ───────
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const { data } = await axios.post(`${API}/api/users/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Persist to localStorage and update displayed URL
      localStorage.setItem("user", JSON.stringify(data.user));
      setAvatarUrl(data.user.profilePicUrl);
      setAvatarPreview(null);
      setAvatarFile(null);
      showToast("Profile picture updated!", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Upload failed.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Remove avatar ─────────────────────────────────────────────────────────
  const handleRemoveAvatar = async () => {
    // If there's just a local preview (not yet uploaded), just clear it
    if (avatarPreview && !avatarUrl) {
      setAvatarPreview(null);
      setAvatarFile(null);
      return;
    }

    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(`${API}/api/users/avatar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      setAvatarUrl(null);
      setAvatarPreview(null);
      setAvatarFile(null);
      showToast("Profile picture removed.", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not remove picture.", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Save profile info + optional password change ──────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !department) {
      return showToast("Name and department cannot be empty.", "error");
    }
    if (showPassSection) {
      if (!currentPassword) return showToast("Enter your current password.", "error");
      if (newPassword.length < 6) return showToast("New password must be at least 6 characters.", "error");
      if (newPassword !== confirmPassword) return showToast("Passwords do not match.", "error");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { name: name.trim(), department };
      if (showPassSection && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const { data } = await axios.put(`${API}/api/users/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      showToast("Profile updated successfully!", "success");
      setTimeout(() => navigate("/home"), 1600);
    } catch (err) {
      showToast(err?.response?.data?.message || "Something went wrong. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-primary">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          <button onClick={() => navigate("/home")} className="flex items-center gap-2.5 group">
            <LogoMark size={26} />
            <span
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <span className="text-primary group-hover:text-primary/90 transition-colors">Uni</span><span className="text-purple group-hover:text-purple/80 transition-colors">Pool</span>
            </span>
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to home
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10">

        {/* ── Page header ── */}
        <div className="animate-fade-up mb-10">
          <p className="text-xs font-medium text-purple tracking-widest uppercase mb-1">Account</p>
          <h1
            className="text-4xl sm:text-5xl font-extrabold text-primary leading-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Edit Profile<span className="text-purple">.</span>
          </h1>
          <p className="text-muted mt-2 text-sm">
            Update your photo, name, department, or change your password.
          </p>
        </div>

        <div className="animate-fade-up-delay-1 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left — avatar card ── */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-4 sticky top-24">

              {/* ── Avatar with overlay ── */}
              <div className="relative group">
                <Avatar src={displayAvatar} initials={initials} />

                {/* Camera overlay — click to open file picker */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                  title="Change photo"
                >
                  {uploadingAvatar ? (
                    <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  )}
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  id="avatar-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Upload / Remove buttons — only shown when relevant */}
              <div className="flex flex-col w-full gap-2">
                {/* "Upload" button appears after picking a file */}
                {avatarFile && (
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-purple hover:bg-purple/90 disabled:bg-purple/50 text-white transition-all duration-150"
                  >
                    {uploadingAvatar ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Uploading…
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload photo
                      </>
                    )}
                  </button>
                )}

                {/* "Choose photo" button when no file is staged */}
                {!avatarFile && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="w-full text-xs text-muted hover:text-primary border border-border hover:border-border/80 rounded-xl px-4 py-2 transition-colors duration-150"
                  >
                    Choose photo
                  </button>
                )}

                {/* Remove button — shown if there's a saved or previewed avatar */}
                {(avatarUrl || avatarPreview) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploadingAvatar}
                    className="w-full text-xs text-red-400/70 hover:text-red-400 border border-red-500/15 hover:border-red-500/30 rounded-xl px-4 py-2 transition-colors duration-150"
                  >
                    Remove photo
                  </button>
                )}

                <p className="text-center text-xs text-muted/40 mt-1">
                  JPEG, PNG, WebP or GIF · max 5 MB
                </p>
              </div>

              <hr className="w-full border-border" />

              {/* Mini stats */}
              <div className="w-full space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Name</span>
                  <span className="text-primary/80 font-medium truncate max-w-[130px]">{name || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Department</span>
                  <span className="text-primary/80 font-medium text-right max-w-[130px] truncate">
                    {department ? department.split(" ").slice(0, 2).join(" ") : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Member since</span>
                  <span className="text-primary/80 font-medium">
                    {storedUser?.createdAt
                      ? new Date(storedUser.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right — form ── */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic info */}
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
                <p className="text-xs font-medium text-muted uppercase tracking-widest">Basic Information</p>

                <Field label="Full Name" id="name">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arjun Sharma"
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all duration-150"
                  />
                </Field>

                <Field label="Department" id="department">
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-primary focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all duration-150 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23888888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "20px",
                    }}
                  >
                    <option value="" disabled>Select department…</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Email Address" id="email" hint="Email cannot be changed.">
                  <input
                    id="email"
                    type="email"
                    value={storedUser?.email ?? ""}
                    readOnly
                    className="w-full bg-bg/50 border border-border rounded-xl px-4 py-3 text-sm text-muted/60 cursor-not-allowed focus:outline-none"
                  />
                </Field>
              </div>

              {/* Password */}
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted uppercase tracking-widest">Change Password</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassSection((v) => !v);
                      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
                    }}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150
                      ${showPassSection
                        ? "bg-purple/10 border-purple/20 text-purple"
                        : "bg-bg border-border text-muted hover:text-primary"
                      }`}
                  >
                    {showPassSection ? "Cancel" : "Change password"}
                  </button>
                </div>

                {!showPassSection && (
                  <p className="text-xs text-muted/50">
                    Click "Change password" to update your login credentials.
                  </p>
                )}

                {showPassSection && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Current password */}
                    <Field label="Current Password" id="currentPassword">
                      <div className="relative">
                        <input
                          id="currentPassword"
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 pr-11 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all duration-150"
                        />
                        <button type="button" onClick={() => setShowCurrentPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                          <EyeIcon open={showCurrentPw} />
                        </button>
                      </div>
                    </Field>

                    {/* New password */}
                    <Field label="New Password" id="newPassword" hint="Minimum 6 characters.">
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full bg-bg border border-border rounded-xl px-4 py-3 pr-11 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:border-purple/60 focus:ring-1 focus:ring-purple/20 transition-all duration-150"
                        />
                        <button type="button" onClick={() => setShowNewPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                          <EyeIcon open={showNewPw} />
                        </button>
                      </div>
                    </Field>

                    {/* Confirm password */}
                    <Field label="Confirm New Password" id="confirmPassword">
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className={`w-full bg-bg border rounded-xl px-4 py-3 text-sm text-primary placeholder:text-muted/40 focus:outline-none focus:ring-1 transition-all duration-150
                          ${confirmPassword && confirmPassword !== newPassword
                            ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20"
                            : "border-border focus:border-purple/60 focus:ring-purple/20"}`}
                      />
                      {confirmPassword && confirmPassword !== newPassword && (
                        <p className="text-xs text-red-400 mt-1">Passwords do not match.</p>
                      )}
                    </Field>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="text-sm text-muted hover:text-primary transition-colors px-5 py-2.5 rounded-xl border border-border bg-surface"
                >
                  Cancel
                </button>
                <button
                  id="save-profile-btn"
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl bg-purple hover:bg-purple/90 disabled:bg-purple/50 text-white transition-all duration-150 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      Save Changes
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}

// ── Eye icon helper ───────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  if (open) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
