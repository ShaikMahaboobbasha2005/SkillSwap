import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

export default function SettingsPage() {
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
    : null;

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0F1210] flex flex-col font-sans transition-colors duration-150">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="border-b border-[#E6E3DA] dark:border-[#2A2E29] pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B6858] dark:text-[#9C9A8C] mb-1">
            <Link to="/" className="hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#16160F] dark:text-[#F2F1EC]">Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#16160F] dark:text-[#F2F1EC]">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6858] dark:text-[#9C9A8C] mt-1">
            Manage your account information, theme preferences, and notification channels.
          </p>
        </div>

        {/* ====================================================== */}
        {/* 1. ACCOUNT SECTION */}
        {/* ====================================================== */}
        <section aria-labelledby="account-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 id="account-heading" className="text-base font-bold text-[#16160F] dark:text-[#F2F1EC]">
                Account
              </h2>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C]">
                Your personal profile and account credentials
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl shadow-sm divide-y divide-[#E6E3DA] dark:divide-[#2A2E29] overflow-hidden">
            {/* A. My Profile Row */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[#1B4332] dark:bg-[#1C2E24] text-white dark:text-[#3FA873] flex items-center justify-center text-base font-bold overflow-hidden shrink-0 border border-[#E6E3DA] dark:border-[#2A2E29]">
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
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-[#16160F] dark:text-[#F2F1EC] truncate">
                      {user?.name || "SkillSwap User"}
                    </h3>
                    {user?.role && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873]">
                        {user.role === "admin" ? "Admin" : "Member"}
                      </span>
                    )}
                  </div>
                  {user?.location ? (
                    <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{user.location}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">
                      Personal skills and public exchange profile
                    </p>
                  )}
                </div>
              </div>

              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1B4332] dark:text-[#3FA873] bg-[#E4EEE8] dark:bg-[#1C2E24] hover:bg-[#d8e6de] dark:hover:bg-[#253d30] rounded-xl transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] dark:focus-visible:ring-[#3FA873]"
              >
                <span>My Profile →</span>
              </Link>
            </div>

            {/* B. Email Row */}
            <div className="p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="settings-email"
                  className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#6B6858] dark:text-[#9C9A8C]" />
                  <span>Email Address</span>
                </label>
                <span className="text-[11px] font-semibold text-[#6B6858] dark:text-[#9C9A8C] bg-[#F7F6F2] dark:bg-[#111412] px-2 py-0.5 rounded-md border border-[#E6E3DA] dark:border-[#2A2E29]">
                  Read-only
                </span>
              </div>

              <div className="relative">
                <input
                  id="settings-email"
                  type="email"
                  readOnly
                  value={user?.email || ""}
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl text-[#16160F] dark:text-[#F2F1EC] cursor-not-allowed select-all focus:outline-none"
                  aria-describedby="email-helper-text"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#6B6858] dark:text-[#9C9A8C]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>

              <p id="email-helper-text" className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C]">
                Email changes aren't currently supported.
              </p>
            </div>

            {/* C. Account Information */}
            <div className="p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] uppercase tracking-wider text-[11px]">
                Account Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* User ID */}
                {(user?._id || user?.id) && (
                  <div className="p-3 bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C]">
                        User ID
                      </p>
                      <p className="text-xs font-mono font-medium text-[#16160F] dark:text-[#F2F1EC] truncate">
                        {user?._id || user?.id}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUserId}
                      className="p-1.5 rounded-lg bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#1B4332] dark:hover:text-[#3FA873] hover:border-[#1B4332] dark:hover:border-[#3FA873] transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] dark:focus-visible:ring-[#3FA873]"
                      aria-label="Copy User ID to clipboard"
                      title="Copy User ID"
                    >
                      {copiedId ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#1B4332] dark:text-[#3FA873] px-1">
                          <Check className="w-3 h-3 text-[#1B4332] dark:text-[#3FA873]" />
                          Copied
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Role */}
                {user?.role && (
                  <div className="p-3 bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C]">
                        Account Role
                      </p>
                      <p className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] capitalize">
                        {user.role === "admin" ? "Administrator" : "Standard Member"}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#1B4332] dark:text-[#3FA873] shrink-0">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                {/* Member Since */}
                {formattedMemberSince && (
                  <div className="p-3 bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl flex items-center justify-between gap-2 sm:col-span-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C]">
                        Member Since
                      </p>
                      <p className="text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC]">
                        {formattedMemberSince}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C] shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 2. PREFERENCES — APPEARANCE (DARK MODE) */}
        {/* ====================================================== */}
        <section aria-labelledby="preferences-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] flex items-center justify-center">
              {resolvedTheme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 id="preferences-heading" className="text-base font-bold text-[#16160F] dark:text-[#F2F1EC]">
                Preferences
              </h2>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C]">
                Display customization and theme interface options
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[#16160F] dark:text-[#F2F1EC]">Appearance</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873]">
                  {theme === "system"
                    ? `System (${resolvedTheme === "dark" ? "Dark" : "Light"})`
                    : theme === "dark"
                    ? "Dark Active"
                    : "Light Active"}
                </span>
              </div>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">
                Customize how SkillSwap looks on your device. Choose between light, dark, or sync with your system.
              </p>
            </div>

            {/* Three theme option cards: System / Light / Dark */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: System */}
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[108px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] dark:focus-visible:ring-[#3FA873] ${
                  theme === "system"
                    ? "border-2 border-[#1B4332] dark:border-[#3FA873] bg-[#E4EEE8]/30 dark:bg-[#1C2E24]/50 shadow-sm ring-1 ring-[#1B4332]/20 dark:ring-[#3FA873]/30"
                    : "border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18] hover:border-[#1B4332]/30 dark:hover:border-[#3FA873]/30 hover:bg-[#F7F6F2]/60 dark:hover:bg-[#1C2E24]/20"
                }`}
                aria-pressed={theme === "system"}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      theme === "system"
                        ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210]"
                        : "bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C]"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </div>
                  {theme === "system" && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210]">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      theme === "system"
                        ? "text-[#1B4332] dark:text-[#3FA873]"
                        : "text-[#16160F] dark:text-[#F2F1EC]"
                    }`}
                  >
                    System
                  </p>
                  <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">
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
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[108px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] dark:focus-visible:ring-[#3FA873] ${
                  theme === "light"
                    ? "border-2 border-[#1B4332] dark:border-[#3FA873] bg-[#E4EEE8]/30 dark:bg-[#1C2E24]/50 shadow-sm ring-1 ring-[#1B4332]/20 dark:ring-[#3FA873]/30"
                    : "border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18] hover:border-[#1B4332]/30 dark:hover:border-[#3FA873]/30 hover:bg-[#F7F6F2]/60 dark:hover:bg-[#1C2E24]/20"
                }`}
                aria-pressed={theme === "light"}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      theme === "light"
                        ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210]"
                        : "bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C]"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                  </div>
                  {theme === "light" && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210]">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      theme === "light"
                        ? "text-[#1B4332] dark:text-[#3FA873]"
                        : "text-[#16160F] dark:text-[#F2F1EC]"
                    }`}
                  >
                    Light
                  </p>
                  <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">
                    Classic Pine & Warm Off-white
                  </p>
                </div>
              </button>

              {/* Option 3: Dark */}
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[108px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] dark:focus-visible:ring-[#3FA873] ${
                  theme === "dark"
                    ? "border-2 border-[#1B4332] dark:border-[#3FA873] bg-[#E4EEE8]/30 dark:bg-[#1C2E24]/50 shadow-sm ring-1 ring-[#1B4332]/20 dark:ring-[#3FA873]/30"
                    : "border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18] hover:border-[#1B4332]/30 dark:hover:border-[#3FA873]/30 hover:bg-[#F7F6F2]/60 dark:hover:bg-[#1C2E24]/20"
                }`}
                aria-pressed={theme === "dark"}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      theme === "dark"
                        ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210]"
                        : "bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C]"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                  </div>
                  {theme === "dark" && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210]">
                      Active
                    </span>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      theme === "dark"
                        ? "text-[#1B4332] dark:text-[#3FA873]"
                        : "text-[#16160F] dark:text-[#F2F1EC]"
                    }`}
                  >
                    Dark
                  </p>
                  <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">
                    Deep pine & charcoal theme
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C]">
              <Info className="w-4 h-4 text-[#1B4332] dark:text-[#3FA873] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Your appearance setting is saved locally and applies across all pages. System mode automatically updates when your operating system switches between light and dark appearance.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 3. NOTIFICATIONS SECTION */}
        {/* ====================================================== */}
        <section aria-labelledby="notifications-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 id="notifications-heading" className="text-base font-bold text-[#16160F] dark:text-[#F2F1EC]">
                Notifications
              </h2>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C]">
                Real-time delivery status and channel preferences
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl shadow-sm divide-y divide-[#E6E3DA] dark:divide-[#2A2E29] overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#16160F] dark:text-[#F2F1EC]">
                    In-App Notification Center
                  </h3>
                  <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">
                    Real-time alerts delivered through the navbar notification bell and Socket.IO connection.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] shrink-0">
                  Active
                </span>
              </div>

              {/* Active in-app categories list */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#1B4332] dark:text-[#3FA873] shrink-0">
                    <Handshake className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] truncate">
                      Swap Requests
                    </p>
                    <p className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] truncate">
                      Incoming & status updates
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#1B4332] dark:text-[#3FA873] shrink-0">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] truncate">
                      Meeting Reminders
                    </p>
                    <p className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] truncate">
                      15-min & live session alerts
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F7F6F2] dark:bg-[#111412] border border-[#E6E3DA] dark:border-[#2A2E29] flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#1B4332] dark:text-[#3FA873] shrink-0">
                    <Star className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] truncate">
                      Partner Reviews
                    </p>
                    <p className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] truncate">
                      Ratings & feedback alerts
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email notification preferences row */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F7F6F2]/40 dark:bg-[#111412]/40 opacity-75">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC]">
                    Email Notification & Digest Preferences
                  </h4>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C]">
                    Coming soon
                  </span>
                </div>
                <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C]">
                  Customizable email summaries and external push channel settings will be available in future releases.
                </p>
              </div>

              <div
                className="w-10 h-6 bg-[#E6E3DA] dark:bg-[#2A2E29] rounded-full p-1 cursor-not-allowed shrink-0 self-start sm:self-center"
                aria-disabled="true"
                title="Email preferences coming soon"
              >
                <div className="w-4 h-4 bg-white dark:bg-[#181B18] rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================== */}
        {/* 4. ACCOUNT ACTIONS SECTION */}
        {/* ====================================================== */}
        <section aria-labelledby="actions-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h2 id="actions-heading" className="text-base font-bold text-[#16160F] dark:text-[#F2F1EC]">
                Account Actions
              </h2>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C]">
                Session management and security controls
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#16160F] dark:text-[#F2F1EC]">
                  Log Out of SkillSwap
                </h3>
                <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">
                  Sign out of your account on this device. You will be redirected to the sign in page.
                </p>
              </div>

              {!showLogoutConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 rounded-xl transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              ) : null}
            </div>

            {/* Inline Logout Confirmation Prompt */}
            {showLogoutConfirm && (
              <div
                role="alert"
                className="p-3.5 sm:p-4 rounded-xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-3 animate-fadeIn"
              >
                <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-xs font-bold">
                    Are you sure you want to log out?
                  </p>
                </div>
                <p className="text-[11px] text-red-700 dark:text-red-300/80">
                  You will need your login credentials to access your skills and chats again.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleConfirmLogout}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] hover:bg-[#F7F6F2] dark:hover:bg-[#1C2E24]/30 rounded-xl transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] dark:focus-visible:ring-[#3FA873]"
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
