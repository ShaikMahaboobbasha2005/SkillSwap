import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import { useSwap } from "../context/SwapContext";
import NotificationBadge from "./NotificationBadge";
import NotificationBell from "./notifications/NotificationBell";
import logoImg from "../assets/logo.png";
import {
  Compass,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Home as HomeIcon,
  Handshake,
  MessageSquare,
} from "lucide-react";
import MatchesIcon from "./icons/MatchesIcon";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadConversationCount } = useSocket();
  const { pendingIncomingCount } = useSwap();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/recommendations" || path === "/matches") {
      return (
        location.pathname.startsWith("/recommendations") ||
        location.pathname.startsWith("/matches")
      );
    }
    if (path === "/chats") {
      return location.pathname.startsWith("/chats") || location.pathname.includes("/chat");
    }
    if (path === "/swaps") {
      return location.pathname.startsWith("/swaps") && !location.pathname.includes("/chat");
    }
    if (path === "/notifications") {
      return location.pathname.startsWith("/notifications");
    }
    return location.pathname.startsWith(path);
  };

  const linkClasses = (path) =>
    `px-3.5 py-2 text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-1.5 ${
      isActive(path)
        ? "bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873]"
        : "text-[#16160F] dark:text-[#F2F1EC] hover:text-[#1B4332] dark:hover:text-[#3FA873] hover:bg-[#F7F6F2] dark:hover:bg-[#1C2E24]/50"
    }`;

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <nav
      className="border-b border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18] sticky top-0 z-40 px-4 sm:px-8 py-3 transition-colors duration-150"
      aria-label="Main Navigation"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link
          to="/"
          className="flex items-center space-x-3 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#3FA873]/30 rounded-xl"
        >
          <img
            src={logoImg}
            alt="SkillSwap Logo"
            className="w-9 h-9 object-contain rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] p-1 bg-white dark:bg-[#111412]"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#16160F] dark:text-[#F2F1EC]">
              Skill<span className="text-[#1B4332] dark:text-[#3FA873]">Swap</span>
            </span>
            <span className="font-brand-serif italic text-[10px] tracking-wider uppercase text-[#6B6858] dark:text-[#9C9A8C] font-medium -mt-1 hidden sm:inline">
              Swap Skills. Grow Together.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={linkClasses("/")}>
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <Link to="/discover" className={linkClasses("/discover")}>
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Skills</span>
          </Link>
          <Link to="/recommendations" className={linkClasses("/recommendations")}>
            <MatchesIcon className="w-3.5 h-3.5" />
            <span>Matches</span>
          </Link>
          <Link to="/swaps" className={linkClasses("/swaps")}>
            <Handshake className="w-3.5 h-3.5" />
            <span>Swap Requests</span>
            <NotificationBadge count={pendingIncomingCount} variant="inline" />
          </Link>
          <Link to="/chats" className={linkClasses("/chats")}>
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chats</span>
            <NotificationBadge count={unreadConversationCount} variant="inline" />
          </Link>
        </div>

        {/* Right Actions: Notification Bell + User Profile Avatar Account Trigger */}
        <div className="flex items-center space-x-1.5 sm:space-x-2" ref={dropdownRef}>
          {/* Notification Bell */}
          <NotificationBell />

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1 sm:p-1.5 rounded-xl hover:bg-[#F7F6F2] dark:hover:bg-[#1C2E24]/50 border border-transparent hover:border-[#E6E3DA] dark:hover:border-[#2A2E29] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 dark:focus:ring-[#3FA873]/30"
              aria-label="Open user account menu"
              aria-expanded={dropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-[#1B4332] dark:bg-[#1C2E24] text-white dark:text-[#3FA873] flex items-center justify-center font-bold text-xs overflow-hidden border border-[#E6E3DA] dark:border-[#2A2E29] shrink-0">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || "User Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  "U"
                )}
              </div>
              <span className="text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] hidden md:inline">
                {user?.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#6B6858] dark:text-[#9C9A8C] transition-transform hidden md:inline ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Account Menu Dropdown Panel (Used on Mobile & Desktop) */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl shadow-xl py-2 z-50 animate-dropdown-enter space-y-1">
                <div className="px-4 py-2 border-b border-[#E6E3DA] dark:border-[#2A2E29]">
                  <p className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] truncate">
                    {user?.email || ""}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors ${
                    location.pathname === "/profile"
                      ? "bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873]"
                      : "text-[#16160F] dark:text-[#F2F1EC] hover:bg-[#F7F6F2] dark:hover:bg-[#1C2E24]/50 hover:text-[#1B4332] dark:hover:text-[#3FA873]"
                  }`}
                >
                  <User className={`w-4 h-4 ${location.pathname === "/profile" ? "text-[#1B4332] dark:text-[#3FA873]" : "text-[#6B6858] dark:text-[#9C9A8C]"}`} />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-colors ${
                    location.pathname === "/settings"
                      ? "bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873]"
                      : "text-[#16160F] dark:text-[#F2F1EC] hover:bg-[#F7F6F2] dark:hover:bg-[#1C2E24]/50 hover:text-[#1B4332] dark:hover:text-[#3FA873]"
                  }`}
                >
                  <Settings className={`w-4 h-4 ${location.pathname === "/settings" ? "text-[#1B4332] dark:text-[#3FA873]" : "text-[#6B6858] dark:text-[#9C9A8C]"}`} />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-[#E6E3DA] dark:border-[#2A2E29] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
