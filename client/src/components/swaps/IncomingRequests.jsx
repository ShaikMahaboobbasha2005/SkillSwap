import { useState } from "react";
import SwapRequestCard from "./SwapRequestCard";
import SwapRequestSkeleton from "./SwapRequestSkeleton";
import EmptySwapState from "./EmptySwapState";
import ConfirmModal from "../ConfirmModal";
import ToastNotification from "../ToastNotification";
import swapService from "../../services/swapService";
import { useSwap } from "../../context/SwapContext";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * IncomingRequests Component
 *
 * Renders the list of incoming swap requests sent TO the authenticated user.
 *
 * @param {Object} props
 * @param {Array} props.requests - Array of incoming swap requests
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message string
 * @param {Function} props.onRetry - Retry callback
 * @param {Function} props.onActionComplete - Refetch callback after Accept/Reject
 * @param {string} [props.statusFilter] - Currently selected status filter
 */
export default function IncomingRequests({
  requests = [],
  loading = false,
  error = "",
  onRetry,
  onActionComplete,
  statusFilter = "",
}) {
  const { refreshStats } = useSwap();
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [actionType, setActionType] = useState(null); // "accept" | "reject"
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const handleOpenConfirm = (swap, action) => {
    setSelectedSwap(swap);
    setActionType(action);
  };

  const handleCloseConfirm = () => {
    if (processing) return;
    setSelectedSwap(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedSwap || !actionType || processing) return;

    setProcessing(true);
    const swapId = selectedSwap._id;

    try {
      if (actionType === "accept") {
        await swapService.acceptSwap(swapId);
        setToast({
          show: true,
          type: "accepted",
          message: "Swap request accepted successfully!",
        });
      } else if (actionType === "reject") {
        await swapService.rejectSwap(swapId);
        setToast({
          show: true,
          type: "rejected",
          message: "Swap request rejected.",
        });
      }

      refreshStats();
      handleCloseConfirm();
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      console.error(`Failed to ${actionType} swap request:`, err);
      setToast({
        show: true,
        type: "error",
        message:
          err.response?.data?.message || err.message || `Failed to ${actionType} request. Please try again.`,
      });
      setProcessing(false);
    }
  };

  if (loading) {
    return <SwapRequestSkeleton count={3} />;
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-xs space-y-4 max-w-md mx-auto my-6">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto text-xl font-bold">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#16160F]">Failed to load incoming requests</h3>
          <p className="text-xs text-[#6B6858] mt-1">{error}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white text-xs font-semibold rounded-xl hover:bg-[#143326] transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return <EmptySwapState type="incoming" filterStatus={statusFilter} />;
  }

  return (
    <div className="space-y-4 w-full">
      <ToastNotification toast={toast} onClose={() => setToast({ show: false, type: "", message: "" })} />

      {requests.map((swap) => (
        <SwapRequestCard
          key={swap._id}
          swap={swap}
          type="incoming"
          onAccept={(s) => handleOpenConfirm(s, "accept")}
          onReject={(s) => handleOpenConfirm(s, "reject")}
          isProcessing={processing && selectedSwap?._id === swap._id}
        />
      ))}

      {/* Confirmation Modal for Accept / Reject Actions */}
      <ConfirmModal
        isOpen={Boolean(selectedSwap && actionType)}
        title={actionType === "accept" ? "Accept Swap Request?" : "Reject Swap Request?"}
        message={
          actionType === "accept"
            ? `Are you sure you want to accept the swap request from ${selectedSwap?.fromUser?.name || "this user"}?`
            : `Are you sure you want to reject the swap request from ${selectedSwap?.fromUser?.name || "this user"}?`
        }
        confirmText={actionType === "accept" ? "Accept Swap" : "Reject Request"}
        cancelText="Keep Pending"
        onConfirm={handleConfirmAction}
        onCancel={handleCloseConfirm}
      />
    </div>
  );
}
