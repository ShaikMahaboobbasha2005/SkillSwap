import { Link } from "react-router-dom";
import { ArrowLeft, WifiOff, RefreshCw, Trash2, Video } from "lucide-react";
import SwapSelector, { getSkillPair } from "./SwapSelector";

/**
 * ChatHeader Component
 *
 * Displays conversation header with counterpart profile info, relative skill exchange summary,
 * back navigation, swap selector (when multiple swaps exist), video call action, and connection status indicator.
 */
export default function ChatHeader({
  swap,
  currentUserId,
  isConnected = true,
  connectionError = null,
  isReadOnly = false,
  onDeleteHistory = null,
  allSwaps = null,
  activeSwapId = null,
  onSwapChange = null,
  onOpenVideoMenu = null,
}) {
  if (!swap) return null;

  const isSender = swap.fromUser?._id?.toString() === currentUserId?.toString();
  const counterpart = isSender ? swap.toUser : swap.fromUser;

  const counterpartId = counterpart?._id || counterpart?.id;
  const counterpartName = counterpart?.name || "Swap Partner";
  const counterpartAvatar = counterpart?.profilePicture;

  // Derive skill labels using snapshot-first resolution for safety against deleted/edited skills
  const skills = getSkillPair(swap, currentUserId);
  const offeredSkillName = skills.offered;
  const learnedSkillName = skills.learned;

  // Determine if we should show the swap selector
  const hasMultipleSwaps =
    Array.isArray(allSwaps) && allSwaps.length > 1 && !isReadOnly;

  return (
    <header className="bg-white dark:bg-[#181B18] border-b border-[#E6E3DA] dark:border-[#2A2E29] px-4 py-2 sm:px-6 sticky top-0 z-30 shadow-2xs">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Left Action & Counterpart User Info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={isReadOnly ? "/swaps?tab=history" : "/chats"}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] bg-[#F7F6F2] dark:bg-[#202520] hover:bg-white dark:hover:bg-[#2A2E29] text-[#16160F] dark:text-[#F2F1EC] hover:text-[#1B4332] dark:hover:text-[#3FA873] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title={isReadOnly ? "Back to Swap History" : "Back to Conversations"}
            aria-label={isReadOnly ? "Back to Swap History" : "Back to Conversations"}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link
            to={counterpartId ? `/users/${counterpartId}` : "#"}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] font-bold text-xs sm:text-sm flex items-center justify-center border-2 border-white dark:border-[#2A2E29] shadow-2xs shrink-0 overflow-hidden hover:scale-105 transition-transform"
          >
            {counterpartAvatar ? (
              <img
                src={counterpartAvatar}
                alt={counterpartName}
                className="w-full h-full object-cover"
              />
            ) : (
              counterpartName.charAt(0).toUpperCase()
            )}
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={counterpartId ? `/users/${counterpartId}` : "#"}
                className="text-xs sm:text-sm font-extrabold text-[#16160F] dark:text-[#F2F1EC] hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors truncate"
              >
                {counterpartName}
              </Link>
              {isReadOnly && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                  Read-Only
                </span>
              )}
            </div>

            {/* Swap Selector (multi-swap) or Static Skill Exchange Summary (single swap) */}
            {hasMultipleSwaps ? (
              <SwapSelector
                swaps={allSwaps}
                activeSwapId={activeSwapId}
                currentUserId={currentUserId}
                onSelect={onSwapChange}
              />
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#6B6858] dark:text-[#9C9A8C] truncate">
                {offeredSkillName && (
                  <span>
                    You offer: <strong className="text-[#1B4332] dark:text-[#3FA873] font-bold">{offeredSkillName}</strong>
                  </span>
                )}
                {offeredSkillName && learnedSkillName && <span>·</span>}
                {learnedSkillName && (
                  <span>
                    You learn: <strong className="text-[#16160F] dark:text-[#F2F1EC] font-bold">{learnedSkillName}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Video Meeting Action (Only for active accepted swap) */}
          {!isReadOnly && swap?.status === "accepted" && onOpenVideoMenu && (
            <button
              type="button"
              onClick={onOpenVideoMenu}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] bg-[#F7F6F2] dark:bg-[#202520] hover:bg-[#E4EEE8] dark:hover:bg-[#2A2E29] text-[#16160F] dark:text-[#F2F1EC] hover:text-[#1B4332] dark:hover:text-[#3FA873] flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-2xs"
              title="Start or schedule video session"
              aria-label="Start or schedule video session"
            >
              <Video className="w-4 h-4 text-[#1B4332] dark:text-[#3FA873]" />
            </button>
          )}

          {/* Read-Only Delete from History Button */}
          {isReadOnly && onDeleteHistory && (
            <button
              type="button"
              onClick={onDeleteHistory}
              className="h-8 px-3 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
              title="Delete from my history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete from history</span>
            </button>
          )}

          {/* Connection Status Indicator */}
          {!isConnected && !isReadOnly && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 shrink-0">
              {connectionError ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span className="hidden sm:inline">Connection unavailable</span>
                  <span className="sm:hidden">Offline</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 animate-spin" />
                  <span className="hidden sm:inline">Reconnecting…</span>
                  <span className="sm:hidden">Connecting</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
