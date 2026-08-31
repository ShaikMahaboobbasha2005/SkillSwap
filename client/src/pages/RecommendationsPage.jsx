import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import RecommendationCard from "../components/recommendations/RecommendationCard";
import RecommendationSkeleton from "../components/recommendations/RecommendationSkeleton";
import RecommendationEmptyState from "../components/recommendations/RecommendationEmptyState";
import RecommendationErrorState from "../components/recommendations/RecommendationErrorState";
import SwapRequestModal from "../components/swaps/SwapRequestModal";
import recommendationService from "../services/recommendationService";
import { Sparkles, ArrowDown, RefreshCw, Users, Info, ArrowLeft } from "lucide-react";

export default function RecommendationsPage() {
  const [isAiMode, setIsAiMode] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    isAiRequested: false,
    isAiEnhanced: false,
  });

  // Swap Request Modal State
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedSwapUser, setSelectedSwapUser] = useState(null);
  const [selectedSwapSkill, setSelectedSwapSkill] = useState(null);

  // Fetch recommendations from API (ai flag explicitly controlled by user)
  const fetchRecommendations = useCallback(
    async (pageNumber = 1, isAppend = false, aiTriggered = isAiMode) => {
      try {
        if (isAppend) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const response = await recommendationService.getRecommendations(
          pageNumber,
          12,
          aiTriggered
        );
        const newItems = response.data?.recommendations || [];
        const newMeta = response.meta || {
          page: pageNumber,
          limit: 12,
          total: newItems.length,
          totalPages: 1,
          isAiRequested: aiTriggered,
          isAiEnhanced: false,
        };

        if (isAppend) {
          setRecommendations((prev) => {
            // Avoid duplicate user IDs when appending
            const existingIds = new Set(prev.map((r) => String(r.user?._id || r.user?.id)));
            const filteredNew = newItems.filter(
              (r) => !existingIds.has(String(r.user?._id || r.user?.id))
            );
            return [...prev, ...filteredNew];
          });
        } else {
          setRecommendations(newItems);
        }

        setMeta(newMeta);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load skill matches. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isAiMode]
  );

  // Load default deterministic recommendations on initial mount
  useEffect(() => {
    fetchRecommendations(1, false, false);
  }, []);

  // Handle switching between All Matches and AI Recommendations
  const handleModeChange = (targetAiMode) => {
    if (loading || loadingMore) return;
    setIsAiMode(targetAiMode);
    fetchRecommendations(1, false, targetAiMode);
  };

  const handleLoadMore = () => {
    if (loadingMore || meta.page >= meta.totalPages) return;
    fetchRecommendations(meta.page + 1, true, isAiMode);
  };

  const handleOpenSwapModal = (targetUser, targetSkill = null) => {
    setSelectedSwapUser(targetUser);
    setSelectedSwapSkill(targetSkill);
    setSwapModalOpen(true);
  };

  const handleCloseSwapModal = () => {
    setSwapModalOpen(false);
    setSelectedSwapUser(null);
    setSelectedSwapSkill(null);
  };

  const handleSwapSuccess = () => {
    // Refresh current recommendation view
    fetchRecommendations(1, false, isAiMode);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Header Section */}
        <div className="mb-4 sm:mb-5 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#E4EEE8] text-[#1B4332] text-[11px] font-bold mb-1.5 border border-[#1B4332]/15">
              <Sparkles className="w-3 h-3" />
              <span>Smart Compatibility Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#16160F] tracking-tight">
              Find Your Skill Match
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6858] mt-0.5 max-w-2xl">
              {isAiMode
                ? "AI-enhanced matching — finding deeper connections across skills."
                : "Find people to learn from and skills to share."}
            </p>
          </div>

          {/* Action button: Refresh */}
          <div className="flex items-center gap-2 text-xs font-semibold self-start md:self-auto">
            <button
              type="button"
              onClick={() => fetchRecommendations(1, false, isAiMode)}
              disabled={loading || loadingMore}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E6E3DA] hover:bg-[#F7F6F2] text-[#16160F] transition-colors cursor-pointer shadow-xs disabled:opacity-50 text-xs"
              aria-label="Refresh recommendations"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-[#1B4332]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* User-Triggered Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
          <div className="inline-flex p-0.5 bg-white border border-[#E6E3DA] rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => handleModeChange(false)}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isAiMode
                  ? "bg-[#1B4332] text-white shadow-xs"
                  : "text-[#6B6858] hover:text-[#16160F] hover:bg-[#F7F6F2]"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>All Matches</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange(true)}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isAiMode
                  ? "bg-[#1B4332] text-white shadow-xs"
                  : "text-[#6B6858] hover:text-[#1B4332] hover:bg-[#E4EEE8]/60"
              }`}
            >
              <Sparkles className={`w-3 h-3 ${isAiMode ? "text-white" : "text-[#3FA873]"}`} />
              <span>✨ AI Recommendations</span>
            </button>
          </div>

          {/* Mode helper text */}
          <span className="text-[11px] font-medium text-[#6B6858]">
            {isAiMode
              ? "✨ AI-enhanced matching"
              : "Smart matches based on your skills"}
          </span>
        </div>

        {/* AI Mode Active Compact Banner */}
        {isAiMode && !loading && (
          <div className="mb-4 p-2.5 sm:p-3 rounded-xl bg-[#E4EEE8]/70 border border-[#1B4332]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#3FA873] shrink-0" />
              <span className="font-semibold text-[#1B4332]">
                AI is finding deeper connections between your skills and what others want to learn.
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleModeChange(false)}
              className="text-xs font-bold text-[#1B4332] hover:underline whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              ← Back to All Matches
            </button>
          </div>
        )}

        {/* Non-blocking Fallback Banner */}
        {isAiMode && meta.isAiEnhanced === false && !loading && !error && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#F7F6F2] border border-[#E6E3DA] flex items-center justify-between gap-2 text-xs text-[#6B6858]">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#6B6858] shrink-0" />
              <span>
                AI recommendations are temporarily unavailable. Showing your regular matches instead.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleModeChange(false)}
              className="font-bold text-[#1B4332] hover:underline cursor-pointer whitespace-nowrap"
            >
              All Matches
            </button>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div>
            {isAiMode && (
              <div className="text-center py-2 mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E4EEE8] text-[#1B4332] text-xs font-bold animate-pulse border border-[#1B4332]/20">
                  <Sparkles className="w-3 h-3 text-[#3FA873] animate-spin" />
                  <span>Finding deeper matches with Gemini AI...</span>
                </div>
              </div>
            )}
            <RecommendationSkeleton count={6} />
          </div>
        ) : error ? (
          <RecommendationErrorState
            message={error}
            onRetry={() => fetchRecommendations(1, false, isAiMode)}
          />
        ) : recommendations.length === 0 ? (
          isAiMode ? (
            <div className="bg-white border border-[#E6E3DA] rounded-xl p-6 sm:p-8 text-center max-w-md mx-auto shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#E4EEE8] text-[#1B4332] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-[#3FA873]" />
              </div>
              <h3 className="text-sm font-bold text-[#16160F]">
                No AI matches found right now
              </h3>
              <p className="text-xs text-[#6B6858] mt-1 mb-4 leading-relaxed">
                AI couldn't find additional matches right now. Try exploring all matches or adding more skills.
              </p>
              <button
                type="button"
                onClick={() => handleModeChange(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B4332] text-white rounded-lg text-xs font-bold hover:bg-[#143326] transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to All Matches</span>
              </button>
            </div>
          ) : (
            <RecommendationEmptyState />
          )
        ) : (
          <div className="space-y-6">
            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.user?._id || rec.user?.id}
                  recommendation={rec}
                  onRequestSwap={handleOpenSwapModal}
                />
              ))}
            </div>

            {/* Pagination / Load More Footer */}
            <div className="flex flex-col items-center justify-center pt-1 pb-4">
              {meta.page < meta.totalPages ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-white hover:bg-[#F7F6F2] text-[#16160F] border border-[#E6E3DA] rounded-lg text-xs font-bold transition-all shadow-xs hover:border-[#1B4332]/40 disabled:opacity-50 cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1B4332]" />
                      <span>Loading more matches...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Matches</span>
                      <ArrowDown className="w-3 h-3 text-[#6B6858]" />
                    </>
                  )}
                </button>
              ) : (
                <p className="text-[11px] text-[#6B6858] font-medium text-center">
                  You're all caught up • Showing {recommendations.length} {isAiMode ? "AI-enhanced" : "compatible"} match{recommendations.length === 1 ? "" : "es"}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Swap Request Modal */}
      {swapModalOpen && selectedSwapUser && (
        <SwapRequestModal
          isOpen={swapModalOpen}
          onClose={handleCloseSwapModal}
          targetUser={selectedSwapUser}
          targetSkill={selectedSwapSkill}
          onSuccess={handleSwapSuccess}
        />
      )}
    </div>
  );
}

