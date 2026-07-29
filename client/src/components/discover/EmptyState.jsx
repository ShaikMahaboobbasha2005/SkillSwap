import { SearchX } from "lucide-react";

export default function EmptyState({ onClearFilters }) {
  return (
    <div className="w-full bg-white border border-[#E6E3DA] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 my-4 animate-fadeIn">
      {/* Friendly Icon / Badge */}
      <div className="w-16 h-16 rounded-2xl bg-[#F7F6F2] border border-[#E6E3DA] flex items-center justify-center text-[#6B6858] shrink-0 shadow-2xs">
        <SearchX className="w-8 h-8 text-[#1B4332]" />
      </div>

      {/* Heading & Subtitle */}
      <div className="max-w-md space-y-1">
        <h3 className="text-lg font-bold text-[#16160F]">
          No skills are currently available
        </h3>
        <p className="text-xs sm:text-sm text-[#6B6858] leading-relaxed">
          No skills are currently available matching your search criteria. Try changing your search query or adjusting your filters.
        </p>
      </div>

      {/* Clear Filters Action Button */}
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-xl transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
