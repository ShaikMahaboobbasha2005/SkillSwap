import { Star, RefreshCw, GraduationCap, Image } from "lucide-react";

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
      className={`bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto ${className}`}
      aria-label="Profile statistics summary"
    >
      {/* 1. Rating Metric */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-[#B8860B] fill-[#B8860B]" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block leading-none">
            Rating
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#16160F] mt-0.5 block leading-tight">
            {numRating > 0 ? `${formattedRating} / 5.0` : "No reviews"}
          </span>
        </div>
      </div>

      <div className="w-px h-6 bg-[#E6E3DA] shrink-0" />

      {/* 2. Completed Swaps Metric */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4 text-[#1B4332]" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block leading-none">
            Swaps Done
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#16160F] mt-0.5 block leading-tight">
            {completedSwaps} {completedSwaps === 1 ? "swap" : "swaps"}
          </span>
        </div>
      </div>

      <div className="w-px h-6 bg-[#E6E3DA] shrink-0" />

      {/* 3. Total Skills Metric */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-[#1B4332]" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block leading-none">
            Total Skills
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#16160F] mt-0.5 block leading-tight">
            {totalSkills} {totalSkills === 1 ? "skill" : "skills"}
          </span>
        </div>
      </div>

      <div className="w-px h-6 bg-[#E6E3DA] shrink-0" />

      {/* 4. Portfolio Metric (Phase 10 Ready) */}
      <div className="flex items-center gap-2 px-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center shrink-0">
          <Image className="w-4 h-4 text-zinc-600" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block leading-none">
            Portfolio
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#16160F] mt-0.5 block leading-tight">
            {typeof portfolioCount === "number" ? `${portfolioCount} items` : portfolioCount}
          </span>
        </div>
      </div>
    </div>
  );
}
