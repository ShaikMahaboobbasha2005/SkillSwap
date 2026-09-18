import { SlidersHorizontal } from "lucide-react";
import {
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  SKILL_TYPES,
} from "../../constants/skillConstants";

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Alphabetical A-Z", value: "alpha_asc" },
  { label: "Alphabetical Z-A", value: "alpha_desc" },
];

export default function FilterPanel({
  category,
  type,
  level,
  sort,
  onCategoryChange,
  onTypeChange,
  onLevelChange,
  onSortChange,
  onOpenMobileDrawer,
  categories = SKILL_CATEGORIES,
  types = SKILL_TYPES,
  levels = SKILL_LEVELS,
  sortOptions = SORT_OPTIONS,
  activeFilterCount = 0,
}) {
  const selectClasses = (isActive) =>
    `h-10 px-3 text-xs bg-white dark:bg-[#121512] text-[#16160F] dark:text-[#F2F1EC] border rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#3FA873]/20 transition-all cursor-pointer font-medium ${
      isActive
        ? "border-[#1B4332] dark:border-[#3FA873] bg-[#E4EEE8]/40 dark:bg-[#1C2E24]/60"
        : "border-[#E6E3DA] dark:border-[#2A2E29]"
    }`;

  return (
    <div className="w-full flex items-center justify-between gap-3">
      {/* Desktop / Tablet Filters (≥768px) */}
      <div className="hidden md:flex items-center flex-wrap gap-2.5">
        {/* Category Filter */}
        <div className="flex flex-col">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={selectClasses(Boolean(category))}
            aria-label="Filter by skill category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Skill Type Filter (Offer / Learn) */}
        <div className="flex flex-col">
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className={selectClasses(Boolean(type))}
            aria-label="Filter by skill type"
          >
            <option value="">All Types (Offer/Learn)</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t === "Offer" ? "Offering to Teach" : "Seeking to Learn"}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div className="flex flex-col">
          <select
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            className={selectClasses(Boolean(level))}
            aria-label="Filter by proficiency level"
          >
            <option value="">All Proficiency Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex flex-col">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className={selectClasses(sort !== "newest")}
            aria-label="Sort skills list"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Filter Trigger Button (<768px) */}
      <div className="md:hidden w-full flex items-center justify-between">
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          className="h-10 px-4 text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] bg-white dark:bg-[#121512] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl flex items-center gap-2 hover:bg-[#F7F6F2] dark:hover:bg-[#181B18] transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#1B4332] dark:text-[#3FA873]" />
          <span>Filters & Sort</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] text-[10px] flex items-center justify-center font-extrabold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
