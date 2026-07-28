import { useEffect } from "react";

export default function ToastNotification({ toast, onClose }) {
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
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          {isSuccess ? (
            <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : isError ? (
            <div className="w-6 h-6 rounded-full bg-red-400/20 flex items-center justify-center text-red-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold tracking-wide leading-snug">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="shrink-0 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Auto Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white/60 transition-all duration-[4000ms] linear"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
