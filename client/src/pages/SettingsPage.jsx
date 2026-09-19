import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import Navbar from "../components/Navbar";
import {
  User,
  Mail,
  Lock,
  Shield,
  Calendar,
  Copy,
  Check,
  Sun,
  Moon,
  Monitor,
  Bell,
  Handshake,
  Video,
  Star,
  LogOut,
  Info,
  MapPin,
  AlertTriangle,
  Eye,
  ArrowLeftRight,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

export default function SettingsPage() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  // User ID copy state
  const [copiedId, setCopiedId] = useState(false);

  // Logout confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Copy User ID to clipboard
  const handleCopyUserId = async () => {
    const idToCopy = user?._id || user?.id;
    if (!idToCopy) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(idToCopy));
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = String(idToCopy);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error("Failed to copy user ID:", err);
    }
  };

  // Perform logout
  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };

  // Format creation date safely
  const formattedMemberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Active Member";

  const userId = user?._id || user?.id || "";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans transition-colors duration-150">
      <Navbar />

      <main key={location.pathname} className="flex-1 max-w-2xl w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-7 space-y-5 sm:space-y-6 animate-page-enter">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-3.5 animate-section-enter">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--ink-muted)] mb-1">
            <Link to="/" className="hover:text-[var(--accent)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[var(--ink)]">Settings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)]">
            Settings
          </h1>
          <p className="text-xs text-[var(--ink-muted)] mt-0.5">
            Manage your account details, preferences, and privacy controls.
          </p>
        </div>

        {/* ====================================================== */}
        {/* 1. ACCOUNT SECTION */}
        {/* ====================================================== */}
        <section aria-labelledby="account-heading" className="space-y-2.5 animate-section-enter stagger-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 id="account-heading" className="text-sm font-bold text-[var(--ink)]">
                Account
              </h2>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Personal profile and account credentials
              </p>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs divide-y divide-[var(--border)] overflow-hidden">
            {/* A. My Profile Row */}
            <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold overflow-hidden shrink-0 border border-[var(--border)]">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user?.name || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--ink)] truncate">
                      {user?.name || "SkillSwap User"}
                    </h3>
                    {user?.role && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent)]">
                        {user.role === "admin" ? "Admin" : "Member"}
                      </span>
                    )}
                  </div>
                  {user?.location && (
                    <p className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{user.location}</span>
                    </p>
                  )}
                  {user?.bio && (
                    <p className="text-[11px] text-[var(--ink-muted)] mt-1 line-clamp-2 italic">
                      "{user.bio}"
                    </p>
                  )}
                </div>
              </div>

              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] hover:opacity-90 rounded-xl transition-opacity shrink-0 self-start sm:self-center focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                <span>View Profile</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* B. Email Row */}
            <div className="p-3.5 sm:p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="settings-email"
                  className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                  <span>Email</span>
                </label>
                <span className="text-[10px] font-semibold text-[var(--ink-muted)] bg-[var(--bg)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                  Read-only
                </span>
              </div>

              <div className="relative">
                <input
                  id="settings-email"
                  type="email"
                  readOnly
                  value={user?.email || ""}
                  className="w-full px-3 py-2 text-xs font-medium bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--ink)] cursor-not-allowed select-all focus:outline-none"
                  aria-describedby="email-helper-text"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[var(--ink-muted)]">
                  <Lock className="w-3 h-3" />
                </div>
              </div>

              <p id="email-helper-text" className="text-[11px] text-[var(--ink-muted)]">
                Email changes aren't currently supported.
              </p>
            </div>

            {/* C. Account Information */}
            <div className="p-3.5 sm:p-4 space-y-2.5">
              <h4 className="text-[10px] font-bold text-[var(--ink-muted)] uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>Account Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* User ID */}
                <div className="p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                      User ID
                    </p>
                    <p className="text-[11px] font-mono font-medium text-[var(--ink)] truncate" title={userId}>
                      {userId || "Unavailable"}
                    </p>
                  </div>
                  {userId && (
                    <button
                      type="button"
                      onClick={handleCopyUserId}
                      className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--ink-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors shrink-0 cursor-pointer motion-btn-interactive focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                      aria-label="Copy User ID to clipboard"
                      title="Copy User ID"
                    >
                      {copiedId ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] px-0.5">
                          <Check className="w-3 h-3 text-[var(--accent)]" />
                          Copied
                        </span>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {/* Role */}
                <div className="p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                      Role
                    </p>
                    <p className="text-xs font-bold text-[var(--ink)] capitalize">
                      {user?.role === "admin" ? "Administrator" : "Standard Member"}
                    </p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] shrink-0">
                    <Shield className="w-3 h-3" />
                  </div>
                </div>

                {/* Member Since */}
                <div className="p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                      Member Since
                    </p>
                    <p className="text-xs font-semibold text-[var(--ink)] truncate">
                      {formattedMemberSince}
                    </p>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--ink-muted)] shrink-0">
                    <Calendar className="w-3 h-3" />
                  </div>
                </div>

                {/* Account Status */}
                <div className="p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                      Account Status
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <p className="text-xs font-semibold text-[var(--ink)]">
                        Active
                      </p>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 2. PREFERENCES (APPEARANCE & NOTIFICATIONS) */}
        {/* ====================================================== */}
        <section aria-labelledby="preferences-heading" className="space-y-2.5 animate-section-enter stagger-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 id="preferences-heading" className="text-sm font-bold text-[var(--ink)]">
                Preferences
              </h2>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Display appearance and notification channels
              </p>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs divide-y divide-[var(--border)] overflow-hidden">
            {/* Appearance Sub-section */}
            <div className="p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                    {resolvedTheme === "dark" ? (
                      <Moon className="w-3.5 h-3.5 text-[var(--accent)]" />
                    ) : (
                      <Sun className="w-3.5 h-3.5 text-[var(--accent)]" />
                    )}
                    <span>Appearance</span>
                  </h3>
                  <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                    Choose between light, dark, or follow your operating system.
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
                  {theme === "system"
                    ? `System (${resolvedTheme === "dark" ? "Dark" : "Light"})`
                    : theme === "dark"
                    ? "Dark Active"
                    : "Light Active"}
                </span>
              </div>

              {/* Three theme option cards: System / Light / Dark */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Option 1: System */}
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[96px] cursor-pointer motion-card-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    theme === "system"
                      ? "border-2 border-[var(--accent)] bg-[var(--accent-soft)]/40 shadow-xs"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg)]/50"
                  }`}
                  aria-pressed={theme === "system"}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        theme === "system"
                          ? "bg-[var(--accent)] text-white dark:text-[#0F1210]"
                          : "bg-[var(--bg)] border border-[var(--border)] text-[var(--ink-muted)]"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </div>
                    {theme === "system" && (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent)] text-white dark:text-[#0F1210]">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        theme === "system"
                          ? "text-[var(--accent)]"
                          : "text-[var(--ink)]"
                      }`}
                    >
                      System
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] mt-0.5">
                      {theme === "system"
                        ? `Following OS (${resolvedTheme === "dark" ? "Dark" : "Light"})`
                        : "Match OS settings"}
                    </p>
                  </div>
                </button>

                {/* Option 2: Light */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[96px] cursor-pointer motion-card-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    theme === "light"
                      ? "border-2 border-[var(--accent)] bg-[var(--accent-soft)]/40 shadow-xs"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg)]/50"
                  }`}
                  aria-pressed={theme === "light"}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        theme === "light"
                          ? "bg-[var(--accent)] text-white dark:text-[#0F1210]"
                          : "bg-[var(--bg)] border border-[var(--border)] text-[var(--ink-muted)]"
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                    </div>
                    {theme === "light" && (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent)] text-white dark:text-[#0F1210]">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        theme === "light"
                          ? "text-[var(--accent)]"
                          : "text-[var(--ink)]"
                      }`}
                    >
                      Light
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] mt-0.5">
                      Warm off-white theme
                    </p>
                  </div>
                </button>

                {/* Option 3: Dark */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[96px] cursor-pointer motion-card-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                    theme === "dark"
                      ? "border-2 border-[var(--accent)] bg-[var(--accent-soft)]/40 shadow-xs"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg)]/50"
                  }`}
                  aria-pressed={theme === "dark"}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        theme === "dark"
                          ? "bg-[var(--accent)] text-white dark:text-[#0F1210]"
                          : "bg-[var(--bg)] border border-[var(--border)] text-[var(--ink-muted)]"
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                    </div>
                    {theme === "dark" && (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent)] text-white dark:text-[#0F1210]">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        theme === "dark"
                          ? "text-[var(--accent)]"
                          : "text-[var(--ink)]"
                      }`}
                    >
                      Dark
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] mt-0.5">
                      Sleek dark theme
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--ink-muted)]">
                <Info className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Your theme preference persists across sessions and applies to all pages.
                </p>
              </div>
            </div>

            {/* Notifications Sub-section */}
            <div className="p-3.5 sm:p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>In-App Notifications</span>
                  </h3>
                  <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                    Live events and activity updates sent to your notification bell.
                  </p>
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  Always Active
                </span>
              </div>

              {/* Supported in-app channels informational list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] shrink-0">
                    <Handshake className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--ink)] truncate">
                      Swap Requests
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] truncate">
                      Incoming & outgoing requests
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] shrink-0">
                    <ArrowLeftRight className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--ink)] truncate">
                      Swap Updates
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] truncate">
                      Acceptances & completions
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] shrink-0">
                    <Video className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--ink)] truncate">
                      Meeting Reminders
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] truncate">
                      15-min & live session alerts
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] shrink-0">
                    <Star className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--ink)] truncate">
                      Reviews & Ratings
                    </p>
                    <p className="text-[10px] text-[var(--ink-muted)] truncate">
                      Partner ratings and feedback
                    </p>
                  </div>
                </div>
              </div>

              {/* Email notifications informational coming soon row */}
              <div className="pt-2 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[var(--ink)]">
                      Email notifications
                    </h4>
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--ink-muted)]">
                      Coming soon
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                    Email digests and external push options will be available in a future update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 3. PRIVACY SECTION */}
        {/* ====================================================== */}
        <section aria-labelledby="privacy-heading" className="space-y-2.5 animate-section-enter stagger-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 id="privacy-heading" className="text-sm font-bold text-[var(--ink)]">
                Privacy
              </h2>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Profile visibility and discovery preferences
              </p>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[var(--ink)]">
                    Privacy Controls
                  </h3>
                  <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--ink-muted)]">
                    Coming soon
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-muted)] mt-1 leading-relaxed">
                  Additional profile visibility controls will be available here in a future update.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-start gap-2.5 text-[var(--ink-muted)]">
              <Eye className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Currently, your offered skills and public portfolio remain discoverable to fellow SkillSwap members to facilitate skill exchanges.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 4. ACCOUNT ACTIONS (LOGOUT) */}
        {/* ====================================================== */}
        <section aria-labelledby="actions-heading" className="space-y-2.5 animate-section-enter stagger-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 id="actions-heading" className="text-sm font-bold text-[var(--ink)]">
                Account Actions
              </h2>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Session management and security controls
              </p>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-[var(--ink)]">
                  Log Out of SkillSwap
                </h3>
                <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                  Sign out of your account on this device. You will be redirected to sign in.
                </p>
              </div>

              {!showLogoutConfirm && (
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xl transition-colors shrink-0 cursor-pointer motion-btn-interactive self-start sm:self-center focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>

            {/* Inline Logout Confirmation Prompt */}
            {showLogoutConfirm && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2 animate-dropdown-enter"
              >
                <div className="flex items-center gap-1.5 text-red-700 dark:text-red-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-xs font-bold">
                    Are you sure you want to log out?
                  </p>
                </div>
                <p className="text-[11px] text-red-600/80 dark:text-red-400/80">
                  You will need your login credentials to access your skills and chats again.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleConfirmLogout}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs cursor-pointer motion-btn-interactive disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-[var(--ink)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg)] rounded-lg transition-colors cursor-pointer motion-btn-interactive disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
