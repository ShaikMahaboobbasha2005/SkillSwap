import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import NotificationSkeleton from "./NotificationSkeleton";
import { Bell, CheckCheck, Inbox } from "lucide-react";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const recentNotifications = notifications.slice(0, 6);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-[#16160F] hover:text-[#1B4332] hover:bg-[#F7F6F2] border border-transparent hover:border-[#E6E3DA] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1B4332] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E6E3DA] rounded-2xl shadow-xl z-50 animate-fadeIn overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6E3DA] bg-[#F7F6F2]/50">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#16160F]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E4EEE8] text-[#1B4332]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#1B4332] hover:text-[#16160F] transition-colors focus:outline-none cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E6E3DA]/50 p-2 space-y-1">
            {loading && notifications.length === 0 ? (
              <div className="p-2">
                <NotificationSkeleton count={3} compact />
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[#F7F6F2] border border-[#E6E3DA] flex items-center justify-center mx-auto text-[#6B6858] mb-2.5">
                  <Inbox className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-xs font-semibold text-[#16160F]">No notifications yet</p>
                <p className="text-[11px] text-[#6B6858] mt-1 max-w-[200px] mx-auto leading-relaxed">
                  When you receive requests, meeting invites, or reviews, they'll show up here.
                </p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <NotificationItem
                  key={notif._id}
                  notification={notif}
                  onClose={() => setIsOpen(false)}
                  compact
                />
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="p-2 border-t border-[#E6E3DA] bg-[#F7F6F2]/30 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full py-1.5 text-xs font-semibold text-[#1B4332] hover:text-[#16160F] hover:bg-[#E4EEE8] rounded-xl transition-colors"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
