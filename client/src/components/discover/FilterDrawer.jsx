import Modal from "../Modal";
import {
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  SKILL_TYPES,
} from "../../constants/skillConstants";
import { SORT_OPTIONS } from "./FilterPanel";

export default function FilterDrawer({
  isOpen,
  onClose,
  category,
  type,
  level,
  sort,
  onCategoryChange,
  onTypeChange,
  onLevelChange,
  onSortChange,
  onClearAll,
  categories = SKILL_CATEGORIES,
  types = SKILL_TYPES,
  levels = SKILL_LEVELS,
  sortOptions = SORT_OPTIONS,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title="Filter & Sort Skills"
      showCloseButton={true}
    >
      <div className="p-5 space-y-5 bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC]">
        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-10 px-3 text-xs bg-[#F7F6F2] dark:bg-[#121512] text-[#16160F] dark:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Type Selection */}
        <div>
          <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1.5">
            Skill Type
          </label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full h-10 px-3 text-xs bg-[#F7F6F2] dark:bg-[#121512] text-[#16160F] dark:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] cursor-pointer"
          >
            <option value="">All Types (Offer/Learn)</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t === "Offer" ? "Offering to Teach" : "Seeking to Learn"}
              </option>
            ))}
          </select>
        </div>

        {/* Level Selection */}
        <div>
          <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1.5">
            Proficiency Level
          </label>
          <select
            value={level}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full h-10 px-3 text-xs bg-[#F7F6F2] dark:bg-[#121512] text-[#16160F] dark:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] cursor-pointer"
          >
            <option value="">All Proficiency Levels</option>
            {levels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selection */}
        <div>
          <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1.5">
            Sort Order
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full h-10 px-3 text-xs bg-[#F7F6F2] dark:bg-[#121512] text-[#16160F] dark:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E6E3DA] dark:border-[#2A2E29]">
          <button
            type="button"
            onClick={onClearAll}
            className="px-4 py-2 text-xs font-semibold text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl transition-all cursor-pointer"
          >
            Clear All
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#338d60] rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );
}
