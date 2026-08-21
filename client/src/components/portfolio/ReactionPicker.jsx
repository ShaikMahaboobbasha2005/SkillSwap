import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X } from "lucide-react";

export const REACTION_CONFIG = {
  like: {
    type: "like",
    emoji: "👍",
    label: "Like",
    description: "Appreciate this work",
  },
  impressive: {
    type: "impressive",
    emoji: "🔥",
    label: "Impressive",
    description: "Fires of inspiration",
  },
  great_work: {
    type: "great_work",
    emoji: "👏",
    label: "Great Work",
    description: "Masterful craft",
  },
  creative: {
    type: "creative",
    emoji: "💡",
    label: "Creative",
    description: "Brilliant & fresh ideas",
  },
};

export const REACTION_LIST = Object.values(REACTION_CONFIG);

/**
 * ReactionPicker Component
 *
 * SkillSwap Reaction System:
 * 1. Default: Minimal "✨ Appreciate" trigger (or active "🔥 Impressive" chip).
 * 2. Reaction Burst: Playful animated burst of 4 reactions with staggered scaling on click.
 * 3. Selected Chip: Compact Pine Green active chip.
 * 4. Reaction Summary: Overlapping circular reaction bubbles with gentle spread on hover ("◯🔥 ◯👍 12 reactions →").
 *
 * @param {Object} props
 * @param {Object} props.item - Portfolio item containing reactionSummary & currentUserReaction
 * @param {Function} props.onReact - (item, reactionType) => void
 * @param {Function} props.onViewReactions - (item) => void
 * @param {"lightbox" | "card"} [props.context="lightbox"] - Display context
 */
export default function ReactionPicker({
  item,
  onReact,
  onViewReactions,
  context = "lightbox",
}) {
  const [burstOpen, setBurstOpen] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const [animatingReaction, setAnimatingReaction] = useState(null);
  const containerRef = useRef(null);

  const reactionSummary = item?.reactionSummary || {
    like: 0,
    impressive: 0,
    great_work: 0,
    creative: 0,
    total: 0,
  };
  const currentUserReaction = item?.currentUserReaction || null;
  const currentConfig = currentUserReaction ? REACTION_CONFIG[currentUserReaction] : null;

  const totalCount = reactionSummary.total || 0;
  const reactionLabel = totalCount === 1 ? "1 reaction" : `${totalCount} reactions`;

  // Sort active non-zero reaction types by count (max 3 for bubbles)
  const activeReactionTypes = REACTION_LIST.filter(
    (r) => (reactionSummary[r.type] || 0) > 0
  ).sort((a, b) => (reactionSummary[b.type] || 0) - (reactionSummary[a.type] || 0));

  // Click outside / escape to collapse burst
  useEffect(() => {
    if (!burstOpen) return;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setBurstOpen(false);
        setHoveredReaction(null);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setBurstOpen(false);
        setHoveredReaction(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [burstOpen]);

  const handleToggleBurst = (e) => {
    e.stopPropagation();
    setBurstOpen((prev) => !prev);
    setHoveredReaction(null);
  };

  const handleSelectReaction = (e, type) => {
    e.stopPropagation();
    setAnimatingReaction(type);

    // Trigger reaction callback immediately (optimistic)
    onReact?.(item, type);

    // Smooth collapse after pop animation
    setTimeout(() => {
      setAnimatingReaction(null);
      setBurstOpen(false);
      setHoveredReaction(null);
    }, 180);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-start gap-2 select-none">
      {/* 1. Reaction Burst Dock (Expands above the trigger) */}
      {burstOpen && (
        <div
          className="absolute bottom-full left-0 mb-3 z-50 flex items-center gap-2 p-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-full shadow-2xl animate-in fade-in zoom-in-90 duration-200"
          role="toolbar"
          aria-label="Appreciation reactions"
          onClick={(e) => e.stopPropagation()}
        >
          {REACTION_LIST.map((r, index) => {
            const isSelected = currentUserReaction === r.type;
            const isHovered = hoveredReaction === r.type;
            const isPopping = animatingReaction === r.type;

            // Stagger entrance delays
            const staggerDelay = `${index * 50}ms`;

            return (
              <div key={r.type} className="relative flex flex-col items-center">
                {/* Floating tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-black/95 text-white text-[11px] font-bold rounded-md whitespace-nowrap shadow-lg border border-white/15 pointer-events-none animate-fadeIn">
                    {r.label}
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => handleSelectReaction(e, r.type)}
                  onMouseEnter={() => setHoveredReaction(r.type)}
                  onMouseLeave={() => setHoveredReaction(null)}
                  style={{ animationDelay: staggerDelay }}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all duration-150 cursor-pointer ${
                    isPopping ? "scale-135" : isHovered ? "scale-120 -translate-y-1" : "scale-100"
                  } ${
                    isSelected
                      ? "bg-[#1B4332] text-white ring-2 ring-emerald-400/80 shadow-lg scale-105"
                      : "hover:bg-white/20 active:scale-95"
                  }`}
                  title={isSelected ? `Remove ${r.label}` : r.label}
                  aria-label={r.label}
                >
                  <span className="leading-none drop-shadow-sm">{r.emoji}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Reaction Trigger / Selected Chip */}
      <div className="flex items-center gap-2">
        {!currentUserReaction ? (
          /* ✨ Appreciate Default Trigger */
          <button
            type="button"
            onClick={handleToggleBurst}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 transition-all cursor-pointer select-none shadow-sm hover:scale-[1.03] active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#3FA873]"
            aria-expanded={burstOpen}
            aria-label="Appreciate this work"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
            <span>Appreciate</span>
          </button>
        ) : (
          /* Selected Reaction Chip (e.g. 🔥 Impressive) */
          <button
            type="button"
            onClick={handleToggleBurst}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#1B4332] hover:bg-[#143326] border border-emerald-400/80 ring-1 ring-emerald-400/40 shadow-md transition-all cursor-pointer select-none hover:scale-[1.03] active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#3FA873]"
            aria-expanded={burstOpen}
            title={`Reacted with ${currentConfig?.label}. Click to change or remove.`}
            aria-label={`Reacted with ${currentConfig?.label}. Click to change or remove.`}
          >
            <span className="text-sm leading-none animate-bounce-short">{currentConfig?.emoji}</span>
            <span>{currentConfig?.label}</span>
          </button>
        )}
      </div>

      {/* 3. Reaction Summary (Overlapping circular bubbles with spread on hover) */}
      {totalCount > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewReactions?.(item);
          }}
          className="inline-flex items-center gap-2.5 pt-1 text-xs text-white/80 hover:text-white transition-all cursor-pointer group select-none focus:outline-none"
          title="See who reacted"
          aria-label={`${reactionLabel}, click to see who reacted`}
        >
          {/* Overlapping circular bubbles */}
          <div className="flex items-center -space-x-1.5 group-hover:space-x-1 transition-all duration-300 ease-out">
            {activeReactionTypes.slice(0, 3).map((r, idx) => (
              <div
                key={r.type}
                className="w-6 h-6 rounded-full bg-black/80 border border-white/30 flex items-center justify-center text-xs shadow-md group-hover:scale-110 transition-transform"
                style={{ zIndex: 3 - idx }}
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* Count and animated arrow */}
          <span className="font-semibold text-white/90 group-hover:text-emerald-300 transition-colors inline-flex items-center gap-1">
            <span>{reactionLabel}</span>
            <span className="text-xs text-white/50 group-hover:translate-x-1 group-hover:text-emerald-300 transition-transform duration-200">
              →
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
