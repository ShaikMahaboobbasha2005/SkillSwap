import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

/**
 * Helper to safely extract skill name
 */
const getSkillName = (skillObj, snapshotName, fallback = "Skill") => {
  if (skillObj && typeof skillObj === "object") {
    const name = skillObj.name || skillObj.title || skillObj.skillName;
    if (name && typeof name === "string" && name.trim().length > 0) return name;
  }
  if (typeof skillObj === "string" && skillObj.trim().length > 0) return skillObj;
  if (snapshotName && typeof snapshotName === "string" && snapshotName.trim().length > 0) return snapshotName;
  return fallback;
};

/**
 * PendingRequestsSection Component
 *
 * Displays pending incoming and outgoing swap requests with clear badges
 * and deep links to the SwapRequestsPage tab and target highlight.
 */
export default function PendingRequestsSection({
  pendingSwaps = [],
  loading = false,
  currentUserId = null,
}) {
  const currentUserIdStr = currentUserId ? String(currentUserId) : "";
  const safePendingSwaps = Array.isArray(pendingSwaps) ? pendingSwaps.filter(Boolean) : [];

  return (
    <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E3DA] dark:border-[#2A2E29]">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-[#16160F] dark:text-[#F2F1EC] tracking-tight">
              Pending Requests
            </h2>
            {safePendingSwaps.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                {safePendingSwaps.length}
              </span>
            )}
          </div>
          <Link
            to="/swaps"
            className="text-xs font-bold text-[#1B4332] dark:text-[#3FA873] hover:underline inline-flex items-center gap-1 transition-colors"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Area */}
        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-16 bg-zinc-100 dark:bg-[#202520] animate-pulse rounded-xl" />
              ))}
            </div>
          ) : safePendingSwaps.length === 0 ? (
            /* Empty State */
            <div className="py-8 text-center px-4 bg-[#F7F6F2] dark:bg-[#121512] border border-dashed border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] flex items-center justify-center mx-auto text-[#6B6858] dark:text-[#9C9A8C] mb-3">
                <CheckCircle2 className="w-5 h-5 text-[#3FA873]" />
              </div>
              <h3 className="text-sm font-bold text-[#16160F] dark:text-[#F2F1EC]">
                No pending requests
              </h3>
              <p className="mt-1 text-xs text-[#6B6858] dark:text-[#9C9A8C] max-w-sm mx-auto">
                You're all caught up on incoming and outgoing swap requests.
              </p>
              <Link
                to="/discover"
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#F7F6F2] dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#16160F] dark:text-[#F2F1EC] hover:border-[#1B4332] dark:hover:border-[#3FA873] hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors"
              >
                <span>Find Skills to Swap →</span>
              </Link>
            </div>
          ) : (
            /* Pending Requests List */
            <div className="space-y-3">
              {safePendingSwaps.map((swap, index) => {
                const swapId = swap._id || swap.id || `pending-${index}`;
                const toUserId = swap.toUser?._id ? String(swap.toUser._id) : String(swap.toUser || "");
                const isIncoming = Boolean(toUserId && currentUserIdStr && toUserId === currentUserIdStr);

                // Counterpart user
                const partner = isIncoming ? swap.fromUser : swap.toUser;
                const partnerId = partner?._id || partner?.id || (typeof partner === "string" ? partner : "");
                const partnerName = partner && typeof partner === "object" && partner.name ? partner.name : "Skill Partner";
                const partnerAvatar = partner && typeof partner === "object" ? partner.profilePicture : "";

                // Skill names
                const offeredName = getSkillName(swap.offeredSkill, swap.offeredSkillSnapshot?.name, "Skill");
                const wantedName = getSkillName(swap.wantedSkill, swap.wantedSkillSnapshot?.name, "Skill");

                const targetTab = isIncoming ? "incoming" : "outgoing";
                const targetLink = `/swaps?tab=${targetTab}&highlight=${encodeURIComponent(swapId)}`;

                return (
                  <Link
                    key={swapId}
                    to={targetLink}
                    className="group block p-3 sm:p-3.5 rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18] hover:border-[#1B4332] dark:hover:border-[#3FA873] hover:bg-[#FDFCFB] dark:hover:bg-[#1C201C] transition-all duration-150"
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: Avatar + Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        {partnerAvatar ? (
                          <img
                            src={partnerAvatar}
                            alt={partnerName}
                            className="w-9 h-9 rounded-full object-cover border border-[#E6E3DA] dark:border-[#2A2E29] shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] font-bold flex items-center justify-center text-xs shrink-0 border border-[#1B4332]/20 dark:border-[#3FA873]/30">
                            {partnerName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#16160F] dark:text-[#F2F1EC] group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873] transition-colors truncate">
                              {partnerName}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                isIncoming
                                  ? "bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873]"
                                  : "bg-[#F7F6F2] dark:bg-[#202520] text-[#6B6858] dark:text-[#9C9A8C] border border-[#E6E3DA] dark:border-[#2A2E29]"
                              }`}
                            >
                              {isIncoming ? "Incoming" : "Outgoing"}
                            </span>
                          </div>

                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6B6858] dark:text-[#9C9A8C] truncate">
                            <span className="truncate">
                              {isIncoming
                                ? `Offers ${offeredName} ↔ Requests ${wantedName}`
                                : `You offer ${offeredName} ↔ Request ${wantedName}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right CTA */}
                      <div className="flex items-center gap-1 text-xs font-bold text-[#1B4332] dark:text-[#3FA873] shrink-0">
                        <span className="hidden sm:inline">
                          {isIncoming ? "Review" : "View"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
