import { Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import MobileBottomNav from "./MobileBottomNav";

/**
 * AppLayout — Shared Application Shell Layout
 *
 * Centralizes mobile bottom navigation and provides a single, uniform
 * safe-area bottom clearance across standard content pages without scattering
 * redundant padding across individual page components.
 *
 * Full-screen chat rooms and active message workspaces are explicitly preserved
 * by omitting bottom navigation and padding to maximize mobile composer space.
 */
export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // Detect 1-on-1 focused chat conversation room (where bottom navbar is hidden)
  const isChatRoom =
    (location.pathname.startsWith("/swaps/") &&
      location.pathname.includes("/chat")) ||
    (location.pathname.startsWith("/chats/") &&
      location.pathname !== "/chats");

  // Detect full-screen height layouts (conversation list or chat room)
  const isFullScreenPage =
    location.pathname.startsWith("/chats") || isChatRoom;

  // Show bottom navigation for authenticated users, except in focused chat rooms
  const showBottomNav = Boolean(user) && !isChatRoom;

  // Shared safe-area clearance:
  // Applied on mobile viewports for standard content pages when bottom nav is active.
  // Full-screen pages manage their internal scroll boundaries without container padding.
  const needsSharedBottomSpacing = showBottomNav && !isFullScreenPage;

  return (
    <div
      className={`w-full min-h-screen flex flex-col bg-[#F7F6F2] dark:bg-[#0F1210] text-[#16160F] dark:text-[#F2F1EC] transition-colors duration-150 ${
        needsSharedBottomSpacing
          ? "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0"
          : ""
      }`}
    >
      <Outlet />
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
}
