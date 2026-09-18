import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal";
import { getPortfolioReactions } from "../../services/portfolioService";
import { Users, AlertCircle, ArrowRight } from "lucide-react";
import { REACTION_CONFIG } from "./ReactionPicker";
import useAuth from "../../hooks/useAuth";

/**
 * PortfolioReactionsModal Component
 *
 * Polished social interaction panel displaying users who reacted to a portfolio item.
 * Opens above the active PortfolioLightbox.
 * Supports reaction category filtering and instant profile navigation on row click.
 * If the reacting user is the authenticated user, displays "You" with no profile link.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Object} props.item - Target portfolio item
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} [props.onCloseLightbox] - Close parent lightbox on navigation
 */
export default function PortfolioReactionsModal({
  isOpen,
  item,
  onClose,
  onCloseLightbox,
}) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const currentUserId = authUser?._id ? String(authUser._id) : authUser?.id ? String(authUser.id) : null;

  const fetchReactions = useCallback(async () => {
    if (!item?._id) return;
    setLoading(true);
    setError("");

    try {
      const res = await getPortfolioReactions(item._id);
      const list = Array.isArray(res?.data?.reactions)
        ? res.data.reactions
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setReactions(list);
    } catch (err) {
      console.error("Failed to load portfolio reactions:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load reactions."
      );
    } finally {
      setLoading(false);
    }
  }, [item?._id]);

  useEffect(() => {
    if (isOpen && item?._id) {
      setActiveTab("all");
      fetchReactions();
    } else {
      setReactions([]);
      setError("");
      setLoading(false);
    }
  }, [isOpen, item?._id, fetchReactions]);

  if (!isOpen || !item) return null;

  const totalCount = reactions.length;
  const likeCount = reactions.filter((r) => r.type === "like").length;
  const impressiveCount = reactions.filter((r) => r.type === "impressive").length;
  const greatWorkCount = reactions.filter((r) => r.type === "great_work").length;
  const creativeCount = reactions.filter((r) => r.type === "creative").length;

  const filteredReactions =
    activeTab === "all"
      ? reactions
      : reactions.filter((r) => r.type === activeTab);

  const handleUserRowClick = (userId) => {
    if (!userId) return;
    const cleanId = typeof userId === "string" ? userId : userId.toString?.();
    if (!cleanId || cleanId === "[object Object]") return;
    onClose?.();
    onCloseLightbox?.();
    navigate(`/profile/${cleanId}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      showCloseButton={false}
      closeOnBackdrop={true}
      closeOnEsc={true}
      zIndex="z-[100000]"
    >
      <div className="flex flex-col max-h-[82vh]">
        {/* Polished Header */}
        <div className="px-5 py-4 border-b border-[#E6E3DA] dark:border-[#2A2E29] flex items-center justify-between bg-white dark:bg-[#181B18] shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-[#16160F] dark:text-[#F2F1EC] tracking-tight">
              Reactions
            </h2>
            <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] font-medium mt-0.5">
              {totalCount === 1
                ? "1 person reacted"
                : `${totalCount} people reacted`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F7F6F2] dark:bg-[#202520] hover:bg-[#E4EEE8] dark:hover:bg-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] flex items-center justify-center transition-all cursor-pointer text-sm font-bold border border-[#E6E3DA] dark:border-[#2A2E29] active:scale-95"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Category Filter Tabs Bar */}
        {totalCount > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#E6E3DA] dark:border-[#2A2E29] bg-[#F7F6F2] dark:bg-[#202520] overflow-x-auto shrink-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer shrink-0 ${
                activeTab === "all"
                  ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] shadow-xs"
                  : "bg-white dark:bg-[#181B18] text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29]"
              }`}
            >
              All {totalCount}
            </button>

            {impressiveCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("impressive")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                  activeTab === "impressive"
                    ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] shadow-xs"
                    : "bg-white dark:bg-[#181B18] text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29]"
                }`}
              >
                <span>🔥</span>
                <span>{impressiveCount}</span>
              </button>
            )}

            {likeCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("like")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                  activeTab === "like"
                    ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] shadow-xs"
                    : "bg-white dark:bg-[#181B18] text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29]"
                }`}
              >
                <span>👍</span>
                <span>{likeCount}</span>
              </button>
            )}

            {greatWorkCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("great_work")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                  activeTab === "great_work"
                    ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] shadow-xs"
                    : "bg-white dark:bg-[#181B18] text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29]"
                }`}
              >
                <span>👏</span>
                <span>{greatWorkCount}</span>
              </button>
            )}

            {creativeCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("creative")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer shrink-0 inline-flex items-center gap-1 ${
                  activeTab === "creative"
                    ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] shadow-xs"
                    : "bg-white dark:bg-[#181B18] text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29]"
                }`}
              >
                <span>💡</span>
                <span>{creativeCount}</span>
              </button>
            )}
          </div>
        )}

        {/* User Reaction List Body */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-1.5 animate-fadeIn">
          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E6E3DA]/80 dark:bg-[#2A2E29]/80" />
                    <div className="space-y-1.5">
                      <div className="w-28 h-3 rounded bg-[#E6E3DA] dark:bg-[#2A2E29]" />
                      <div className="w-16 h-2.5 rounded bg-[#E6E3DA]/60 dark:bg-[#2A2E29]/60" />
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#E6E3DA] dark:bg-[#2A2E29]" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 my-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredReactions.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30 flex items-center justify-center mx-auto shadow-2xs">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC]">No reactions yet</p>
                <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">
                  Be the first to appreciate this work!
                </p>
              </div>
            </div>
          )}

          {/* Reacted User Rows */}
          {!loading && !error && filteredReactions.length > 0 && (
            <div className="space-y-1">
              {filteredReactions.map((reaction) => {
                const user = reaction.user || {};
                const userId = user._id ? String(user._id) : user.id ? String(user.id) : null;
                const isSelf = Boolean(currentUserId && userId && currentUserId === userId);
                const displayName = isSelf ? "You" : (user.name ? user.name.trim() : "Unknown User");
                const avatar = user.profilePicture || (isSelf ? authUser?.profilePicture : "") || "";
                const location = user.location || (isSelf ? authUser?.location : "") || "";
                const config = REACTION_CONFIG[reaction.type] || REACTION_CONFIG.like;

                return (
                  <div
                    key={reaction._id}
                    onClick={isSelf ? undefined : () => handleUserRowClick(userId)}
                    role={isSelf ? "listitem" : "button"}
                    tabIndex={isSelf ? -1 : 0}
                    onKeyDown={
                      isSelf
                        ? undefined
                        : (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleUserRowClick(userId);
                            }
                          }
                    }
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all select-none border border-transparent ${
                      isSelf
                        ? "bg-[#F7F6F2]/60 dark:bg-[#202520]/60 cursor-default"
                        : "hover:bg-[#F7F6F2] dark:hover:bg-[#202520] active:bg-[#E4EEE8] dark:active:bg-[#2A2E29] cursor-pointer group hover:border-[#E6E3DA] dark:hover:border-[#2A2E29] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/40 dark:focus:ring-[#3FA873]/40"
                    }`}
                    title={isSelf ? "Your reaction" : `View ${displayName}'s profile`}
                  >
                    {/* Left: Avatar + Name + Subtitle */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] font-bold text-xs flex items-center justify-center overflow-hidden border border-[#E6E3DA] dark:border-[#2A2E29] shrink-0 shadow-2xs ${!isSelf ? "group-hover:scale-105 transition-transform" : ""}`}>
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-bold truncate ${isSelf ? "text-[#1B4332] dark:text-[#3FA873]" : "text-[#16160F] dark:text-[#F2F1EC] group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873] transition-colors"}`}>
                            {displayName}
                          </p>
                          {!isSelf && (
                            <span className="text-[10px] text-[#3FA873] font-semibold opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5">
                              <span>View profile</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        {isSelf ? (
                          <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] font-medium flex items-center gap-1 mt-0.5">
                            <span>{config.emoji}</span>
                            <span>{config.label}</span>
                          </p>
                        ) : location ? (
                          <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] font-medium truncate mt-0.5">
                            {location}
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] font-medium flex items-center gap-1 mt-0.5">
                            <span>{config.emoji}</span>
                            <span>{config.label}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Reaction Emoji Badge */}
                    <div
                      className={`w-8 h-8 rounded-full bg-[#E4EEE8] dark:bg-[#1C2E24] border border-[#1B4332]/20 dark:border-[#3FA873]/30 flex items-center justify-center text-base shrink-0 shadow-2xs ${!isSelf ? "group-hover:scale-110 transition-transform" : ""}`}
                      title={config.label}
                    >
                      <span>{config.emoji}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
