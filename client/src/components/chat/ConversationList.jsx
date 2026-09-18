import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import NotificationBadge from "../NotificationBadge";
import { MessageSquareDashed, Search, X, Layers } from "lucide-react";
import MatchesIcon from "../icons/MatchesIcon";

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
  groupedConversations = [],
  activeUserId,
  loading = false,
  onSelectConversation,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return groupedConversations;

    return groupedConversations.filter((group) => {
      // Search by counterpart name
      const counterpartName = (group.counterpart?.name || "").toLowerCase();
      if (counterpartName.includes(normalizedQuery)) return true;

      // Search across all swap skill names within the group
      return group.swaps.some((swap) => {
        const offered = (swap.offeredSkillName || "").toLowerCase();
        const learned = (swap.learnedSkillName || "").toLowerCase();
        return (
          offered.includes(normalizedQuery) ||
          learned.includes(normalizedQuery)
        );
      });
    });
  }, [groupedConversations, normalizedQuery]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-[#F7F6F2] dark:bg-[#202520] rounded-2xl p-3.5 border border-[#E6E3DA] dark:border-[#2A2E29] flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-[#2A2E29] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-zinc-200 dark:bg-[#2A2E29] rounded w-1/2" />
              <div className="h-3 bg-zinc-200 dark:bg-[#2A2E29]/70 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasNoConversationsAtAll =
    !groupedConversations || groupedConversations.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
      {/* Search Input Bar (Only show if user has conversations) */}
      {!hasNoConversationsAtAll && (
        <div className="px-3.5 pb-2.5 pt-1 border-b border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18] shrink-0">
          <div className="relative flex items-center bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl">
            <Search className="w-3.5 h-3.5 text-[#6B6858] dark:text-[#9C9A8C] ml-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              style={{ outline: "none", boxShadow: "none" }}
              className="w-full px-2 py-1 text-xs text-[#16160F] dark:text-[#F2F1EC] placeholder-[#6B6858] dark:placeholder-[#9C9A8C] bg-transparent border-none outline-none ring-0 shadow-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 mr-1 text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] rounded-md transition-colors cursor-pointer border-none outline-none ring-0 shadow-none"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Conversation Thread List */}
      <div className="flex-1 overflow-y-auto p-3 pb-20 md:pb-3 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-[#2A2E29]">
        {hasNoConversationsAtAll ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 rounded-2xl bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] flex items-center justify-center mb-2">
              <MessageSquareDashed className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1">
              No Conversations Yet
            </h4>
            <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] max-w-xs">
              Chat becomes available once you have an accepted skill swap.
            </p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-semibold text-[#6B6858] dark:text-[#9C9A8C]">
              No conversations found.
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const counterpartId = group.counterpartId;
            const isActive =
              activeUserId?.toString() === counterpartId?.toString();
            const counterpart = group.counterpart;
            const counterpartName = counterpart?.name || "Swap Partner";
            const counterpartAvatar = counterpart?.profilePicture;
            const timeStr = formatPreviewTime(group.latestActivityAt);
            const lastMsg = group.latestLastMessage?.isDeleted
              ? "This message was deleted"
              : group.latestLastMessage?.content || "No messages yet";

            const skillContext = group.latestSkillContext || "Skill Swap";
            const swapCount = group.swaps?.length || 0;

            return (
              <Link
                key={counterpartId}
                to={`/chats/${counterpartId}`}
                onClick={() => onSelectConversation?.(counterpartId)}
                className={`group block p-3 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#E4EEE8] dark:bg-[#1C2E24] border-[#1B4332]/30 dark:border-[#3FA873]/30 shadow-2xs"
                    : "bg-white dark:bg-[#181B18] border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332]/20 dark:hover:border-[#3FA873]/30 hover:bg-[#F7F6F2]/80 dark:hover:bg-[#202520]"
                }`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] font-bold text-xs flex items-center justify-center border border-white dark:border-[#2A2E29] shadow-2xs shrink-0 overflow-hidden">
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
                        <span className="text-xs font-extrabold text-[#16160F] dark:text-[#F2F1EC] truncate group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873] transition-colors">
                          {counterpartName}
                        </span>
                      </div>

                      <div className="text-[10px] font-semibold text-[#1B4332] dark:text-[#3FA873] truncate flex items-center gap-1">
                        <MatchesIcon className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{skillContext}</span>
                      </div>

                      {/* Swap count indicator for multi-swap users */}
                      {swapCount > 1 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Layers className="w-2.5 h-2.5 text-[#6B6858] dark:text-[#9C9A8C] shrink-0" />
                          <span className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] font-medium">
                            {swapCount} swaps
                          </span>
                        </div>
                      )}

                      <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] truncate mt-0.5 max-w-[170px]">
                        {lastMsg}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {timeStr && (
                      <span className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] font-medium">
                        {timeStr}
                      </span>
                    )}
                    {group.totalUnreadCount > 0 && (
                      <NotificationBadge
                        count={group.totalUnreadCount}
                        variant="inline"
                      />
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
