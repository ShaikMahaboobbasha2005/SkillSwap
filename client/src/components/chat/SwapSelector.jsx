import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import MatchesIcon from "../icons/MatchesIcon";

/**
 * SwapSelector — Compact dropdown for switching between multiple active swaps
 * with the same counterpart user.
 *
 * Only rendered when there are 2+ swaps. Single-swap conversations skip this component.
 *
 * Skill names are resolved from swap snapshot data first to guard against
 * skills that were edited or deleted after the swap was created.
 */

/**
 * Resolves the user-relative skill pair labels for a swap.
 * Priority: snapshot fields → flat name fields → populated skill name → fallback "Skill"
 */
function getSkillPair(swap, currentUserId) {
  if (!swap) return { offered: "Skill", learned: "Skill" };

  const fromId =
    swap.fromUser?._id?.toString?.() ||
    swap.fromUser?.id?.toString?.() ||
    swap.fromUser?.toString?.();
  const isSender = fromId === currentUserId?.toString?.();

  const offered = isSender
    ? swap.offeredSkillSnapshot?.name ||
      swap.offeredSkillName ||
      swap.offeredSkill?.name ||
      "Skill"
    : swap.wantedSkillSnapshot?.name ||
      swap.wantedSkillName ||
      swap.wantedSkill?.name ||
      "Skill";

  const learned = isSender
    ? swap.wantedSkillSnapshot?.name ||
      swap.wantedSkillName ||
      swap.wantedSkill?.name ||
      "Skill"
    : swap.offeredSkillSnapshot?.name ||
      swap.offeredSkillName ||
      swap.offeredSkill?.name ||
      "Skill";

  return { offered, learned };
}

export { getSkillPair };

export default function SwapSelector({
  swaps = [],
  activeSwapId,
  currentUserId,
  onSelect,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!swaps || swaps.length <= 1) return null;

  const activeSwap = swaps.find(
    (s) =>
      (s.swapId || s.swap?._id || s._id)?.toString() ===
      activeSwapId?.toString()
  );
  const activeSkills = getSkillPair(
    activeSwap?.swap || activeSwap,
    currentUserId
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors cursor-pointer rounded-lg px-1.5 py-0.5 hover:bg-[#E4EEE8]/60 dark:hover:bg-[#1C2E24]/60 border-none outline-none ring-0 shadow-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select skill swap"
      >
        <MatchesIcon className="w-3 h-3 text-[#1B4332] dark:text-[#3FA873] shrink-0" />
        <span className="font-semibold truncate">
          {activeSkills.offered} ↔ {activeSkills.learned}
        </span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[220px] max-w-[300px] bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 pt-2.5 pb-1.5">
            <p className="text-[10px] font-bold text-[#6B6858] dark:text-[#9C9A8C] uppercase tracking-wider">
              Select Skill Swap
            </p>
          </div>

          <div className="px-1.5 pb-1.5 max-h-[200px] overflow-y-auto">
            {swaps.map((entry) => {
              const swapObj = entry.swap || entry;
              const swapId = (
                entry.swapId ||
                swapObj._id ||
                swapObj.id
              )?.toString();
              const isActive = swapId === activeSwapId?.toString();
              const skills = getSkillPair(swapObj, currentUserId);

              return (
                <button
                  key={swapId}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    if (!isActive) {
                      onSelect?.(swapId);
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 border-none outline-none ring-0 shadow-none ${
                    isActive
                      ? "bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] font-bold"
                      : "text-[#16160F] dark:text-[#F2F1EC] hover:bg-[#F7F6F2] dark:hover:bg-[#202520] font-medium"
                  }`}
                >
                  <span
                    className={`w-4 shrink-0 flex items-center justify-center ${
                      isActive ? "text-[#1B4332] dark:text-[#3FA873]" : "text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate">
                    {skills.offered} ↔ {skills.learned}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
