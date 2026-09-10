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
        ? "bg-[#E4EEE8] text-[#1B4332]"
        : "text-[#16160F] hover:text-[#1B4332] hover:bg-[#F7F6F2]"
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
      className="border-b border-[#E6E3DA] bg-white sticky top-0 z-40 px-4 sm:px-8 py-3"
      aria-label="Main Navigation"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link
          to="/"
          className="flex items-center space-x-3 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 rounded-xl"
        >
          <img
            src={logoImg}
            alt="SkillSwap Logo"
            className="w-9 h-9 object-contain rounded-xl border border-[#E6E3DA] p-1 bg-white"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#16160F]">
              Skill<span className="text-[#1B4332]">Swap</span>
            </span>
            <span className="font-brand-serif italic text-[10px] tracking-wider uppercase text-[#6B6858] font-medium -mt-1 hidden sm:inline">
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
              className="flex items-center space-x-2 p-1 sm:p-1.5 rounded-xl hover:bg-[#F7F6F2] border border-transparent hover:border-[#E6E3DA] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
              aria-label="Open user account menu"
              aria-expanded={dropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-[#E6E3DA] shrink-0">
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
              <span className="text-xs font-semibold text-[#16160F] hidden md:inline">
                {user?.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#6B6858] transition-transform hidden md:inline ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Account Menu Dropdown Panel (Used on Mobile & Desktop) */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E6E3DA] rounded-2xl shadow-xl py-2 z-50 animate-fadeIn space-y-1">
                <div className="px-4 py-2 border-b border-[#E6E3DA]">
                  <p className="text-xs font-bold text-[#16160F] truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[11px] text-[#6B6858] truncate">
                    {user?.email || ""}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#16160F] hover:bg-[#F7F6F2] hover:text-[#1B4332] transition-colors"
                >
                  <User className="w-4 h-4 text-[#6B6858]" />
                  <span>My Profile</span>
                </Link>

                <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-[#6B6858] opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F7F6F2] border border-[#E6E3DA]">
                    Soon
                  </span>
                </div>

                <div className="border-t border-[#E6E3DA] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
