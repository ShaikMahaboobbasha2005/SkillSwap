import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight, Tag, Calendar, Flag } from "lucide-react";
import ReactionPicker from "./ReactionPicker";
import useAuth from "../../hooks/useAuth";

/**
 * PortfolioLightbox Component
 *
 * Full-screen media viewer for images and short videos with keyboard & swipe navigation,
 * real author profile attribution, reaction burst & appreciation system, and visitor moderation reporting.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether lightbox is visible
 * @param {Object} props.item - Current active portfolio item
 * @param {Array} props.items - All portfolio items for next/prev navigation
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onSelectIndex - Change active index callback
 * @param {Function} props.onReact - Reaction toggle callback
 * @param {Function} props.onViewReactions - View reactions modal callback
 * @param {Function} [props.onReport] - Report portfolio item callback
 */
export default function PortfolioLightbox({
  isOpen,
  item,
  items = [],
  onClose,
  onSelectIndex,
  onReact,
  onViewReactions,
  onReport,
}) {
  const { user: authUser } = useAuth();
  const currentIndex = item && items ? items.findIndex((i) => (i._id || i.id) === (item._id || item.id)) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < items.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev && onSelectIndex) {
      onSelectIndex(currentIndex - 1);
    }
  }, [hasPrev, currentIndex, onSelectIndex]);

  const handleNext = useCallback(() => {
    if (hasNext && onSelectIndex) {
      onSelectIndex(currentIndex + 1);
    }
  }, [hasNext, currentIndex, onSelectIndex]);

  // Lock body scroll and register keyboard listeners
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !item || !item.media) return null;

  const isVideo = item.media.type === "video";
  const mediaUrl = item.media.url;
  const caption = item.caption || "";
  const skillName = item.skill?.name || "";

  // Author details (support populated user object or direct owner fields)
  const authorObj = item.user && typeof item.user === "object" ? item.user : null;
  const authorName = authorObj?.name?.trim() || item.ownerName?.trim() || "Unknown User";
  const authorAvatar = authorObj?.profilePicture || item.ownerAvatar || "";
  const authorId = authorObj?._id || authorObj?.id || (typeof item.user === "string" ? item.user : null);

  const currentUserId = authUser?._id || authUser?.id || "";
  const isOwner = Boolean(currentUserId && authorId && String(currentUserId) === String(authorId));

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/94 backdrop-blur-md flex flex-col justify-between animate-fadeIn text-white select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio Media Viewer"
    >
      {/* Top Controls Header */}
      <div className="w-full flex items-center justify-between p-4 sm:p-5 bg-gradient-to-b from-black/80 to-transparent z-20 shrink-0">
        {/* Author / Date Info (Clickable profile navigation) */}
        <Link
          to={authorId ? `/profile/${authorId}` : "#"}
          onClick={() => onClose?.()}
          className="flex items-center gap-3 group cursor-pointer"
          title={`View ${authorName}'s profile`}
        >
          <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white font-bold text-sm flex items-center justify-center overflow-hidden border border-white/20 shrink-0 group-hover:ring-2 group-hover:ring-[#3FA873] transition-all shadow-md">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              authorName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight">
              {authorName}
            </h3>
            {formattedDate && (
              <p className="text-[11px] text-white/60 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-white/40" />
                <span>{formattedDate}</span>
              </p>
            )}
          </div>
        </Link>

        {/* Counter, Report and Close button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {items.length > 1 && currentIndex >= 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
              {currentIndex + 1} / {items.length}
            </span>
          )}

          {/* Visitor Report Button (Never shown to the owner) */}
          {!isOwner && onReport && (
            <button
              type="button"
              onClick={() => onReport(item)}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-300 border border-white/15 text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Report portfolio item"
              aria-label="Report this portfolio item"
            >
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Report</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15 active:scale-95"
            title="Close (Esc)"
            aria-label="Close media viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Media Area */}
      <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Previous Button */}
        {hasPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Previous (Left Arrow)"
            aria-label="Previous media"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Media Item Display */}
        <div className="max-h-full max-w-full flex items-center justify-center">
          {isVideo ? (
            <video
              key={mediaUrl}
              src={mediaUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[64vh] max-w-[92vw] sm:max-w-[85vw] rounded-xl shadow-2xl object-contain bg-black"
            />
          ) : (
            <img
              key={mediaUrl}
              src={mediaUrl}
              alt={caption || "Portfolio media"}
              className="max-h-[64vh] max-w-[92vw] sm:max-w-[85vw] rounded-xl shadow-2xl object-contain"
            />
          )}
        </div>

        {/* Next Button */}
        {hasNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Next (Right Arrow)"
            aria-label="Next media"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Caption, Linked Skill & SkillSwap Reaction System Footer */}
      <div className="w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-5 z-20 shrink-0 max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Skill Tag */}
          {skillName ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1B4332] text-emerald-100 border border-emerald-500/30">
              <Tag className="w-3 h-3 text-emerald-300" />
              <span>Skill: {skillName}</span>
            </span>
          ) : (
            <div />
          )}

          {/* SkillSwap Reaction Interaction System */}
          <ReactionPicker
            item={item}
            onReact={onReact}
            onViewReactions={onViewReactions}
            context="lightbox"
          />
        </div>

        {caption && (
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
            {caption}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
