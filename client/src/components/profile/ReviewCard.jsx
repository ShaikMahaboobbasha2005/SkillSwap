import { useState } from "react";
import { Star, MapPin } from "lucide-react";

/**
 * ReviewCard Component
 * Renders a compact review card with avatar, name, location, stars, date, and expandable text.
 *
 * @param {Object} props
 * @param {Object} props.review - Rating & Review document from API
 */
export default function ReviewCard({ review }) {
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
    <div className="bg-[#F7F6F2]/60 border border-[#E6E3DA] rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-[#1B4332]/40 hover:bg-white transition-all duration-200 shadow-2xs group">
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
