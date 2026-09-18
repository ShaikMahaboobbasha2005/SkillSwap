import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  UserMinus,
  Clock,
  Trophy,
  AlertCircle,
  Calendar,
  CalendarX,
  Video,
  Bell,
  Star,
  Check,
  ArrowRight,
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

/**
 * Derives swap skill context dynamically from populated swap data
 */
const getSwapSkillContext = (swap) => {
  if (!swap || typeof swap !== "object") return null;

  const offeredName =
    swap.offeredSkill?.name ||
    (typeof swap.offeredSkill === "string" ? swap.offeredSkill : "") ||
    swap.offeredSkillSnapshot?.name ||
    swap.offeredSkillName ||
    "";
  const wantedName =
    swap.wantedSkill?.name ||
    (typeof swap.wantedSkill === "string" ? swap.wantedSkill : "") ||
    swap.wantedSkillSnapshot?.name ||
    swap.wantedSkillName ||
    "";

  if (offeredName && wantedName) {
    return {
      title: `${offeredName} ↔ ${wantedName}`,
      subtitle: "Skill Swap",
    };
  } else if (offeredName || wantedName) {
    return {
      title: offeredName || wantedName,
      subtitle: "Skill Swap",
    };
  }
  return null;
};

const getTypeConfig = (type) => {
  switch (type) {
    case "swap_request":
      return {
        icon: ArrowLeftRight,
        color: "text-[#1B4332] dark:text-[#3FA873]",
        bg: "bg-[#E4EEE8] dark:bg-[#1C2E24]",
        border: "border-[#1B4332]/20 dark:border-[#3FA873]/30",
        defaultTitle: "New Swap Request",
        actionText: "View Request",
      };
    case "swap_accepted":
      return {
        icon: CheckCircle2,
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-200 dark:border-emerald-800/50",
        defaultTitle: "Swap Accepted",
        actionText: "Open Chat",
      };
    case "swap_rejected":
      return {
        icon: XCircle,
        color: "text-rose-700 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-950/40",
        border: "border-rose-200 dark:border-rose-800/50",
        defaultTitle: "Swap Declined",
        actionText: "Open History",
      };
    case "swap_left":
      return {
        icon: UserMinus,
        color: "text-amber-800 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-200 dark:border-amber-800/50",
        defaultTitle: "Swap Ended",
        actionText: "Open History",
      };
    case "completion_request":
      return {
        icon: Clock,
        color: "text-indigo-700 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-950/40",
        border: "border-indigo-200 dark:border-indigo-800/50",
        defaultTitle: "Completion Requested",
        actionText: "Confirm Swap",
      };
    case "completion_confirmed":
      return {
        icon: Trophy,
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-200 dark:border-emerald-800/50",
        defaultTitle: "Swap Completed",
        actionText: "Open History",
      };
    case "completion_cancelled":
      return {
        icon: AlertCircle,
        color: "text-rose-700 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-950/40",
        border: "border-rose-200 dark:border-rose-800/50",
        defaultTitle: "Completion Not Confirmed",
        actionText: "Open Chat",
      };
    case "meeting_scheduled":
      return {
        icon: Calendar,
        color: "text-[#1B4332] dark:text-[#3FA873]",
        bg: "bg-[#E4EEE8] dark:bg-[#1C2E24]",
        border: "border-[#1B4332]/20 dark:border-[#3FA873]/30",
        defaultTitle: "Video Session Scheduled",
        actionText: "View Session",
      };
    case "meeting_started":
      return {
        icon: Video,
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-100 dark:bg-emerald-950/60",
        border: "border-emerald-300 dark:border-emerald-800/60",
        defaultTitle: "Video Session Starting",
        actionText: "Join Call Now",
      };
    case "meeting_reminder":
      return {
        icon: Bell,
        color: "text-amber-800 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-200 dark:border-amber-800/50",
        defaultTitle: "Upcoming Video Session",
        actionText: "Open Chat",
      };
    case "meeting_cancelled":
      return {
        icon: CalendarX,
        color: "text-rose-700 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-950/40",
        border: "border-rose-200 dark:border-rose-800/50",
        defaultTitle: "Session Cancelled",
        actionText: "Open Chat",
      };
    case "rating_received":
      return {
        icon: Star,
        color: "text-[#B8860B] dark:text-amber-400",
        bg: "bg-[#FEF9C3] dark:bg-amber-950/40",
        border: "border-[#B8860B]/20 dark:border-amber-700/30",
        defaultTitle: "New Review Received",
        actionText: "View Review",
      };
    default:
      return {
        icon: Bell,
        color: "text-[#1B4332] dark:text-[#3FA873]",
        bg: "bg-[#E4EEE8] dark:bg-[#1C2E24]",
        border: "border-[#1B4332]/20 dark:border-[#3FA873]/30",
        defaultTitle: "Notification",
        actionText: "Open",
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
  const swapContext = getSwapSkillContext(swap);

  // Safely extract swap ID across object, string, or legacy properties
  const swapId =
    swap?._id ||
    swap?.id ||
    (typeof swap === "string" ? swap : notification.swapId || null);

  const handleClick = (e) => {
    // Mark as read immediately
    if (!read) {
      markAsRead(_id);
    }

    if (onClose) {
      onClose();
    }

    // Exact deep-linking behavior per Phase 11.2 specification
    const encodedSwapId = swapId ? encodeURIComponent(swapId) : "";

    switch (type) {
      case "swap_request":
        if (encodedSwapId) {
          navigate(`/swaps?tab=incoming&highlight=${encodedSwapId}`);
        } else {
          navigate("/swaps?tab=incoming");
        }
        break;

      case "swap_accepted":
        if (swapId) {
          navigate(`/swaps/${swapId}/chat`);
        } else {
          navigate("/chats");
        }
        break;

      case "swap_rejected":
        if (encodedSwapId) {
          navigate(`/swaps?tab=history&highlight=${encodedSwapId}`);
        } else {
          navigate("/swaps?tab=history");
        }
        break;

      case "swap_left":
        if (encodedSwapId) {
          navigate(`/swaps?tab=history&highlight=${encodedSwapId}`);
        } else {
          navigate("/swaps?tab=history");
        }
        break;

      case "completion_request":
        if (swapId) {
          navigate(`/swaps/${swapId}/chat?highlight=completion`);
        } else {
          navigate("/chats");
        }
        break;

      case "completion_confirmed":
        if (encodedSwapId) {
          navigate(`/swaps?tab=history&highlight=${encodedSwapId}`);
        } else {
          navigate("/swaps?tab=history");
        }
        break;

      case "completion_cancelled":
        if (swapId) {
          navigate(`/swaps/${swapId}/chat`);
        } else {
          navigate("/chats");
        }
        break;

      case "meeting_scheduled":
        if (swapId) {
          navigate(`/swaps/${swapId}/chat?highlight=meeting`);
        } else {
          navigate("/chats");
        }
        break;

      case "meeting_started":
        if (swapId) {
          navigate(`/swaps/${swapId}/chat?highlight=meeting`);
        } else {
          navigate("/chats");
        }
        break;

      case "meeting_reminder":
        if (swapId) {
          navigate(`/swaps/${swapId}/chat?highlight=meeting`);
        } else {
          navigate("/chats");
        }
        break;

      case "meeting_cancelled":
        if (swapId) {
          navigate(`/swaps/${swapId}/chat?highlight=meeting`);
        } else {
          navigate("/chats");
        }
        break;

      case "rating_received":
        if (encodedSwapId) {
          navigate(`/profile?highlightSwap=${encodedSwapId}`);
        } else {
          navigate("/profile");
        }
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
      className={`group relative flex items-start gap-3 transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#3FA873]/20 ${
        compact
          ? "p-3 rounded-xl border border-transparent hover:border-[#E6E3DA] dark:hover:border-[#2A2E29]"
          : "p-4 sm:p-5 rounded-2xl border border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332]/30 dark:hover:border-[#3FA873]/30 hover:shadow-xs"
      } ${
        read
          ? "bg-white dark:bg-[#181B18] hover:bg-[#F7F6F2] dark:hover:bg-[#202520]"
          : "bg-white dark:bg-[#181B18] hover:bg-[#F7F6F2]/90 dark:hover:bg-[#202520]/90 border-l-4 border-l-[#1B4332] dark:border-l-[#3FA873] shadow-2xs"
      }`}
    >
      {/* Type Icon Badge */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${typeConfig.border} ${typeConfig.bg} ${typeConfig.color} transition-transform group-hover:scale-105 duration-200`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Main Notification Body */}
      <div className="flex-1 min-w-0 pr-6">
        {/* Header Row: Title, Unread Dot, Timestamp */}
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4
              className={`text-xs sm:text-sm tracking-tight truncate ${
                read ? "font-semibold text-[#16160F]/90 dark:text-[#F2F1EC]/90" : "font-bold text-[#16160F] dark:text-[#F2F1EC]"
              }`}
            >
              {title || typeConfig.defaultTitle}
            </h4>
            {!read && (
              <span
                className="w-2 h-2 rounded-full bg-[#1B4332] dark:bg-[#3FA873] shrink-0 animate-pulse"
                aria-label="Unread notification"
                title="Unread"
              />
            )}
          </div>
          <span className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] font-medium shrink-0">
            {formatRelativeTime(createdAt)}
          </span>
        </div>

        {/* Message Body */}
        <p
          className={`text-xs text-[#6B6858] dark:text-[#9C9A8C] mt-1 leading-relaxed ${
            compact ? "line-clamp-2" : "line-clamp-3"
          } ${!read ? "text-[#16160F]/85 dark:text-[#F2F1EC]/85 font-normal" : ""}`}
        >
          {message}
        </p>

        {/* Specific Swap Context Pill / Card */}
        {swapContext && (
          <div
            className={`mt-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
              compact
                ? "px-2.5 py-1.5 bg-[#F7F6F2] dark:bg-[#202520] border-[#E6E3DA]/80 dark:border-[#2A2E29]/80"
                : "px-3 py-2 bg-[#F7F6F2] dark:bg-[#202520] border-[#E6E3DA] dark:border-[#2A2E29] group-hover:border-[#1B4332]/20 dark:group-hover:border-[#3FA873]/20"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] truncate">
                {swapContext.title}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#6B6858] dark:text-[#9C9A8C] px-2 py-0.5 rounded-md bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] shrink-0">
              {swapContext.subtitle}
            </span>
          </div>
        )}

        {/* Footer Meta Row: Sender info and Action CTA */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-1 border-t border-black/5 dark:border-white/10">
          {sender && sender.name ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] flex items-center justify-center text-[9px] sm:text-[10px] font-bold overflow-hidden shrink-0">
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
              <span className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] font-medium truncate max-w-[120px] sm:max-w-[180px]">
                {sender.name}
              </span>
            </div>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1B4332] dark:text-[#3FA873] group-hover:text-[#143326] dark:group-hover:text-[#52B788] transition-colors shrink-0">
            <span>{typeConfig.actionText}</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 duration-200" />
          </div>
        </div>
      </div>

      {/* Quick Mark-Read Button for unread notifications */}
      {!read && (
        <button
          type="button"
          onClick={handleMarkReadOnly}
          title="Mark as read"
          className="absolute right-2.5 top-3 p-1 rounded-lg text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#1B4332] dark:hover:text-[#3FA873] hover:bg-[#E4EEE8] dark:hover:bg-[#1C2E24] transition-colors focus:outline-none focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#3FA873] cursor-pointer"
          aria-label="Mark notification as read"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

