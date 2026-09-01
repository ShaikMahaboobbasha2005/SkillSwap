import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import IncomingRequests from "../components/swaps/IncomingRequests";
import OutgoingRequests from "../components/swaps/OutgoingRequests";
import SwapRequestCard from "../components/swaps/SwapRequestCard";
import SwapRequestSkeleton from "../components/swaps/SwapRequestSkeleton";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import RatingModal from "../components/swaps/RatingModal";
import ToastNotification from "../components/ToastNotification";
import swapService from "../services/swapService";
import { sortSwapsByPriority, sortSwapsByDate } from "../utils/swapSortUtils";
import { useSwap } from "../context/SwapContext";
import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";
import {
  Inbox,
  Send,
  History,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Filter,
  Award,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SwapRequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { stats, refreshStats } = useSwap();
  const { subscribeToSwapRequests, unsubscribeFromSwapRequests } = useSocket();

  // URL Sync for Tab, Status Filter, and Highlight
  const tabParam = searchParams.get("tab");
  const statusParam = searchParams.get("status") || "";
  const highlightParam = searchParams.get("highlight") || "";

  const validTabs = ["incoming", "outgoing", "history"];
  const activeTab = validTabs.includes(tabParam) ? tabParam : "incoming";
  const statusFilter = statusParam;

  const [highlightedSwapId, setHighlightedSwapId] = useState(highlightParam);

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);

  // History Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHistory, setTotalHistory] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionProcessing, setActionProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Confirmation Modal for Complete / Leave actions
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    confirmStyle: "danger",
    action: null,
  });

  // Rating Modal state
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    swap: null,
    onSuccessCallback: null,
  });

  const handleOpenRatingModal = (swap, onCardSuccess) => {
    setRatingModal({
      isOpen: true,
      swap,
      onSuccessCallback: onCardSuccess,
    });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Sync state changes with URL query parameters
  const updateTabAndStatus = (tab, status = "") => {
    setPage(1);

    const newParams = {};
    if (tab && tab !== "incoming") {
      newParams.tab = tab;
    }
    if (status) {
      newParams.status = status;
    }
    setSearchParams(newParams);
  };

  // Fetch Requests List based on activeTab & statusFilter
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (activeTab === "history") {
        const params = { page, limit: 10 };
        if (statusFilter) {
          params.status = statusFilter;
        }
        const res = await swapService.getSwapHistory(params);
        const historyData = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.swapRequests)
          ? res.swapRequests
          : [];
        setHistoryRequests(historyData);
        setTotalPages(res?.meta?.totalPages || 1);
        setTotalHistory(res?.meta?.total || historyData.length);
      } else {
        const params = {};
        if (statusFilter) {
          params.status = statusFilter;
        }

        if (activeTab === "incoming") {
          const res = await swapService.getIncomingSwaps(params);
          const incomingData = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.swapRequests)
            ? res.swapRequests
            : [];
          const sorted = statusFilter
            ? sortSwapsByDate(incomingData)
            : sortSwapsByPriority(incomingData);
          setIncomingRequests(sorted);
        } else {
          const res = await swapService.getOutgoingSwaps(params);
          const outgoingData = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.swapRequests)
            ? res.swapRequests
            : [];
          const sorted = statusFilter
            ? sortSwapsByDate(outgoingData)
            : sortSwapsByPriority(outgoingData);
          setOutgoingRequests(sorted);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab} swap requests:`, err);
      setError(
        err.response?.data?.message ||
          err.message ||
          `Failed to load ${activeTab} swap requests. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, page]);

  // Initial Load & Effect on Tab / Status Filter change
  useEffect(() => {
    refreshStats();
    fetchRequests();
  }, [refreshStats, fetchRequests]);

  // Sync highlightParam on URL changes
  useEffect(() => {
    if (highlightParam) {
      setHighlightedSwapId(highlightParam);
    }
  }, [highlightParam]);

  // Auto-scroll to highlighted card when requests finish loading and fade after 2.5s
  useEffect(() => {
    if (!loading && highlightedSwapId) {
      const scrollTimer = setTimeout(() => {
        const element =
          document.querySelector(`[data-swap-id="${highlightedSwapId}"]`) ||
          document.getElementById(`swap-card-${highlightedSwapId}`);

        if (element) {
          const prefersReducedMotion =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

          element.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "center",
          });
        }
      }, 150);

      const fadeTimer = setTimeout(() => {
        setHighlightedSwapId(null);
      }, 2500);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(fadeTimer);
      };
    }
  }, [loading, highlightedSwapId]);

  // Action Refresh Callback (Preserves activeTab and statusFilter)
  const handleActionComplete = useCallback(() => {
    refreshStats();
    fetchRequests();
  }, [refreshStats, fetchRequests]);

  // Subscribe to real-time swap request creation and status updates
  useEffect(() => {
    subscribeToSwapRequests(handleActionComplete);
    return () => {
      unsubscribeFromSwapRequests(handleActionComplete);
    };
  }, [subscribeToSwapRequests, unsubscribeFromSwapRequests, handleActionComplete]);

  // Handle Complete Action
  const handleCompleteSwap = (swap) => {
    const swapId = swap._id || swap.id;
    const fromUserIdStr = swap.fromUser?._id ? String(swap.fromUser._id) : (typeof swap.fromUser === "string" ? swap.fromUser : "");
    const currentUserIdStr = currentUserId ? String(currentUserId) : "";
    const isFromMe = Boolean(fromUserIdStr && currentUserIdStr && fromUserIdStr === currentUserIdStr);

    const partnerConfirmed = isFromMe
      ? Boolean(swap.completion?.toUserConfirmed)
      : Boolean(swap.completion?.fromUserConfirmed);

    const title = partnerConfirmed ? "Confirm Swap Completion?" : "Mark Swap as Completed?";
    const message = partnerConfirmed
      ? "Your swap partner has confirmed completion. Confirming will officially complete the exchange, move it to Swap History, and increment your completed swaps count."
      : "Are you sure you want to mark this swap as completed? Your swap partner will be notified to confirm completion.";
    const confirmText = partnerConfirmed ? "Confirm Completion" : "Mark Completed";

    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      confirmStyle: "primary",
      action: async () => {
        setActionProcessing(true);
        try {
          const res = await swapService.completeSwap(swapId);
          const updatedSwap = res?.data || res;
          const isNowCompleted = updatedSwap?.status === "completed";
          showToast(
            isNowCompleted
              ? "Swap officially completed!"
              : "Completion marked. Waiting for your swap partner to confirm.",
            "success"
          );
          handleActionComplete();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to complete swap", "error");
        } finally {
          setActionProcessing(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Handle Cancel/Decline Completion Request Action
  const handleCancelCompletionRequest = async (swap) => {
    const swapId = swap._id || swap.id;
    const requestedById = swap.completionRequestedBy?._id || swap.completionRequestedBy?.id || swap.completionRequestedBy;
    const isRequestedByMe = Boolean(currentUserId && requestedById && String(requestedById) === String(currentUserId));

    setActionProcessing(true);
    try {
      await swapService.cancelCompletionRequest(swapId);
      showToast(
        isRequestedByMe
          ? "Completion request cancelled."
          : "Declined completion request. The swap remains active.",
        "success"
      );
      handleActionComplete();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update completion request", "error");
    } finally {
      setActionProcessing(false);
    }
  };

  // Handle Leave Action
  const handleLeaveSwap = (swap) => {
    const swapId = swap._id || swap.id;
    setConfirmModal({
      isOpen: true,
      title: "Leave Swap?",
      message:
        "Are you sure you want to end/leave this swap? The conversation will become read-only and move to your Swap History.",
      confirmText: "Leave Swap",
      confirmStyle: "danger",
      action: async () => {
        setActionProcessing(true);
        try {
          await swapService.leaveSwap(swapId);
          showToast("You have left the swap.", "success");
          handleActionComplete();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to leave swap", "error");
        } finally {
          setActionProcessing(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const statusOptionsIncomingOutgoing = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
  ];

  const statusOptionsHistory = [
    { label: "All", value: "" },
    { label: "Completed", value: "completed" },
    { label: "Left", value: "left" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const currentStatusOptions =
    activeTab === "history" ? statusOptionsHistory : statusOptionsIncomingOutgoing;

  const isIncoming = activeTab === "incoming";
  const isHistory = activeTab === "history";

  // Tab-contextual statistics calculation
  const pendingCount = isIncoming
    ? (stats.incoming?.pending ?? stats.pendingIncoming ?? 0)
    : (stats.outgoing?.pending ?? stats.pendingOutgoing ?? 0);

  const acceptedCount = isIncoming
    ? (stats.incoming?.accepted ?? 0)
    : (stats.outgoing?.accepted ?? 0);

  const completedCount = stats.completed ?? 0;
  const leftCount = stats.left ?? 0;

  const currentUserId = user?._id || user?.id;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] font-sans antialiased flex flex-col">
      {/* Toast Notification */}
      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "success" })}
        />
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          confirmStyle={confirmModal.confirmStyle}
          isProcessing={actionProcessing}
          onConfirm={confirmModal.action}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Rating Modal */}
      {ratingModal.isOpen && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          swap={ratingModal.swap}
          currentUserId={currentUserId}
          onClose={() => setRatingModal({ isOpen: false, swap: null, onSuccessCallback: null })}
          onSuccess={(updatedAvgRating) => {
            showToast("Review submitted successfully!", "success");
            if (ratingModal.onSuccessCallback) {
              ratingModal.onSuccessCallback();
            }
          }}
        />
      )}

      {/* Top Application Navbar */}
      <Navbar />

      {/* Main Page Layout Container */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-6">
        {/* Page Header */}
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#16160F]">
            Swap Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6858] max-w-2xl">
            Track active requests, manage ongoing skill exchanges, and view your completed swap history.
          </p>
        </header>

        {/* 4 Tab-Contextual Statistics Overview Cards */}
        <section
          aria-label="Swap request statistics overview"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {/* Card 1: Pending / Completed */}
          <div className="bg-white border border-[#E6E3DA] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0">
              {isHistory ? <Award className="w-5 h-5 text-emerald-700" /> : <Clock className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
                {isHistory ? "Completed" : "Pending"}
              </span>
              <span className="text-lg font-black text-[#16160F]">
                {isHistory ? completedCount : pendingCount}
              </span>
            </div>
          </div>

          {/* Card 2: Accepted / Left */}
          <div className="bg-white border border-[#E6E3DA] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 flex items-center justify-center shrink-0">
              {isHistory ? <LogOut className="w-5 h-5 text-zinc-600" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
                {isHistory ? "Left Swaps" : "Accepted"}
              </span>
              <span className="text-lg font-black text-[#16160F]">
                {isHistory ? leftCount : acceptedCount}
              </span>
            </div>
          </div>

          {/* Card 3: Rejected / Cancelled */}
          <div className="bg-white border border-[#E6E3DA] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isHistory
                  ? "bg-zinc-100 text-zinc-700 border-zinc-200"
                  : isIncoming
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {isHistory ? <Ban className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
                {isHistory ? "Cancelled / Rejected" : isIncoming ? "Awaiting Response" : "Awaiting Partner"}
              </span>
              <span className="text-lg font-black text-[#16160F]">
                {isHistory
                  ? (stats.cancelled ?? 0) + (stats.rejected ?? 0)
                  : pendingCount}
              </span>
            </div>
          </div>

          {/* Card 4: Total */}
          <div className="bg-white border border-[#E6E3DA] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 flex items-center justify-center shrink-0">
              {isHistory ? (
                <History className="w-5 h-5" />
              ) : isIncoming ? (
                <Inbox className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6858] block">
                {isHistory ? "Total History" : isIncoming ? "Total Incoming" : "Total Outgoing"}
              </span>
              <span className="text-lg font-black text-[#16160F]">
                {isHistory
                  ? totalHistory
                  : isIncoming
                  ? (stats.incoming?.total ?? (pendingCount + acceptedCount))
                  : (stats.outgoing?.total ?? (pendingCount + acceptedCount))}
              </span>
            </div>
          </div>
        </section>

        {/* Primary Tabs & Status Filter Controls */}
        <section
          aria-label="Filter and tab controls"
          className="bg-white border border-[#E6E3DA] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
        >
          {/* Main 3 Tabs: Incoming / Outgoing / Swap History */}
          <div className="flex items-center justify-between border-b border-[#E6E3DA]/80 pb-3 gap-2 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {/* Tab 1: Incoming */}
              <button
                type="button"
                onClick={() => updateTabAndStatus("incoming", "")}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 ${
                  activeTab === "incoming"
                    ? "bg-[#1B4332] text-white shadow-2xs"
                    : "text-[#6B6858] hover:text-[#16160F] hover:bg-[#F7F6F2]"
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>Incoming Requests</span>
                {stats.pendingIncoming > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-400 text-amber-950">
                    {stats.pendingIncoming}
                  </span>
                )}
              </button>

              {/* Tab 2: Outgoing */}
              <button
                type="button"
                onClick={() => updateTabAndStatus("outgoing", "")}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 ${
                  activeTab === "outgoing"
                    ? "bg-[#1B4332] text-white shadow-2xs"
                    : "text-[#6B6858] hover:text-[#16160F] hover:bg-[#F7F6F2]"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Outgoing Requests</span>
                {stats.pendingOutgoing > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#E4EEE8] text-[#1B4332]">
                    {stats.pendingOutgoing}
                  </span>
                )}
              </button>

              {/* Tab 3: Swap History */}
              <button
                type="button"
                onClick={() => updateTabAndStatus("history", "")}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 ${
                  activeTab === "history"
                    ? "bg-[#1B4332] text-white shadow-2xs"
                    : "text-[#6B6858] hover:text-[#16160F] hover:bg-[#F7F6F2]"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Swap History</span>
              </button>
            </div>
          </div>

          {/* Status Filter Pills Bar */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B6858] mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            {currentStatusOptions.map((opt) => {
              const isSelected = statusFilter === opt.value;
              return (
                <button
                  key={opt.value || "all"}
                  type="button"
                  onClick={() => updateTabAndStatus(activeTab, opt.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1B4332] text-white border-[#1B4332]"
                      : "bg-[#F7F6F2] text-[#16160F] border-[#E6E3DA] hover:border-[#1B4332]/40"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Requests / History List Section */}
        <section aria-label="Swap requests list">
          {activeTab === "incoming" ? (
            <IncomingRequests
              requests={incomingRequests}
              loading={loading}
              error={error}
              onRetry={fetchRequests}
              onActionComplete={handleActionComplete}
              onComplete={handleCompleteSwap}
              onCancelCompletion={handleCancelCompletionRequest}
              onLeave={handleLeaveSwap}
              statusFilter={statusFilter}
              highlightedSwapId={highlightedSwapId}
            />
          ) : activeTab === "outgoing" ? (
            <OutgoingRequests
              requests={outgoingRequests}
              loading={loading}
              error={error}
              onRetry={fetchRequests}
              onActionComplete={handleActionComplete}
              onComplete={handleCompleteSwap}
              onCancelCompletion={handleCancelCompletionRequest}
              onLeave={handleLeaveSwap}
              statusFilter={statusFilter}
              highlightedSwapId={highlightedSwapId}
            />
          ) : (
            /* Swap History Tab View */
            <div className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SwapRequestSkeleton />
                  <SwapRequestSkeleton />
                </div>
              ) : error ? (
                <EmptyState
                  icon={History}
                  title="Failed to Load Swap History"
                  description={error}
                  actionLabel="Try Again"
                  onAction={fetchRequests}
                />
              ) : historyRequests.length === 0 ? (
                <EmptyState
                  icon={History}
                  title={
                    statusFilter
                      ? `No ${statusFilter} Swaps Found`
                      : "No Swap History Available"
                  }
                  description={
                    statusFilter
                      ? `You don't have any ${statusFilter} swaps matching this filter.`
                      : "Completed, ended, or cancelled swaps will appear here in your swap history."
                  }
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {historyRequests.map((swap) => (
                      <SwapRequestCard
                        key={swap._id || swap.id}
                        swap={swap}
                        type="history"
                        currentUserId={currentUserId}
                        onRatePartner={handleOpenRatingModal}
                        isHighlighted={Boolean(
                          highlightedSwapId &&
                            String(highlightedSwapId) ===
                              String(swap._id || swap.id)
                        )}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-[#E6E3DA]">
                      <span className="text-xs text-[#6B6858]">
                        Page {page} of {totalPages} ({totalHistory} total history items)
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                          disabled={page <= 1}
                          className="h-8 px-3 text-xs font-semibold rounded-xl border border-[#E6E3DA] bg-white text-[#16160F] hover:bg-[#F7F6F2] disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={page >= totalPages}
                          className="h-8 px-3 text-xs font-semibold rounded-xl border border-[#E6E3DA] bg-white text-[#16160F] hover:bg-[#F7F6F2] disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
