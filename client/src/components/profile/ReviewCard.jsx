import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, ArrowLeftRight } from "lucide-react";

/**
 * Derives swap skill context dynamically from populated swapRequest data
 */
const getReviewSwapContext = (swapRequest) => {
  if (!swapRequest) return null;

  if (typeof swapRequest === "string") {
    return {
      swapId: swapRequest,
      title: "Skill Swap",
      isGeneric: true,
    };
  }

  const swapId = (swapRequest._id || swapRequest.id)?.toString();

  let offeredName = "";
  if (swapRequest.offeredSkill && typeof swapRequest.offeredSkill === "object") {
    offeredName = swapRequest.offeredSkill.name || "";
  } else if (typeof swapRequest.offeredSkill === "string") {
    offeredName = swapRequest.offeredSkill;
  }
  if (!offeredName) {
    offeredName =
      swapRequest.offeredSkillSnapshot?.name ||
      swapRequest.offeredSkillName ||
      "";
  }

  let wantedName = "";
  if (swapRequest.wantedSkill && typeof swapRequest.wantedSkill === "object") {
    wantedName = swapRequest.wantedSkill.name || "";
  } else if (typeof swapRequest.wantedSkill === "string") {
    wantedName = swapRequest.wantedSkill;
  }
  if (!wantedName) {
    wantedName =
      swapRequest.wantedSkillSnapshot?.name ||
      swapRequest.wantedSkillName ||
      "";
  }

  if (offeredName && wantedName) {
    return {
      swapId,
      title: `${offeredName} ↔ ${wantedName}`,
      offeredName,
      wantedName,
      subtitle: "Skill Swap",
    };
  } else if (offeredName || wantedName) {
    return {
      swapId,
      title: offeredName || wantedName,
      subtitle: "Skill Swap",
    };
  }

  if (swapId) {
    return {
      swapId,
      title: "Skill Swap",
      isGeneric: true,
    };
  }

  return null;
};

/**
 * ReviewCard Component
 * Renders a compact review card with avatar, name, location, stars, exact Skill Swap context, date, and expandable text.
 *
 * @param {Object} props
 * @param {Object} props.review - Rating & Review document from API
 * @param {boolean} [props.isHighlighted=false] - Whether this card is targeted by deep-link highlight
 * @param {boolean} [props.canNavigate=false] - Whether clicking swap context should navigate to the swap chat
 */
export default function ReviewCard({
  review,
  isHighlighted = false,
  canNavigate = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!review) return null;

  const reviewer = review.reviewer;
  const reviewerName =
    reviewer && typeof reviewer === "object" && reviewer.name
      ? reviewer.name
      : "Community Member";
  const reviewerAvatar =
    reviewer && typeof reviewer === "object" ? reviewer.profilePicture : "";
  const reviewerLocation =
    reviewer && typeof reviewer === "object" ? reviewer.location : "";

  const stars = Math.min(5, Math.max(1, parseInt(review.stars, 10) || 5));
  const reviewText = typeof review.review === "string" ? review.review.trim() : "";

  const swapRequest = review.swapRequest || review.swap || null;
  const swapContext = getReviewSwapContext(swapRequest);
  const swapId = (swapRequest?._id || swapRequest?.id || (typeof swapRequest === "string" ? swapRequest : ""))?.toString();
  const reviewId = (review._id || review.id)?.toString();

  // Threshold for showing "Show more" button (~3-4 lines of text in compact card)
  const isLongText = reviewText.length > 130;

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div
      data-swap-id={swapId}
      data-review-id={reviewId}
      className={`rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all duration-500 shadow-2xs group relative ${
        isHighlighted
          ? "bg-[#E4EEE8]/50 border-[#1B4332] ring-2 ring-[#1B4332]/40 shadow-md scale-[1.01]"
          : "bg-[#F7F6F2]/60 border-[#E6E3DA] hover:border-[#1B4332]/40 hover:bg-white"
      }`}
    >
      {/* Deep-link target badge */}
      {isHighlighted && (
        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#1B4332] text-white text-[9px] font-bold shadow-xs animate-fadeIn">
          New Review
        </div>
      )}

      {/* Card Header: Reviewer Avatar, Name, Location & Star Rating */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#1B4332] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white shadow-2xs overflow-hidden">
            {reviewerAvatar ? (
              <img
                src={reviewerAvatar}
                alt={reviewerName}
                className="w-full h-full object-cover"
              />
            ) : (
              reviewerName.charAt(0).toUpperCase()
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#16160F] truncate group-hover:text-[#1B4332] transition-colors">
              {reviewerName}
            </h4>
            {reviewerLocation && (
              <div className="flex items-center gap-1 text-[10px] text-[#6B6858] truncate">
                <MapPin className="w-2.5 h-2.5 text-[#1B4332] shrink-0" />
                <span className="truncate">{reviewerLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Star Rating Badge */}
        <div
          className="flex items-center gap-0.5 shrink-0 pt-0.5"
          aria-label={`Rated ${stars} out of 5 stars`}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <Star
              key={num}
              className={`w-3 h-3 ${
                num <= stars
                  ? "fill-[#B8860B] text-[#B8860B]"
                  : "text-zinc-300 fill-zinc-100"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Skill Swap Context Pill */}
      {swapContext && (
        <div className="pt-0.5">
          {canNavigate && swapContext.swapId ? (
            <Link
              to={`/swaps/${swapContext.swapId}/chat`}
              className="inline-flex items-center justify-between gap-2 w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#E6E3DA] hover:border-[#1B4332]/40 hover:bg-[#E4EEE8]/40 transition-all text-left group/swap cursor-pointer shadow-2xs"
              title="View completed swap conversation"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-md bg-[#E4EEE8] text-[#1B4332] flex items-center justify-center shrink-0 group-hover/swap:scale-105 transition-transform">
                  <ArrowLeftRight className="w-3 h-3" />
                </div>
                <span className="text-[11px] font-bold text-[#16160F] group-hover/swap:text-[#1B4332] transition-colors truncate">
                  {swapContext.title}
                </span>
              </div>
              <span className="text-[9px] font-semibold text-[#6B6858] px-1.5 py-0.5 rounded bg-[#F7F6F2] border border-[#E6E3DA] shrink-0">
                Skill Swap
              </span>
            </Link>
          ) : (
            <div className="inline-flex items-center justify-between gap-2 w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#E6E3DA] text-left shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-md bg-[#E4EEE8] text-[#1B4332] flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-3 h-3" />
                </div>
                <span className="text-[11px] font-bold text-[#16160F] truncate">
                  {swapContext.title}
                </span>
              </div>
              <span className="text-[9px] font-semibold text-[#6B6858] px-1.5 py-0.5 rounded bg-[#F7F6F2] border border-[#E6E3DA] shrink-0">
                Skill Swap
              </span>
            </div>
          )}
        </div>
      )}

      {/* Written Review Text Block */}
      {reviewText && (
        <div className="text-xs text-[#16160F]/90 leading-relaxed font-normal bg-white p-3 rounded-xl border border-[#E6E3DA]/80 shadow-2xs">
          <p className={!isExpanded && isLongText ? "line-clamp-3" : ""}>
            "{reviewText}"
          </p>
          {isLongText && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-bold text-[#1B4332] hover:underline mt-1.5 inline-block cursor-pointer focus:outline-none"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      )}

      {/* Card Footer: Date */}
      {formattedDate && (
        <div className="text-[10px] font-medium text-[#6B6858] text-right pt-0.5">
          {formattedDate}
        </div>
      )}
    </div>
  );
}
