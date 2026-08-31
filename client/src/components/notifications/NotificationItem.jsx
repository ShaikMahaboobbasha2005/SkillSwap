import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import {
  Handshake,
  CheckCircle2,
  XCircle,
  UserMinus,
  Clock,
  Trophy,
  AlertCircle,
  Video,
  Bell,
  CalendarX,
  Star,
  Check,
} from "lucide-react";

/**
 * Format timestamp to a relative string ("Just now", "5m ago", "2h ago", "Yesterday", "MMM D")
 */
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Yesterday";
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getTypeConfig = (type) => {
  switch (type) {
    case "swap_request":
      return {
        icon: Handshake,
        color: "text-[#1B4332]",
        bg: "bg-[#E4EEE8]",
        defaultTitle: "New Swap Request",
      };
    case "swap_accepted":
      return {
        icon: CheckCircle2,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        defaultTitle: "Swap Accepted",
      };
    case "swap_rejected":
      return {
        icon: XCircle,
        color: "text-rose-600",
        bg: "bg-rose-50",
        defaultTitle: "Swap Declined",
      };
    case "swap_left":
      return {
        icon: UserMinus,
        color: "text-amber-700",
        bg: "bg-amber-50",
        defaultTitle: "Swap Ended",
      };
    case "completion_request":
      return {
        icon: Clock,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        defaultTitle: "Completion Requested",
      };
    case "completion_confirmed":
      return {
        icon: Trophy,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        defaultTitle: "Swap Completed",
      };
    case "completion_cancelled":
      return {
        icon: AlertCircle,
        color: "text-rose-600",
        bg: "bg-rose-50",
        defaultTitle: "Completion Not Confirmed",
      };
    case "meeting_scheduled":
    case "meeting_started":
      return {
        icon: Video,
        color: "text-[#1B4332]",
        bg: "bg-[#E4EEE8]",
        defaultTitle: "Video Session",
      };
    case "meeting_reminder":
      return {
        icon: Bell,
        color: "text-amber-700",
        bg: "bg-amber-50",
        defaultTitle: "Session Reminder",
      };
    case "meeting_cancelled":
      return {
        icon: CalendarX,
        color: "text-rose-600",
        bg: "bg-rose-50",
        defaultTitle: "Session Cancelled",
      };
    case "rating_received":
      return {
        icon: Star,
        color: "text-[#B8860B]",
        bg: "bg-[#FEF9C3]",
        defaultTitle: "New Review",
      };
    default:
      return {
        icon: Bell,
        color: "text-[#1B4332]",
        bg: "bg-[#E4EEE8]",
        defaultTitle: "Notification",
      };
  }
};

export default function NotificationItem({ notification, onClose, compact = false }) {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  if (!notification) return null;

  const { _id, type, title, message, read, sender, swap, createdAt } = notification;
  const typeConfig = getTypeConfig(type);
  const Icon = typeConfig.icon;

  const swapId = swap?._id || (typeof swap === "string" ? swap : null);

  const handleClick = (e) => {
    // Mark as read immediately
    if (!read) {
      markAsRead(_id);
    }

    if (onClose) {
      onClose();
    }

    // Determine target navigation based on type
    switch (type) {
      case "swap_request":
        navigate("/swaps");
        break;
      case "swap_accepted":
      case "meeting_scheduled":
      case "meeting_started":
      case "meeting_reminder":
        if (swapId) {
          navigate(`/swaps/${swapId}/chat`);
        } else {
          navigate("/chats");
        }
        break;
      case "completion_request":
      case "completion_confirmed":
      case "completion_cancelled":
      case "swap_left":
      case "swap_rejected":
      case "meeting_cancelled":
        navigate("/swaps");
        break;
      case "rating_received":
        navigate("/profile");
        break;
      default:
        if (swapId) {
          navigate(`/swaps/${swapId}/chat`);
        } else {
          navigate("/notifications");
        }
        break;
    }
  };

  const handleMarkReadOnly = (e) => {
    e.stopPropagation();
    markAsRead(_id);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick(e);
        }
      }}
      className={`group relative flex items-start gap-3 p-3 transition-colors cursor-pointer text-left focus:outline-none focus:bg-[#F7F6F2] ${
        compact ? "rounded-xl" : "rounded-2xl border border-[#E6E3DA]"
      } ${
        read
          ? "bg-white hover:bg-[#F7F6F2]"
          : "bg-[#F7F6F2]/80 hover:bg-[#E4EEE8]/40 border-l-4 border-l-[#1B4332]"
      }`}
    >
      {/* Type Icon Badge */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-black/5 ${typeConfig.bg} ${typeConfig.color}`}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4
              className={`text-xs truncate ${
                read ? "font-medium text-[#16160F]" : "font-bold text-[#16160F]"
              }`}
            >
              {title || typeConfig.defaultTitle}
            </h4>
            {!read && (
              <span className="w-2 h-2 rounded-full bg-[#1B4332] shrink-0" aria-label="Unread" />
            )}
          </div>
          <span className="text-[11px] text-[#6B6858] shrink-0">
            {formatRelativeTime(createdAt)}
          </span>
        </div>

        <p
          className={`text-xs text-[#6B6858] mt-0.5 leading-relaxed line-clamp-2 ${
            !read ? "text-[#16160F]/90 font-normal" : ""
          }`}
        >
          {message}
        </p>

        {sender && sender.name && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-4 h-4 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-[9px] font-bold overflow-hidden shrink-0">
              {sender.profilePicture ? (
                <img
                  src={sender.profilePicture}
                  alt={sender.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                sender.name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="text-[11px] text-[#6B6858] font-medium truncate">
              {sender.name}
            </span>
          </div>
        )}
      </div>

      {/* Quick Mark-Read Button for unread notifications */}
      {!read && (
        <button
          type="button"
          onClick={handleMarkReadOnly}
          title="Mark as read"
          className="absolute right-2.5 top-3 p-1 rounded-lg text-[#6B6858] hover:text-[#1B4332] hover:bg-[#E4EEE8] transition-colors focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
          aria-label="Mark notification as read"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
