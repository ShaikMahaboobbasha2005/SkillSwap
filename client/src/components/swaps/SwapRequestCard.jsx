import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import {
  GraduationCap,
  ArrowRight,
  UserCheck,
  Calendar,
  MessageSquare,
  Check,
  X as XIcon,
  Ban,
  Sparkles,
} from "lucide-react";

/**
 * SwapRequestCard Component
 *
 * Renders a Linear-inspired flat card for a single swap request (incoming or outgoing).
 *
 * @param {Object} props
 * @param {Object} props.swap - Swap request object from API
 * @param {"incoming" | "outgoing"} props.type - Tab context
 * @param {Function} [props.onAccept] - Triggered when Accept is clicked (Incoming pending)
 * @param {Function} [props.onReject] - Triggered when Reject is clicked (Incoming pending)
 * @param {Function} [props.onCancel] - Triggered when Cancel is clicked (Outgoing pending)
 * @param {boolean} [props.isProcessing] - Disables action buttons during in-flight request
 */
export default function SwapRequestCard({
  swap,
  type = "incoming",
  onAccept,
  onReject,
  onCancel,
  isProcessing = false,
}) {
  if (!swap) return null;

  const isIncoming = type === "incoming";
  const status = swap.status ? swap.status.toLowerCase() : "pending";
  const isPending = status === "pending";

  // Identify swap ID safely
  const swapId = swap?._id || swap?.id;

  // Identify counterpart user
  const counterpart = isIncoming ? swap.fromUser : swap.toUser;
  const counterpartId = counterpart?._id || counterpart?.id;
  const counterpartName = counterpart?.name || "Community Member";
  const counterpartAvatar = counterpart?.profilePicture || counterpart?.avatar;
  const counterpartLocation = counterpart?.location || "";

  // Identify skills
  const offeredSkill = swap.offeredSkill;
  const wantedSkill = swap.wantedSkill;

  // Format date
  const createdDate = swap.createdAt
    ? new Date(swap.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <article
      className="bg-white border border-[#E6E3DA] rounded-2xl p-5 shadow-xs hover:border-[#1B4332]/30 transition-all duration-300 flex flex-col justify-between space-y-4 group"
      aria-label={`Swap request with ${counterpartName}`}
    >
      {/* Top Header: Counterpart User Info + Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={counterpartId ? `/users/${counterpartId}` : "#"}
            className="w-11 h-11 rounded-full bg-[#1B4332] text-white font-bold text-sm flex items-center justify-center border-2 border-white shadow-xs shrink-0 overflow-hidden hover:scale-105 transition-transform"
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
                className="text-sm font-extrabold text-[#16160F] hover:text-[#1B4332] transition-colors truncate"
              >
                {counterpartName}
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F7F6F2] text-[#6B6858] border border-[#E6E3DA]">
                {isIncoming ? "From" : "To"}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-0.5 text-xs text-[#6B6858]">
              {counterpartLocation && (
                <span className="truncate">{counterpartLocation}</span>
              )}
              {createdDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#6B6858]" />
                  <span>{createdDate}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <StatusBadge status={status} className="shrink-0" />
      </div>

      {/* Middle Exchange Box */}
      <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left Side: Offered / Requested Skill */}
        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
            {isIncoming ? `${counterpartName} Offers` : "You Offered"}
          </span>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#1B4332] shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-[#1B4332] truncate">
              {offeredSkill?.name || "Skill Offered"}
            </span>
          </div>
          {offeredSkill?.level && (
            <span className="inline-block text-[10px] font-medium text-[#6B6858]">
              Level: {offeredSkill.level}
            </span>
          )}
        </div>

        {/* Center Exchange Direction Indicator */}
        <div className="flex items-center justify-center shrink-0 self-center">
          <div className="w-7 h-7 rounded-full bg-[#E4EEE8] border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332]">
            <ArrowRight className="w-3.5 h-3.5 rotate-90 sm:rotate-0" />
          </div>
        </div>

        {/* Right Side: Wanted / Requested Skill */}
        <div className="flex-1 space-y-1 text-left sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
            {isIncoming ? "Requests Your" : "You Requested"}
          </span>
          <div className="flex items-center gap-2 sm:justify-end">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-[#16160F] truncate">
              {wantedSkill?.name || "Skill Requested"}
            </span>
          </div>
          {wantedSkill?.level && (
            <span className="inline-block text-[10px] font-medium text-[#6B6858]">
              Level: {wantedSkill.level}
            </span>
          )}
        </div>
      </div>

      {/* Optional Request Message Callout */}
      {swap.message && (
        <div className="bg-[#F7F6F2]/80 border border-[#E6E3DA] rounded-xl p-3 text-xs text-[#16160F] space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6858]">
            <MessageSquare className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>Note from {isIncoming ? counterpartName : "You"}:</span>
          </div>
          <p className="italic text-[#16160F] leading-relaxed pl-5">
            "{swap.message}"
          </p>
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E6E3DA]/60">
        <Link
          to={`/users/${counterpartId}`}
          className="text-xs font-semibold text-[#1B4332] hover:underline inline-flex items-center gap-1"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>View {counterpartName}'s Profile</span>
        </Link>

        {/* Actions for Accepted Status */}
        {status === "accepted" && swapId && (
          <Link
            to={`/swaps/${swapId}/chat`}
            className="h-8 px-4 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-xl transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Chat</span>
          </Link>
        )}

        {/* Actions for Pending Status */}
        {isPending && (
          <div className="flex items-center gap-2">
            {isIncoming ? (
              <>
                <button
                  type="button"
                  onClick={onReject ? () => onReject(swap) : undefined}
                  disabled={isProcessing}
                  className="h-8 px-3.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                >
                  <XIcon className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={onAccept ? () => onAccept(swap) : undefined}
                  disabled={isProcessing}
                  className="h-8 px-4 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
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
                className="h-8 px-3.5 text-xs font-semibold text-[#6B6858] hover:text-red-700 bg-[#F7F6F2] hover:bg-red-50 border border-[#E6E3DA] hover:border-red-200 rounded-xl transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel Request</span>
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
