import { Link, useLocation } from "react-router-dom";
import useSocket from "../../hooks/useSocket";
import { useSwap } from "../../context/SwapContext";
import {
  Home as HomeIcon,
  Compass,
  Handshake,
  MessageSquare,
} from "lucide-react";
import MatchesIcon from "../icons/MatchesIcon";

export default function MobileBottomNav() {
  const location = useLocation();
  const { unreadConversationCount } = useSocket();
  const { pendingIncomingCount } = useSwap();

  const isRouteActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/recommendations") {
      // Matches active on /recommendations and alias /matches
      return (
        location.pathname.startsWith("/recommendations") ||
        location.pathname.startsWith("/matches")
      );
    }
    if (path === "/discover") {
      return location.pathname.startsWith("/discover");
    }
    if (path === "/swaps") {
      // Matches /swaps and nested /swaps/:swapId routes
      return location.pathname.startsWith("/swaps");
    }
    if (path === "/chats") {
      return location.pathname.startsWith("/chats");
    }
    return false;
  };

  const navItems = [
    {
      to: "/",
      label: "Home",
      icon: HomeIcon,
      isActive: isRouteActive("/"),
      badgeCount: 0,
    },
    {
      to: "/recommendations",
      label: "Matches",
      icon: MatchesIcon,
      isActive: isRouteActive("/recommendations"),
      badgeCount: 0,
    },
    {
      to: "/discover",
      label: "Discover",
      icon: Compass,
      isActive: isRouteActive("/discover"),
      badgeCount: 0,
    },
    {
      to: "/swaps",
      label: "Swaps",
      icon: Handshake,
      isActive: isRouteActive("/swaps"),
      badgeCount: pendingIncomingCount || 0,
    },
    {
      to: "/chats",
      label: "Chats",
      icon: MessageSquare,
      isActive: isRouteActive("/chats"),
      badgeCount: unreadConversationCount || 0,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181B18]/95 backdrop-blur-md border-t border-[#E6E3DA] dark:border-[#2A2E29] md:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_8px_rgba(0,0,0,0.03)] transition-colors duration-150"
      aria-label="Mobile Navigation"
      role="navigation"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto h-14 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const displayBadge =
            item.badgeCount > 99 ? "99+" : item.badgeCount;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-1 min-h-[48px] rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#1B4332] dark:focus-visible:ring-[#3FA873] focus-visible:outline-none ${
                item.isActive
                  ? "text-[#1B4332] dark:text-[#3FA873]"
                  : "text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC]"
              }`}
              aria-label={
                item.badgeCount > 0
                  ? `${item.label} (${item.badgeCount} pending)`
                  : item.label
              }
              aria-current={item.isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive
                      ? "stroke-[2.35] scale-105"
                      : "stroke-[1.75] hover:scale-105"
                  }`}
                />
                {item.badgeCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 text-[9px] font-extrabold rounded-full bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] flex items-center justify-center border-2 border-white dark:border-[#181B18] shadow-xs leading-none"
                    aria-hidden="true"
                  >
                    {displayBadge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 leading-tight transition-all ${
                  item.isActive ? "font-bold" : "font-medium"
                }`}
              >
                {item.label}
              </span>
              {/* Subtle active indicator micro-dot */}
              <div
                className={`w-1 h-1 rounded-full mt-0.5 transition-opacity duration-150 ${
                  item.isActive ? "bg-[#1B4332] dark:bg-[#3FA873] opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
