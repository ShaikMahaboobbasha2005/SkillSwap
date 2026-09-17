import { Link } from "react-router-dom";
import { ArrowRight, Bell } from "lucide-react";
import NotificationItem from "../notifications/NotificationItem";

/**
 * RecentActivitySection Component
 *
 * Reuses existing notifications from NotificationContext / notificationService.
 * Renders rich activity rows with distinct icons and preserves Phase 11.2 deep-linking.
 */
export default function RecentActivitySection({
  notifications = [],
  loading = false,
}) {
  const safeNotifications = Array.isArray(notifications)
    ? notifications.filter(Boolean)
    : [];
  const displayItems = safeNotifications.slice(0, 5);

  return (
    <div className="bg-white border border-[#E6E3DA] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E3DA]">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-[#16160F] tracking-tight">
              Recent Activity
            </h2>
          </div>
          <Link
            to="/notifications"
            className="text-xs font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Area */}
        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-16 bg-zinc-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            /* Empty State */
            <div className="py-8 text-center px-4 bg-[#F7F6F2] border border-dashed border-[#E6E3DA] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white border border-[#E6E3DA] flex items-center justify-center mx-auto text-[#6B6858] mb-3">
                <Bell className="w-5 h-5 text-[#6B6858]" />
              </div>
              <h3 className="text-sm font-bold text-[#16160F]">
                No recent activity
              </h3>
              <p className="mt-1 text-xs text-[#6B6858] max-w-sm mx-auto">
                Notifications and updates about swap requests, sessions, and reviews will appear here.
              </p>
            </div>
          ) : (
            /* Activity Feed */
            <div className="space-y-2">
              {displayItems.map((notification, idx) => (
                <NotificationItem
                  key={notification._id || `notif-${idx}`}
                  notification={notification}
                  compact={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
