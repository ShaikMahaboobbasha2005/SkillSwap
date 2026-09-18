import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import ratingService from "../../services/ratingService";
import {
  ArrowRight,
  UserCheck,
  Calendar,
  MessageSquare,
  Check,
  X as XIcon,
  Ban,
  Sparkles,
  Star,
  Clock,
  MoreVertical,
  EyeOff,
} from "lucide-react";
import { OfferedSkillIcon, WantedSkillIcon } from "../icons";

/**
 * SwapRequestCard Component
 *
 * Renders a Linear-inspired flat card for a single swap request (incoming, outgoing, or history).
 *
 * @param {Object} props
 * @param {Object} props.swap - Swap request object from API
 * @param {"incoming" | "outgoing" | "history"} props.type - Tab context
 * @param {Function} [props.onAccept] - Triggered when Accept is clicked (Incoming pending)
 * @param {Function} [props.onReject] - Triggered when Reject is clicked (Incoming pending)
 * @param {Function} [props.onCancel] - Triggered when Cancel is clicked (Outgoing pending)
 * @param {Function} [props.onComplete] - Triggered when Complete is clicked
 * @param {Function} [props.onCancelCompletion] - Triggered when Cancel Completion is clicked
 * @param {Function} [props.onLeave] - Triggered when Leave is clicked
 * @param {Function} [props.onRatePartner] - Triggered when Rate Partner is clicked
 * @param {Function} [props.onHide] - Triggered when Hide from list is clicked
 * @param {boolean} [props.isProcessing] - Disables action buttons during in-flight request
 */
export default function SwapRequestCard({
  swap,
  type = "incoming",
  currentUserId = null,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  onCancelCompletion,
  onLeave,
  onRatePartner,
  onHide,
  isProcessing = false,
  isHighlighted = false,
}) {
  if (!swap) return null;

  const isIncoming = type === "incoming";
  const isHistory = type === "history";
  const status = swap.status ? swap.status.toLowerCase() : "pending";
  const isPending = status === "pending";
  const isAccepted = status === "accepted";
  const isCompleted = status === "completed";
  const isLeft = status === "left";
  const isCancelled = status === "cancelled";

  const swapId = swap._id || swap.id;
  const [hasRated, setHasRated] = useState(false);
  const [loadingRatingStatus, setLoadingRatingStatus] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close overflow menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    let isMounted = true;

    // Strict eligibility check: ONLY fetch rating status for completed swaps
    if (isCompleted && swapId) {
      setLoadingRatingStatus(true);
      ratingService
        .getRatingStatusForSwap(swapId)
        .then((res) => {
          if (isMounted && res?.success && res?.data) {
            setHasRated(Boolean(res.data.hasRated));
          }
        })
        .catch((err) => {
          console.warn(`Failed to check rating status for swap ${swapId}:`, err?.message);
        })
        .finally(() => {
          if (isMounted) {
            setLoadingRatingStatus(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isCompleted, swapId]);

  // Compare IDs safely regardless of String vs ObjectId
  const fromUserIdStr = swap.fromUser?._id ? String(swap.fromUser._id) : (typeof swap.fromUser === "string" ? swap.fromUser : "");
  const currentUserIdStr = currentUserId ? String(currentUserId) : "";
  const isFromMe = Boolean(fromUserIdStr && currentUserIdStr && fromUserIdStr === currentUserIdStr);

  // Identify counterpart user
  const counterpart = isIncoming
    ? swap.fromUser
    : isHistory
    ? (isFromMe ? swap.toUser : swap.fromUser)
    : swap.toUser;

  const counterpartId = counterpart?._id || counterpart?.id || (typeof counterpart === "string" ? counterpart : "");
  const counterpartName = counterpart && typeof counterpart === "object" && counterpart.name ? counterpart.name : "Community Member";
  const counterpartAvatar = counterpart && typeof counterpart === "object" ? counterpart.profilePicture || counterpart.avatar : "";
  const counterpartLocation = counterpart && typeof counterpart === "object" ? counterpart.location : "";

  // Identify skills
  const offeredSkill = swap.offeredSkill;
  const wantedSkill = swap.wantedSkill;

  // Helper to extract skill name robustly across populated skill object, snapshot fields, or string
  const getSkillName = (skillObj, snapshotName, fallback) => {
    if (skillObj && typeof skillObj === "object") {
      const resolved =
        skillObj.name ||
        skillObj.title ||
        skillObj.skillName ||
        skillObj.skill?.name ||
        skillObj.skill?.title;
      if (resolved && resolved.trim().length > 0) return resolved;
    }
    if (typeof skillObj === "string" && skillObj.trim().length > 0) {
      return skillObj;
    }
    if (snapshotName && typeof snapshotName === "string" && snapshotName.trim().length > 0) {
      return snapshotName;
    }
    return fallback;
  };

  const getSkillLevel = (skillObj, snapshotLevel) => {
    if (skillObj && typeof skillObj === "object" && skillObj.level) {
      return skillObj.level;
    }
    if (snapshotLevel && typeof snapshotLevel === "string" && snapshotLevel.trim().length > 0) {
      return snapshotLevel;
    }
    return null;
  };

  const snapshotOfferedName = swap.offeredSkillSnapshot?.name || swap.offeredSkillName;
  const snapshotOfferedLevel = swap.offeredSkillSnapshot?.level || swap.offeredSkillLevel;
  const snapshotWantedName = swap.wantedSkillSnapshot?.name || swap.wantedSkillName;
  const snapshotWantedLevel = swap.wantedSkillSnapshot?.level || swap.wantedSkillLevel;

  const offeredSkillName = getSkillName(offeredSkill, snapshotOfferedName, "Skill Offered");
  const wantedSkillName = getSkillName(wantedSkill, snapshotWantedName, "Skill Requested");
  const offeredSkillLevel = getSkillLevel(offeredSkill, snapshotOfferedLevel);
  const wantedSkillLevel = getSkillLevel(wantedSkill, snapshotWantedLevel);

  // Format date
  const displayDateRaw = swap.endedAt || swap.updatedAt || swap.createdAt;
  const formattedDate = displayDateRaw
    ? new Date(displayDateRaw).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Identify who left for 'left' status
  let leftByText = "";
  if (isLeft) {
    const leftByIdStr = swap.leftBy?._id
      ? String(swap.leftBy._id)
      : swap.leftBy?.id
      ? String(swap.leftBy.id)
      : swap.leftBy
      ? String(swap.leftBy)
      : "";
    const isMe = Boolean(currentUserIdStr && leftByIdStr && leftByIdStr === currentUserIdStr);
    const leftByName = swap.leftBy && typeof swap.leftBy === "object" && swap.leftBy.name ? swap.leftBy.name : counterpartName;
    leftByText = isMe ? "Left by You" : `Left by ${leftByName}`;
  }

  // Completion confirmation flags
  const requestedById = swap.completionRequestedBy?._id || swap.completionRequestedBy?.id || swap.completionRequestedBy;
  const isRequestedByMe = Boolean(currentUserIdStr && requestedById && String(requestedById) === currentUserIdStr);
  const isRequestedByPartner = Boolean(requestedById && (!currentUserIdStr || String(requestedById) !== currentUserIdStr));

  return (
    <article
      id={`swap-card-${swapId}`}
      data-swap-id={swapId}
      className={`rounded-2xl p-5 shadow-xs transition-all duration-500 flex flex-col justify-between space-y-4 group border ${
        isHighlighted
          ? "bg-[#E4EEE8]/40 dark:bg-[#1C2E24]/50 border-[#1B4332] dark:border-[#3FA873] ring-2 ring-[#1B4332]/30 dark:ring-[#3FA873]/40 shadow-md scale-[1.01]"
          : "bg-white dark:bg-[#181B18] border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332]/30 dark:hover:border-[#3FA873]/40"
      }`}
      aria-label={`Swap request with ${counterpartName}`}
    >
      {/* Top Header: Counterpart User Info + Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={counterpartId ? `/users/${counterpartId}` : "#"}
            className="w-11 h-11 rounded-full bg-[#1B4332] dark:bg-[#1C2E24] text-white dark:text-[#3FA873] font-bold text-sm flex items-center justify-center border-2 border-white dark:border-[#181B18] shadow-xs shrink-0 overflow-hidden hover:scale-105 transition-transform"
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
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={counterpartId ? `/users/${counterpartId}` : "#"}
                className="text-sm font-extrabold text-[#16160F] dark:text-[#F2F1EC] hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors truncate"
              >
                {counterpartName}
              </Link>
              {isHighlighted && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] shadow-2xs animate-pulse shrink-0">
                  <Sparkles className="w-3 h-3" /> From Notification
                </span>
              )}
              {!isHistory && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F7F6F2] dark:bg-[#202520] text-[#6B6858] dark:text-[#9C9A8C] border border-[#E6E3DA] dark:border-[#2A2E29]">
                  {isIncoming ? "From" : "To"}
                </span>
              )}
              {isLeft && leftByText && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-[#202520] text-zinc-700 dark:text-[#9C9A8C] border border-zinc-200 dark:border-[#2A2E29]">
                  {leftByText}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-0.5 text-xs text-[#6B6858] dark:text-[#9C9A8C]">
              {counterpartLocation && (
                <span className="truncate">{counterpartLocation}</span>
              )}
              {formattedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#6B6858] dark:text-[#9C9A8C]" />
                  <span>
                    {isCompleted
                      ? `Completed: ${formattedDate}`
                      : isLeft
                      ? `Ended: ${formattedDate}`
                      : isCancelled
                      ? `Cancelled: ${formattedDate}`
                      : formattedDate}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge & Overflow Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={status} className="shrink-0" />
          {onHide && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
                }}
                className="w-7 h-7 rounded-lg text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] hover:bg-[#F7F6F2] dark:hover:bg-[#202520] border border-transparent hover:border-[#E6E3DA] dark:hover:border-[#2A2E29] transition-colors flex items-center justify-center cursor-pointer"
                title="Options"
                aria-label="Options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl shadow-lg py-1 z-20 animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onHide(swap);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] hover:bg-[#F7F6F2] dark:hover:bg-[#202520] flex items-center gap-2 transition-colors cursor-pointer text-left"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-[#6B6858] dark:text-[#9C9A8C]" />
                    <span>Hide from list</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle Exchange Box */}
      <div className="bg-[#F7F6F2] dark:bg-[#121512] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left Side: Offered Skill */}
        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C] block">
            {isIncoming
              ? `${counterpartName} Offers`
              : isHistory
              ? (isFromMe ? "You Offered" : `${counterpartName} Offered`)
              : "You Offered"}
          </span>
          <div className="flex items-center gap-2">
            <OfferedSkillIcon className="w-4 h-4 text-[#1B4332] dark:text-[#3FA873] shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-[#1B4332] dark:text-[#3FA873] truncate">
              {offeredSkillName}
            </span>
          </div>
          {offeredSkillLevel && (
            <span className="inline-block text-[10px] font-medium text-[#6B6858] dark:text-[#9C9A8C]">
              Level: {offeredSkillLevel}
            </span>
          )}
        </div>

        {/* Center Exchange Direction Indicator */}
        <div className="flex items-center justify-center shrink-0 self-center">
          <div className="w-7 h-7 rounded-full bg-[#E4EEE8] dark:bg-[#1C2E24] border border-[#1B4332]/20 dark:border-[#3FA873]/30 flex items-center justify-center text-[#1B4332] dark:text-[#3FA873]">
            <ArrowRight className="w-3.5 h-3.5 rotate-90 sm:rotate-0" />
          </div>
        </div>

        {/* Right Side: Wanted Skill */}
        <div className="flex-1 space-y-1 text-left sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C] block">
            {isIncoming
              ? "Requests Your"
              : isHistory
              ? (isFromMe ? "You Requested" : "Requested Your")
              : "You Requested"}
          </span>
          <div className="flex items-center gap-2 sm:justify-end">
            <WantedSkillIcon className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-[#16160F] dark:text-[#F2F1EC] truncate">
              {wantedSkillName}
            </span>
          </div>
          {wantedSkillLevel && (
            <span className="inline-block text-[10px] font-medium text-[#6B6858] dark:text-[#9C9A8C]">
              Level: {wantedSkillLevel}
            </span>
          )}
        </div>
      </div>

      {/* Optional Request Message Callout */}
      {swap.message && (
        <div className="bg-[#F7F6F2]/80 dark:bg-[#121512]/80 border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl p-3 text-xs text-[#16160F] dark:text-[#F2F1EC] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6858] dark:text-[#9C9A8C]">
            <MessageSquare className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#3FA873]" />
            <span>Note from {isIncoming ? counterpartName : "Requester"}:</span>
          </div>
          <p className="italic text-[#16160F] dark:text-[#F2F1EC] leading-relaxed pl-5">
            "{swap.message}"
          </p>
        </div>
      )}

      {/* Completion Confirmation Notice Callout for Accepted Swaps */}
      {isAccepted && requestedById && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            isRequestedByMe
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200"
              : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200"
          }`}
        >
          {isRequestedByMe ? (
            <>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
              <span>✓ Waiting for {counterpartName} to confirm completion</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{counterpartName} marked this swap as completed. Please confirm below.</span>
            </>
          )}
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E6E3DA]/60 dark:border-[#2A2E29] gap-2 flex-wrap">
        <Link
          to={`/users/${counterpartId}`}
          className="text-xs font-semibold text-[#1B4332] dark:text-[#3FA873] hover:underline inline-flex items-center gap-1"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>View Details</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Actions for Accepted Status */}
          {isAccepted && swapId && (
            <>
              {isRequestedByPartner ? (
                <>
                  {onCancelCompletion && (
                    <button
                      type="button"
                      onClick={() => onCancelCompletion(swap)}
                      disabled={isProcessing}
                      className="h-8 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#202520] hover:bg-zinc-200 dark:hover:bg-[#283028] border border-zinc-300 dark:border-[#2A2E29] rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                    >
                      <XIcon className="w-3.5 h-3.5 text-zinc-600 dark:text-[#767468]" />
                      <span>Not Yet</span>
                    </button>
                  )}

                  {onComplete && (
                    <button
                      type="button"
                      onClick={() => onComplete(swap)}
                      disabled={isProcessing}
                      className="h-8 px-4 text-xs font-semibold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#338d60] rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Completion</span>
                    </button>
                  )}
                </>
              ) : isRequestedByMe ? (
                <>
                  {onCancelCompletion && (
                    <button
                      type="button"
                      onClick={() => onCancelCompletion(swap)}
                      disabled={isProcessing}
                      className="h-8 px-3 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-300 dark:border-amber-800/50 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                    >
                      <XIcon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>Cancel Request</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  {onComplete && (
                    <button
                      type="button"
                      onClick={() => onComplete(swap)}
                      disabled={isProcessing}
                      className="h-8 px-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/50 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  {onLeave && (
                    <button
                      type="button"
                      onClick={() => onLeave(swap)}
                      disabled={isProcessing}
                      className="h-8 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#202520] hover:bg-zinc-200 dark:hover:bg-[#283028] border border-zinc-300 dark:border-[#2A2E29] rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5 text-zinc-600 dark:text-[#767468]" />
                      <span>Leave Swap</span>
                    </button>
                  )}
                </>
              )}

              <Link
                to={counterpartId ? `/chats/${counterpartId}` : "/chats"}
                className="h-8 px-4 text-xs font-semibold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#338d60] rounded-xl transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Chat</span>
              </Link>
            </>
          )}
          {/* Actions for History Mode (Completed or Left) */}
          {(isCompleted || isLeft) && swapId && (
            <>
              {isCompleted && (
                hasRated ? (
                  <span className="h-8 px-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Review Submitted</span>
                  </span>
                ) : (
                  onRatePartner && (
                    <button
                      type="button"
                      onClick={() => onRatePartner(swap, () => setHasRated(true))}
                      disabled={isProcessing || loadingRatingStatus}
                      className="h-8 px-3.5 text-xs font-bold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#338d60] rounded-xl transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Rate Partner</span>
                    </button>
                  )
                )
              )}

              <Link
                to={`/swaps/${swapId}/chat`}
                className="h-8 px-3.5 text-xs font-semibold text-[#1B4332] dark:text-[#3FA873] bg-[#E4EEE8] dark:bg-[#1C2E24] hover:bg-[#d5e5db] dark:hover:bg-[#243d30] border border-[#1B4332]/20 dark:border-[#3FA873]/30 rounded-xl transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#3FA873]" />
                <span>View Chat</span>
              </Link>
            </>
          )}

          {/* Actions for Pending Status */}
          {isPending && (
            <>
              {isIncoming ? (
                <>
                  <button
                    type="button"
                    onClick={onReject ? () => onReject(swap) : undefined}
                    disabled={isProcessing}
                    className="h-8 px-3.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-800/40 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={onAccept ? () => onAccept(swap) : undefined}
                    disabled={isProcessing}
                    className="h-8 px-4 text-xs font-semibold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#338d60] rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Swap</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onCancel ? () => onCancel(swap) : undefined}
                  disabled={isProcessing}
                  className="h-8 px-3.5 text-xs font-semibold text-[#6B6858] dark:text-[#9C9A8C] hover:text-red-700 dark:hover:text-red-400 bg-[#F7F6F2] dark:bg-[#202520] hover:bg-red-50 dark:hover:bg-red-950/40 border border-[#E6E3DA] dark:border-[#2A2E29] hover:border-red-200 dark:hover:border-red-800/40 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Request</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
