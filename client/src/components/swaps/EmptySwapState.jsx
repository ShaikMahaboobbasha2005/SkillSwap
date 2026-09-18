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
    <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-[#E4EEE8] dark:bg-[#1C2E24] border border-[#1B4332]/20 dark:border-[#3FA873]/30 flex items-center justify-center mx-auto text-[#1B4332] dark:text-[#3FA873] shadow-2xs">
        {isIncoming ? (
          <Inbox className="w-7 h-7 text-[#1B4332] dark:text-[#3FA873]" />
        ) : (
          <Send className="w-7 h-7 text-[#1B4332] dark:text-[#3FA873]" />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-[#16160F] dark:text-[#F2F1EC]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#6B6858] dark:text-[#9C9A8C] max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {!isIncoming && (
        <div className="pt-2">
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] text-xs font-semibold rounded-xl hover:bg-[#143326] dark:hover:bg-[#339162] transition-all active:scale-[0.98] shadow-2xs"
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
