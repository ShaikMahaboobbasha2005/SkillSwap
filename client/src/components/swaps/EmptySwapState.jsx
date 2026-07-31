import { Link } from "react-router-dom";
import { Inbox, Send, Compass, ArrowRight } from "lucide-react";

/**
 * EmptySwapState Component
 *
 * Displays a clean empty state card matching project design rules when no swap requests exist.
 *
 * @param {Object} props
 * @param {"incoming" | "outgoing"} props.type - Tab type
 * @param {string} [props.filterStatus] - Currently selected status filter
 */
export default function EmptySwapState({ type = "incoming", filterStatus = "" }) {
  const isIncoming = type === "incoming";

  let title = isIncoming ? "No incoming swap requests." : "You haven't sent any swap requests yet.";
  let description = isIncoming
    ? "When other users request to learn your skills or exchange with you, their requests will appear here."
    : "Explore community members on the Discover page and send your first skill swap request.";

  if (filterStatus) {
    title = `No ${filterStatus} ${isIncoming ? "incoming" : "outgoing"} requests.`;
    description = `There are currently no swap requests with "${filterStatus}" status.`;
  }

  return (
    <div className="bg-white border border-[#E6E3DA] rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-[#E4EEE8] border border-[#1B4332]/20 flex items-center justify-center mx-auto text-[#1B4332] shadow-2xs">
        {isIncoming ? (
          <Inbox className="w-7 h-7 text-[#1B4332]" />
        ) : (
          <Send className="w-7 h-7 text-[#1B4332]" />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-[#16160F]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#6B6858] max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {!isIncoming && (
        <div className="pt-2">
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white text-xs font-semibold rounded-xl hover:bg-[#143326] transition-all active:scale-[0.98] shadow-2xs"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
