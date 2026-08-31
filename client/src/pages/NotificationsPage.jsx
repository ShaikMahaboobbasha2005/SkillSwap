import { useState, useEffect } from "react";
import useNotifications from "../hooks/useNotifications";
import Navbar from "../components/Navbar";
import NotificationItem from "../components/notifications/NotificationItem";
import NotificationSkeleton from "../components/notifications/NotificationSkeleton";
import { Bell, CheckCheck, Inbox, AlertCircle, RefreshCw } from "lucide-react";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    page,
    fetchNotifications,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState("all"); // "all" | "unread"

  // Refetch when tab changes
  useEffect(() => {
    fetchNotifications({
      page: 1,
      limit: 20,
      unreadOnly: filter === "unread",
      append: false,
    });
  }, [filter, fetchNotifications]);

  const handleLoadMore = () => {
    fetchNotifications({
      page: page + 1,
      limit: 20,
      unreadOnly: filter === "unread",
      append: true,
    });
  };

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E3DA]">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-[#16160F]">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#1B4332] text-white text-xs font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B6858] mt-1">
              Stay updated on your swap requests, video meetings, and partner reviews.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1B4332] bg-white hover:bg-[#E4EEE8] border border-[#E6E3DA] rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 cursor-pointer self-start sm:self-auto"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 mb-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#1B4332] text-white shadow-sm"
                : "bg-white text-[#6B6858] hover:text-[#16160F] border border-[#E6E3DA]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === "unread"
                ? "bg-[#1B4332] text-white shadow-sm"
                : "bg-white text-[#6B6858] hover:text-[#16160F] border border-[#E6E3DA]"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filter === "unread"
                    ? "bg-white/20 text-white"
                    : "bg-[#E4EEE8] text-[#1B4332]"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List Content */}
        <div className="space-y-2 mt-4">
          {loading && displayedNotifications.length === 0 ? (
            <NotificationSkeleton count={4} />
          ) : error ? (
            <div className="p-8 text-center bg-white border border-rose-200 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#16160F]">{error}</p>
              <button
                type="button"
                onClick={() =>
                  fetchNotifications({
                    page: 1,
                    limit: 20,
                    unreadOnly: filter === "unread",
                  })
                }
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1B4332] bg-[#E4EEE8] hover:bg-[#1B4332] hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E6E3DA] rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#F7F6F2] border border-[#E6E3DA] flex items-center justify-center mx-auto text-[#6B6858] mb-3">
                {filter === "unread" ? (
                  <CheckCheck className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Inbox className="w-6 h-6 opacity-60" />
                )}
              </div>
              <h3 className="text-sm font-bold text-[#16160F]">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "No notifications yet"}
              </h3>
              <p className="text-xs text-[#6B6858] mt-1 max-w-sm mx-auto leading-relaxed">
                {filter === "unread"
                  ? "You have zero unread notifications. Check the 'All' tab to see past activity."
                  : "Activity related to swap requests, chats, video calls, and ratings will appear here."}
              </p>
            </div>
          ) : (
            displayedNotifications.map((notif) => (
              <NotificationItem key={notif._id} notification={notif} />
            ))
          )}
        </div>

        {/* Load More Pagination Button */}
        {hasMore && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#16160F] hover:text-[#1B4332] bg-white hover:bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load More Notifications</span>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
