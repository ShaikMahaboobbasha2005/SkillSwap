import { AlertTriangle } from "lucide-react";

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="w-full bg-red-50/80 border border-red-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-3 my-4 animate-fadeIn">
      <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-red-900">
          Unable to load skills
        </h3>
        <p className="text-xs text-red-700 mt-0.5 max-w-sm">
          {error || "An error occurred while communicating with the server. Please try again."}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
        >
          Retry
        </button>
      )}
    </div>
  );
}
