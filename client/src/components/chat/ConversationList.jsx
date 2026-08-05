import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import NotificationBadge from "../NotificationBadge";
import { MessageSquareDashed, Sparkles, Search, X } from "lucide-react";

/**
 * Format timestamp cleanly for conversation list previews
 */
function formatPreviewTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const timeStr = `${formattedHours}:${minutes} ${ampm}`;

  if (isToday) return timeStr;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
}

export default function ConversationList({
  conversations = [],
  activeSwapId,
  loading = false,
  onSelectConversation,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredConversations = useMemo(() => {
    if (!normalizedQuery) return conversations;

    return conversations.filter((item) => {
      const counterpartName = (item.counterpart?.name || "").toLowerCase();
      const offeredSkill = (item.offeredSkillName || "").toLowerCase();
      const learnedSkill = (item.learnedSkillName || "").toLowerCase();

      return (
        counterpartName.includes(normalizedQuery) ||
        offeredSkill.includes(normalizedQuery) ||
        learnedSkill.includes(normalizedQuery)
      );
    });
  }, [conversations, normalizedQuery]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-[#F7F6F2] rounded-2xl p-3.5 border border-[#E6E3DA] flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-zinc-200 rounded w-1/2" />
              <div className="h-3 bg-zinc-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasNoConversationsAtAll = !conversations || conversations.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      {/* Search Input Bar (Only show if user has conversations) */}
      {!hasNoConversationsAtAll && (
        <div className="px-3.5 pb-2.5 pt-1 border-b border-[#E6E3DA] bg-white shrink-0">
          <div className="relative flex items-center bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl">
            <Search className="w-3.5 h-3.5 text-[#6B6858] ml-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              style={{ outline: "none", boxShadow: "none" }}
              className="w-full px-2 py-1 text-xs text-[#16160F] placeholder-[#6B6858] bg-transparent border-none outline-none ring-0 shadow-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 mr-1 text-[#6B6858] hover:text-[#16160F] rounded-md transition-colors cursor-pointer border-none outline-none ring-0 shadow-none"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Conversation Thread List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-300">
        {hasNoConversationsAtAll ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 rounded-2xl bg-[#E4EEE8] text-[#1B4332] flex items-center justify-center mb-2">
              <MessageSquareDashed className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#16160F] mb-1">
              No Conversations Yet
            </h4>
            <p className="text-[11px] text-[#6B6858] max-w-xs">
              Chat becomes available once you have an accepted skill swap.
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-semibold text-[#6B6858]">
              No conversations found.
            </p>
          </div>
        ) : (
          filteredConversations.map((item) => {
            const swapId = item.swapId;
            const isActive = activeSwapId?.toString() === swapId?.toString();
            const counterpart = item.counterpart;
            const counterpartName = counterpart?.name || "Swap Partner";
            const counterpartAvatar = counterpart?.profilePicture;
            const timeStr = formatPreviewTime(item.lastActivityAt);
            const lastMsg = item.lastMessage?.isDeleted
              ? "This message was deleted"
              : item.lastMessage?.content || "No messages yet";

            const skillContext =
              item.offeredSkillName && item.learnedSkillName
                ? `${item.offeredSkillName} ↔ ${item.learnedSkillName}`
                : item.offeredSkillName || item.learnedSkillName || "Skill Swap";

            return (
              <Link
                key={swapId}
                to={`/swaps/${swapId}/chat`}
                onClick={() => onSelectConversation?.(swapId)}
                className={`group block p-3 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#E4EEE8] border-[#1B4332]/30 shadow-2xs"
                    : "bg-white border-[#E6E3DA] hover:border-[#1B4332]/20 hover:bg-[#F7F6F2]/80"
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white font-bold text-xs flex items-center justify-center border border-white shadow-2xs shrink-0 overflow-hidden">
                      {counterpartAvatar ? (
                        <img
                          src={counterpartAvatar}
                          alt={counterpartName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        counterpartName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-[#16160F] truncate group-hover:text-[#1B4332] transition-colors">
                          {counterpartName}
                        </span>
                      </div>

                      <div className="text-[10px] font-semibold text-[#1B4332] truncate flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{skillContext}</span>
                      </div>

                      <p className="text-[11px] text-[#6B6858] truncate mt-0.5 max-w-[170px]">
                        {lastMsg}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {timeStr && (
                      <span className="text-[10px] text-[#6B6858] font-medium">
                        {timeStr}
                      </span>
                    )}
                    {item.unreadCount > 0 && (
                      <NotificationBadge count={item.unreadCount} variant="inline" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
