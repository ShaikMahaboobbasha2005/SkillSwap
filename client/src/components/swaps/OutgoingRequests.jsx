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
 * OutgoingRequests Component
 *
 * Renders the list of outgoing swap requests created BY the authenticated user.
 *
 * @param {Object} props
 * @param {Array} props.requests - Array of outgoing swap requests
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message string
 * @param {Function} props.onRetry - Retry callback
 * @param {Function} props.onActionComplete - Refetch callback after Cancel
 * @param {string} [props.statusFilter] - Currently selected status filter
 */
export default function OutgoingRequests({
  requests = [],
  loading = false,
  error = "",
  onRetry,
  onActionComplete,
  statusFilter = "",
}) {
  const { refreshStats } = useSwap();
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const handleOpenCancelConfirm = (swap) => {
    setSelectedSwap(swap);
  };

  const handleCloseCancelConfirm = () => {
    if (processing) return;
    setSelectedSwap(null);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSwap || processing) return;

    setProcessing(true);
    const swapId = selectedSwap._id;

    try {
      await swapService.cancelSwap(swapId);
      setToast({
        show: true,
        type: "cancelled",
        message: "Swap request cancelled successfully.",
      });

      refreshStats();
      handleCloseCancelConfirm();
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      console.error("Failed to cancel swap request:", err);
      setToast({
        show: true,
        type: "error",
        message:
          err.response?.data?.message || err.message || "Failed to cancel swap request. Please try again.",
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
          <h3 className="text-sm font-bold text-[#16160F]">Failed to load outgoing requests</h3>
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
    return <EmptySwapState type="outgoing" filterStatus={statusFilter} />;
  }

  return (
    <div className="space-y-4 w-full">
      <ToastNotification toast={toast} onClose={() => setToast({ show: false, type: "", message: "" })} />

      {requests.map((swap) => (
        <SwapRequestCard
          key={swap._id}
          swap={swap}
          type="outgoing"
          onCancel={handleOpenCancelConfirm}
          isProcessing={processing && selectedSwap?._id === swap._id}
        />
      ))}

      {/* Confirmation Modal for Cancel Action */}
      <ConfirmModal
        isOpen={Boolean(selectedSwap)}
        title="Cancel Swap Request?"
        message={`Are you sure you want to cancel the swap request sent to ${
          selectedSwap?.toUser?.name || "this user"
        }? This action cannot be undone.`}
        confirmText="Cancel Swap Request"
        cancelText="Keep Request"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseCancelConfirm}
      />
    </div>
  );
}
