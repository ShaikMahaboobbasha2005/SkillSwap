import { ArrowLeft, ArrowRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hasNextPage = false,
  hasPreviousPage = false,
  totalResults = 0,
}) {
  if (totalPages <= 1 && totalResults <= 12) return null;

  const handlePageClick = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Generate page numbers range array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="w-full flex items-center justify-between pt-6 border-t border-[#E6E3DA] dark:border-[#2A2E29] mt-6"
      aria-label="Pagination Navigation"
    >
      {/* Previous Button */}
      <button
        type="button"
        disabled={!hasPreviousPage || currentPage <= 1}
        onClick={() => handlePageClick(currentPage - 1)}
        className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
          !hasPreviousPage || currentPage <= 1
            ? "opacity-50 cursor-not-allowed bg-[#F7F6F2] dark:bg-[#121512] text-[#6B6858] dark:text-[#767468] border-[#E6E3DA] dark:border-[#2A2E29]"
            : "bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC] border-[#E6E3DA] dark:border-[#2A2E29] hover:bg-[#F7F6F2] dark:hover:bg-[#202520] cursor-pointer"
        }`}
        aria-label="Go to previous page"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Previous</span>
      </button>

      {/* Page Indicators */}
      <div className="flex items-center gap-1.5">
        {pageNumbers[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => handlePageClick(1)}
              className="w-8 h-8 text-xs font-semibold rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC] hover:bg-[#F7F6F2] dark:hover:bg-[#202520] cursor-pointer"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="text-xs text-[#6B6858] dark:text-[#9C9A8C] px-1">...</span>
            )}
          </>
        )}

        {pageNumbers.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handlePageClick(num)}
            className={`w-8 h-8 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              num === currentPage
                ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] border-[#1B4332] dark:border-[#3FA873] shadow-2xs font-bold"
                : "bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC] border-[#E6E3DA] dark:border-[#2A2E29] hover:bg-[#F7F6F2] dark:hover:bg-[#202520]"
            }`}
            aria-current={num === currentPage ? "page" : undefined}
          >
            {num}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="text-xs text-[#6B6858] dark:text-[#9C9A8C] px-1">...</span>
            )}
            <button
              type="button"
              onClick={() => handlePageClick(totalPages)}
              className="w-8 h-8 text-xs font-semibold rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC] hover:bg-[#F7F6F2] dark:hover:bg-[#202520] cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next Button */}
      <button
        type="button"
        disabled={!hasNextPage || currentPage >= totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
          !hasNextPage || currentPage >= totalPages
            ? "opacity-50 cursor-not-allowed bg-[#F7F6F2] dark:bg-[#121512] text-[#6B6858] dark:text-[#767468] border-[#E6E3DA] dark:border-[#2A2E29]"
            : "bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC] border-[#E6E3DA] dark:border-[#2A2E29] hover:bg-[#F7F6F2] dark:hover:bg-[#202520] cursor-pointer"
        }`}
        aria-label="Go to next page"
      >
        <span>Next</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </nav>
  );
}
