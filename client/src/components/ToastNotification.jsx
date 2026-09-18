import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Send,
  XCircle,
  Ban,
  RotateCcw,
} from "lucide-react";

/**
 * ToastNotification Component
 *
 * Renders context-aware semantic toast variants per Design.md rules via a React Portal
 * at document.body with z-[10050] stacking order to ensure toasts are ALWAYS visible
 * above modals, overlays, and all page elements.
 *
 * Supported toast types:
 * - "undo" : White surface with #E6E3DA border, #1B4332 Pine action button, and 5s countdown timer
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
  const duration = toast?.duration || autoHideDuration;
  const isUndo = toast?.type === "undo" || Boolean(toast?.action);
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.ceil(duration / 1000)
  );
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!toast || !toast.show) return;

    startTimeRef.current = Date.now();
    const initialSeconds = Math.ceil(duration / 1000);
    setSecondsRemaining(initialSeconds);

    // Countdown interval for visual seconds display
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
      setSecondsRemaining(remaining);
    }, 250);

    // Auto-dismiss timeout
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [toast, onClose, duration]);

  if (!toast || !toast.show) return null;

  // Render Undo Toast Variant (Phase 9.5 Specification)
  if (isUndo) {
    const handleActionClick = () => {
      if (toast.action?.onClick) {
        toast.action.onClick();
      }
      onClose?.();
    };

    return createPortal(
      <div
        role="status"
        aria-live="polite"
        className="fixed top-5 right-5 z-[10050] max-w-sm w-full animate-slideDown pointer-events-auto select-none"
      >
        <div className="relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] shadow-xl flex flex-col gap-3 text-[#16160F] dark:text-[#F2F1EC] backdrop-blur-md transition-all">
          {/* Header Row: Message & Countdown Pill */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-xl bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30 flex items-center justify-center shrink-0 shadow-2xs"
                aria-hidden="true"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <p className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] tracking-tight leading-snug truncate">
                {toast.message}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Countdown Ticker */}
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F7F6F2] dark:bg-[#202520] text-[#6B6858] dark:text-[#9C9A8C] border border-[#E6E3DA] dark:border-[#2A2E29] tabular-nums">
                {secondsRemaining}s
              </span>

              {/* Close / Dismiss button */}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Dismiss notification"
                  title="Dismiss notification"
                  className="text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] p-1 rounded-lg hover:bg-[#F7F6F2] dark:hover:bg-[#202520] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Row: Undo Button */}
          {toast.action && (
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E6E3DA]/60 dark:border-[#2A2E29]">
              <button
                type="button"
                onClick={handleActionClick}
                className="px-4 py-1.5 bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#338d60] text-white dark:text-[#0F1210] text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs active:scale-[0.97] transition-all cursor-pointer inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#3FA873]"
                aria-label={toast.action.label || "Undo"}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{toast.action.label || "Undo"}</span>
              </button>
            </div>
          )}

          {/* Linear Progress Bar (Pine / Dark Accent #3FA873) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E6E3DA]/60 dark:bg-[#2A2E29] pointer-events-none overflow-hidden">
            <div
              className="h-full bg-[#3FA873] transition-all linear"
              style={{
                width: "100%",
                animation: `toastCountdown ${duration}ms linear forwards`,
              }}
            />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Standard Semantic Toast Variants
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

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-[10050] max-w-sm w-full animate-slideDown pointer-events-auto select-none"
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
            className="h-full bg-white/60 transition-all linear"
            style={{
              width: "100%",
              animation: `toastCountdown ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
