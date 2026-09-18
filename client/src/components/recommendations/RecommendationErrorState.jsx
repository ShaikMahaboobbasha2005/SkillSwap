import { AlertCircle, RefreshCw } from "lucide-react";

export default function RecommendationErrorState({ message, onRetry }) {
  return (
    <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800/40">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-[#16160F] dark:text-[#F2F1EC] mb-2">
        Couldn't load recommendations
      </h3>

      <p className="text-xs sm:text-sm text-[#6B6858] dark:text-[#9C9A8C] leading-relaxed mb-6">
        {message || "We encountered an issue retrieving your skill matches. Please check your connection and try again."}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] text-xs font-bold rounded-xl hover:bg-[#143326] dark:hover:bg-[#338d60] transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
