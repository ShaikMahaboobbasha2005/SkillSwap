import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastNotification({
  toast,
  onClose,
  showCloseButton = true,
  autoHideDuration = 4000,
}) {
  useEffect(() => {
    if (!toast || !toast.show) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, autoHideDuration);
    return () => clearTimeout(timer);
  }, [toast, onClose, autoHideDuration]);

  if (!toast || !toast.show) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-50 max-w-sm w-full animate-slideDown pointer-events-auto"
    >
      <div
        className={`relative overflow-hidden p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all ${
          isSuccess
            ? "bg-[#1B4332] text-white border-[#1B4332]/80 shadow-[#1B4332]/20"
            : isError
            ? "bg-red-600 text-white border-red-700 shadow-red-600/20"
            : "bg-[#16160F] text-white border-[#16160F]"
        }`}
      >
        {/* Left Status Icon (Purely Decorative & Non-Clickable) */}
        <div className="shrink-0 mt-0.5 pointer-events-none select-none" aria-hidden="true">
          {isSuccess ? (
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : isError ? (
            <div className="w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center text-red-200">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Info className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-semibold tracking-wide leading-snug">
            {toast.message}
          </p>
        </div>

        {/* Right Dismiss Button (Dismisses Alert Only) */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            title="Dismiss notification"
            className="shrink-0 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Auto Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 pointer-events-none">
          <div
            className="h-full bg-white/60 transition-all duration-[4000ms] linear"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
