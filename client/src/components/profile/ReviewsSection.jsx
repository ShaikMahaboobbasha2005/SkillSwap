import { useState, useEffect, useCallback } from "react";
import ReviewCard from "./ReviewCard";
import ratingService from "../../services/ratingService";
import { Star, Loader2, RefreshCw, MessageSquareQuote } from "lucide-react";

/**
 * ReviewsSection Component
 * Displays reviews received by a user with pagination / Load More capabilities.
 *
 * @param {Object} props
 * @param {string} props.userId - Target user ID whose received reviews are fetched
 * @param {number} [props.avgRating=0] - Profile average rating (server-managed)
 * @param {string} [props.className] - Optional container classes
 */
export default function ReviewsSection({
  userId,
  avgRating = 0,
  className = "",
  highlightSwapId = null,
  highlightReviewId = null,
  isOwner = false,
}) {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const initialHighlight = highlightSwapId || highlightReviewId || null;
  const [targetHighlight, setTargetHighlight] = useState(initialHighlight);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(
    async (targetPage = 1, isAppend = false) => {
      if (!userId) {
        setLoading(false);
        return;
      }

      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const res = await ratingService.getRatingsForUser(userId, {
          page: targetPage,
          limit: 5,
        });

        const newRatings = Array.isArray(res?.data) ? res.data : [];
        const meta = res?.meta || {};

        if (isAppend) {
          setReviews((prev) => {
            const existingIds = new Set(prev.map((r) => r._id || r.id));
            const uniqueNew = newRatings.filter((r) => !existingIds.has(r._id || r.id));
            return [...prev, ...uniqueNew];
          });
        } else {
          setReviews(newRatings);
        }

        setTotal(meta.total ?? newRatings.length);
        setTotalPages(meta.totalPages ?? 1);
        setPage(targetPage);
      } catch (err) {
        console.error(`Failed to fetch reviews for user ${userId}:`, err);
        setError(
          err.response?.data?.message || err.message || "Failed to load reviews. Please try again."
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  // Sync targetHighlight on prop changes
  useEffect(() => {
    if (highlightSwapId || highlightReviewId) {
      setTargetHighlight(highlightSwapId || highlightReviewId);
    }
  }, [highlightSwapId, highlightReviewId]);

  // Auto-scroll to highlighted review card when reviews finish loading
  useEffect(() => {
    if (!loading && targetHighlight) {
      const scrollTimer = setTimeout(() => {
        const element =
          document.querySelector(`[data-swap-id="${targetHighlight}"]`) ||
          document.querySelector(`[data-review-id="${targetHighlight}"]`) ||
          document.getElementById("reviews-section");

        if (element) {
          const prefersReducedMotion =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

          element.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center",
          });
        }
      }, 200);

      const fadeTimer = setTimeout(() => {
        setTargetHighlight(null);
      }, 2500);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(fadeTimer);
      };
    }
  }, [loading, targetHighlight]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchReviews(page + 1, true);
    }
  };

  const formattedAvgRating =
    typeof avgRating === "number" && avgRating > 0 ? Number(avgRating).toFixed(1) : "0.0";
  const hasReviews = reviews.length > 0;

  return (
    <section
      id="reviews-section"
      aria-label="Reviews and Ratings"
      className={`bg-white rounded-2xl border border-[#E6E3DA] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 ${className}`}
    >
      {/* Section Header: Title & Overall Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E3DA]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-[#B8860B] fill-[#B8860B]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#16160F]">Reviews & Ratings</h3>
            <p className="text-xs text-[#6B6858]">
              Ratings and feedback received from skill swap partners
            </p>
          </div>
        </div>

        {/* Rating Summary Badge */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-[#F7F6F2] border border-[#E6E3DA] px-3.5 py-1.5 rounded-xl shrink-0">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[#B8860B] fill-[#B8860B]" />
            <span className="text-sm font-extrabold text-[#16160F]">
              {formattedAvgRating}
            </span>
            <span className="text-xs text-[#6B6858] font-medium">/ 5.0</span>
          </div>
          <span className="text-xs text-[#E6E3DA] font-bold">|</span>
          <span className="text-xs font-semibold text-[#6B6858]">
            {total} {total === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-4">
        {loading && page === 1 ? (
          /* Initial Skeleton Loader Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-[#E6E3DA] space-y-3 animate-pulse bg-[#F7F6F2]/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#E6E3DA]" />
                    <div className="space-y-1.5">
                      <div className="w-24 h-3 bg-[#E6E3DA] rounded-md" />
                      <div className="w-16 h-2 bg-[#E6E3DA] rounded-md" />
                    </div>
                  </div>
                  <div className="w-12 h-3 bg-[#E6E3DA] rounded-md" />
                </div>
                <div className="w-full h-14 bg-[#E6E3DA]/60 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error && !hasReviews ? (
          /* Error State */
          <div className="p-6 text-center bg-[#F7F6F2] border border-red-200 rounded-2xl space-y-3">
            <p className="text-xs text-red-600 font-semibold">{error}</p>
            <button
              type="button"
              onClick={() => fetchReviews(1, false)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#143326] rounded-xl transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : !hasReviews ? (
          /* Clean Empty State */
          <div className="p-8 text-center bg-[#F7F6F2] border border-[#E6E3DA] rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E6E3DA] flex items-center justify-center mx-auto text-[#6B6858] shadow-2xs">
              <MessageSquareQuote className="w-5 h-5 text-[#1B4332]" />
            </div>
            <h4 className="text-xs font-bold text-[#16160F]">No reviews yet</h4>
            <p className="text-[11px] text-[#6B6858] max-w-sm mx-auto">
              Complete skill swaps to start building your reputation and receive feedback from partners.
            </p>
          </div>
        ) : (
          /* Compact Review Cards Grid */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => {
                const swapId = (review.swapRequest?._id || review.swapRequest)?.toString();
                const reviewId = (review._id || review.id)?.toString();
                const isItemHighlighted = Boolean(
                  targetHighlight &&
                    (swapId === targetHighlight || reviewId === targetHighlight)
                );

                return (
                  <ReviewCard
                    key={reviewId || swapId}
                    review={review}
                    isHighlighted={isItemHighlighted}
                    canNavigate={isOwner}
                  />
                );
              })}
            </div>

            {/* Load More Button */}
            {page < totalPages && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 text-xs font-bold text-[#16160F] hover:text-[#1B4332] bg-[#F7F6F2] hover:bg-[#E4EEE8] border border-[#E6E3DA] hover:border-[#1B4332]/40 rounded-xl transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2 shadow-2xs disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1B4332]" />
                      <span>Loading Reviews...</span>
                    </>
                  ) : (
                    <span>Load More Reviews</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
