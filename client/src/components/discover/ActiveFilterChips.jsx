import { X } from "lucide-react";

export default function ActiveFilterChips({
  search,
  category,
  type,
  level,
  sort,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveType,
  onRemoveLevel,
  onRemoveSort,
  onClearAll,
}) {
  const isSortActive = Boolean(sort && sort !== "newest");
  const hasChips = Boolean(search || category || type || level || isSortActive);

  if (!hasChips) return null;

  return (
    <div className="w-full flex items-center flex-wrap gap-2 pt-1 animate-fadeIn">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6858] mr-1">
        Active Filters:
      </span>

      {/* Search Chip */}
      {search && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#1B4332] bg-[#E4EEE8] border border-[#1B4332]/20 rounded-full transition-all">
          <span>Search: "{search}"</span>
          <button
            type="button"
            onClick={onRemoveSearch}
            className="hover:opacity-75 font-bold cursor-pointer ml-0.5"
            aria-label="Remove search filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Category Chip */}
      {category && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#1B4332] bg-[#E4EEE8] border border-[#1B4332]/20 rounded-full transition-all">
          <span>Category: {category}</span>
          <button
            type="button"
            onClick={onRemoveCategory}
            className="hover:opacity-75 font-bold cursor-pointer ml-0.5"
            aria-label="Remove category filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Type Chip */}
      {type && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#1B4332] bg-[#E4EEE8] border border-[#1B4332]/20 rounded-full transition-all">
          <span>Type: {type === "Offer" ? "Offer" : "Learn"}</span>
          <button
            type="button"
            onClick={onRemoveType}
            className="hover:opacity-75 font-bold cursor-pointer ml-0.5"
            aria-label="Remove type filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Level Chip */}
      {level && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#1B4332] bg-[#E4EEE8] border border-[#1B4332]/20 rounded-full transition-all">
          <span>Level: {level}</span>
          <button
            type="button"
            onClick={onRemoveLevel}
            className="hover:opacity-75 font-bold cursor-pointer ml-0.5"
            aria-label="Remove level filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Sort Chip */}
      {isSortActive && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#1B4332] bg-[#E4EEE8] border border-[#1B4332]/20 rounded-full transition-all">
          <span>
            Sort:{" "}
            {sort === "oldest"
              ? "Oldest"
              : sort === "alpha_asc"
              ? "A-Z"
              : sort === "alpha_desc"
              ? "Z-A"
              : sort}
          </span>
          <button
            type="button"
            onClick={onRemoveSort}
            className="hover:opacity-75 font-bold cursor-pointer ml-0.5"
            aria-label="Remove sort filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Clear All Button */}
      <button
        type="button"
        onClick={onClearAll}
        className="px-3 py-1 text-xs font-bold text-red-600 hover:underline transition-all cursor-pointer ml-auto"
      >
        Clear All
      </button>
    </div>
  );
}
