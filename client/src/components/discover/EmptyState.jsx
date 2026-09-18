import { SearchX } from "lucide-react";

export default function EmptyState({ onClearFilters }) {
  return (
    <div className="w-full bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 my-4 animate-fadeIn">
      {/* Friendly Icon / Badge */}
      <div className="w-16 h-16 rounded-2xl bg-[#F7F6F2] dark:bg-[#121512] border border-[#E6E3DA] dark:border-[#2A2E29] flex items-center justify-center text-[#6B6858] dark:text-[#9C9A8C] shrink-0 shadow-2xs">
        <SearchX className="w-8 h-8 text-[#1B4332] dark:text-[#3FA873]" />
      </div>

      {/* Heading & Subtitle */}
      <div className="max-w-md space-y-1">
        <h3 className="text-lg font-bold text-[#16160F] dark:text-[#F2F1EC]">
          No skills or members found
        </h3>
        <p className="text-xs sm:text-sm text-[#6B6858] dark:text-[#9C9A8C] leading-relaxed">
          We couldn't find anyone matching your current search criteria. Try searching for a different skill or adjusting your filters.
        </p>
      </div>

      {/* Clear Filters Action Button */}
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="px-5 py-2.5 text-xs font-semibold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#338d60] rounded-xl transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
