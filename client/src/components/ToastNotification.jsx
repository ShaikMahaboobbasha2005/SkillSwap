import { useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Send,
  XCircle,
  Ban,
} from "lucide-react";

/**
 * ToastNotification Component
 *
 * Renders context-aware semantic toast variants per Design.md rules.
 *
 * Supported toast types:
 * - "sent" | "primary" : Pine / Dark Accent with Send icon
 * - "success" | "accepted" : Emerald Green with CheckCircle2 icon
 * - "rejected" : Amber / Orange with XCircle icon
 * - "cancelled" : Neutral Gray / Zinc with Ban icon
 * - "warning" : Yellow / Amber with AlertTriangle icon
 * - "error" : Red with AlertCircle icon
 * - "info" / default : Dark with Info icon
 */
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

  const type = toast.type ? toast.type.toLowerCase() : "info";

  let bgStyles = "bg-[#16160F] text-white border-[#16160F]";
  let iconComponent = <Info className="w-4 h-4 text-white/90" />;

  switch (type) {
    case "sent":
    case "primary":
      bgStyles = "bg-[#1B4332] text-white border-[#1B4332]/80 shadow-[#1B4332]/20";
      iconComponent = <Send className="w-4 h-4 text-emerald-300" />;
      break;

    case "success":
    case "accepted":
      bgStyles = "bg-emerald-700 text-white border-emerald-800 shadow-emerald-700/20";
      iconComponent = <CheckCircle2 className="w-4 h-4 text-emerald-200" />;
      break;

    case "rejected":
      bgStyles = "bg-amber-700 text-white border-amber-800 shadow-amber-700/20";
      iconComponent = <XCircle className="w-4 h-4 text-amber-200" />;
      break;

    case "cancelled":
      bgStyles = "bg-zinc-700 text-white border-zinc-800 shadow-zinc-700/20";
      iconComponent = <Ban className="w-4 h-4 text-zinc-200" />;
      break;

    case "warning":
      bgStyles = "bg-amber-600 text-white border-amber-700 shadow-amber-600/20";
      iconComponent = <AlertTriangle className="w-4 h-4 text-amber-100" />;
      break;

    case "error":
      bgStyles = "bg-red-600 text-white border-red-700 shadow-red-600/20";
      iconComponent = <AlertCircle className="w-4 h-4 text-red-200" />;
      break;

    default:
      bgStyles = "bg-[#16160F] text-white border-[#16160F]";
      iconComponent = <Info className="w-4 h-4 text-white/90" />;
      break;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-50 max-w-sm w-full animate-slideDown pointer-events-auto"
    >
      <div
        className={`relative overflow-hidden p-4 rounded-xl shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all ${bgStyles}`}
      >
        {/* Left Status Icon (Purely Decorative & Non-Clickable) */}
        <div className="shrink-0 mt-0.5 pointer-events-none select-none" aria-hidden="true">
          <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
            {iconComponent}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-semibold tracking-wide leading-snug">
            {toast.message}
          </p>
        </div>

        {/* Right Dismiss Button */}
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
