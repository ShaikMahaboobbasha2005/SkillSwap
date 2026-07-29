import { useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

export default function SearchBar({ value, onChange, onClear, loading }) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <Search className="absolute left-3.5 w-4 h-4 text-[#6B6858] pointer-events-none select-none" />

        {/* Search Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by skill (e.g. React, UI/UX) or mentor name..."
          className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-white text-[#16160F] border border-[#E6E3DA] rounded-xl focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20 transition-all placeholder-[#6B6858]/60"
          aria-label="Search skills or mentor names"
          onKeyDown={(e) => {
            if (e.key === "Escape" && value) {
              handleClear();
            }
          }}
        />

        {/* Loading Spinner or Clear Button */}
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#1B4332] animate-spin" />
          ) : value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#6B6858] hover:text-[#16160F] text-xs font-bold w-5 h-5 rounded-full bg-[#F7F6F2] flex items-center justify-center border border-[#E6E3DA] transition-colors cursor-pointer"
              aria-label="Clear search text"
            >
              <X className="w-3 h-3" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
