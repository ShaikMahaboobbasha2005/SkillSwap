import { Link } from "react-router-dom";
import { Star, RefreshCw, Image } from "lucide-react";
import OfferedSkillIcon from "../icons/OfferedSkillIcon";

/**
 * CompactProfileStats Component
 *
 * Reusable, prop-driven horizontal profile statistics bar integrated into the profile header.
 * Reduces vertical height by ~200px compared to large card grids while keeping layout ready for Phase 10.
 *
 * @param {Object} props
 * @param {number} [props.rating=0.0] - Average user rating
 * @param {number} [props.completedSwaps=0] - Number of completed swaps
 * @param {number} [props.totalSkills=0] - Total active skills (offered + wanted)
 * @param {number|string} [props.portfolioCount="0 items"] - Portfolio items count (Phase 10 ready)
 * @param {string} [props.className] - Additional styling classes
 */
export default function CompactProfileStats({
  rating = 0.0,
  completedSwaps = 0,
  totalSkills = 0,
  portfolioCount = "0 items",
  className = "",
}) {
  const formattedRating = typeof rating === "number" && rating > 0 ? rating.toFixed(1) : "0.0";
  const numRating = parseFloat(formattedRating);

  return (
    <div
      className={`bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto ${className}`}
      aria-label="Profile statistics summary"
    >
      {/* 1. Rating Metric */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-[#B8860B] fill-[#B8860B]" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C] block leading-none">
            Rating
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#16160F] dark:text-[#F2F1EC] mt-0.5 block leading-tight">
            {numRating > 0 ? `${formattedRating} / 5.0` : "No reviews"}
          </span>
        </div>
      </div>

      <div className="w-px h-6 bg-[#E6E3DA] dark:bg-[#2A2E29] shrink-0" />

      {/* 2. Completed Swaps Metric (Clickable to Completed History) */}
      <Link
        to="/swaps?tab=history&status=completed"
        className="flex items-center gap-2 px-2 shrink-0 group hover:opacity-80 transition-opacity cursor-pointer"
        title="View completed swap history"
      >
        <div className="w-8 h-8 rounded-lg bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <RefreshCw className="w-4 h-4 text-[#1B4332] dark:text-[#3FA873]" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C] group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873] block leading-none transition-colors">
            Swaps Done
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#16160F] dark:text-[#F2F1EC] group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873] mt-0.5 block leading-tight transition-colors">
            {completedSwaps} {completedSwaps === 1 ? "swap" : "swaps"}
          </span>
        </div>
      </Link>

      <div className="w-px h-6 bg-[#E6E3DA] dark:bg-[#2A2E29] shrink-0" />

      {/* 3. Total Skills Metric */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30 flex items-center justify-center shrink-0">
          <OfferedSkillIcon className="w-4 h-4 text-[#1B4332] dark:text-[#3FA873]" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C] block leading-none">
            Total Skills
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#16160F] dark:text-[#F2F1EC] mt-0.5 block leading-tight">
            {totalSkills} {totalSkills === 1 ? "skill" : "skills"}
          </span>
        </div>
      </div>

      <div className="w-px h-6 bg-[#E6E3DA] dark:bg-[#2A2E29] shrink-0" />

      {/* 4. Portfolio Metric (Phase 10 Ready) */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
          <Image className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] dark:text-[#9C9A8C] block leading-none">
            Portfolio
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#16160F] dark:text-[#F2F1EC] mt-0.5 block leading-tight">
            {typeof portfolioCount === "number" ? `${portfolioCount} items` : portfolioCount}
          </span>
        </div>
      </div>
    </div>
  );
}
