import { AlertCircle, RefreshCw } from "lucide-react";

export default function RecommendationErrorState({ message, onRetry }) {
  return (
    <div className="bg-white border border-[#E6E3DA] rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-[#16160F] mb-2">
        Couldn't load recommendations
      </h3>

      <p className="text-xs sm:text-sm text-[#6B6858] leading-relaxed mb-6">
        {message || "We encountered an issue retrieving your skill matches. Please check your connection and try again."}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white text-xs font-bold rounded-xl hover:bg-[#143326] transition-colors shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
