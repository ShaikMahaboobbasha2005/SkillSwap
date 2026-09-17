import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight, ArrowLeftRight, Compass } from "lucide-react";
import { OfferedSkillIcon, WantedSkillIcon } from "../icons";

/**
 * Helper to extract skill name safely across object, snapshot, or string
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
 * ActiveSwapsSection Component
 *
 * Displays ongoing accepted swaps with direct links to the chat workspace.
 * Handles empty state gracefully with a clear CTA to Discover Skills.
 */
export default function ActiveSwapsSection({ swaps = [], loading = false, currentUserId = null }) {
  const currentUserIdStr = currentUserId ? String(currentUserId) : "";
  const safeSwaps = Array.isArray(swaps) ? swaps.filter(Boolean) : [];

  return (
    <div className="bg-white border border-[#E6E3DA] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E3DA]">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-[#16160F] tracking-tight">
              Active Swaps
            </h2>
            {safeSwaps.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E4EEE8] text-[#1B4332]">
                {safeSwaps.length}
              </span>
            )}
          </div>
          <Link
            to="/chats"
            className="text-xs font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1 transition-colors"
          >
            <span>View All Chats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Area */}
        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-20 bg-zinc-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : safeSwaps.length === 0 ? (
            /* Empty State */
            <div className="py-8 text-center px-4 bg-[#F7F6F2] border border-dashed border-[#E6E3DA] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white border border-[#E6E3DA] flex items-center justify-center mx-auto text-[#6B6858] mb-3">
                <ArrowLeftRight className="w-5 h-5 text-[#1B4332]" />
              </div>
              <h3 className="text-sm font-bold text-[#16160F]">
                No active swaps yet
              </h3>
              <p className="mt-1 text-xs text-[#6B6858] max-w-sm mx-auto">
                Find someone who can teach what you want to learn and share your knowledge in return.
              </p>
              <Link
                to="/discover"
                className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1B4332] text-white hover:bg-[#153427] transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Discover Skills →</span>
              </Link>
            </div>
          ) : (
            /* Active Swaps List */
            <div className="space-y-3">
              {safeSwaps.map((swap, index) => {
                const swapId = swap._id || swap.id || `active-${index}`;
                const fromUserId = swap.fromUser?._id ? String(swap.fromUser._id) : String(swap.fromUser || "");
                const isFromMe = Boolean(fromUserId && currentUserIdStr && fromUserId === currentUserIdStr);

                // Counterpart user
                const partner = isFromMe ? swap.toUser : swap.fromUser;
                const partnerId = partner?._id || partner?.id || (typeof partner === "string" ? partner : "");
                const partnerName = partner && typeof partner === "object" && partner.name ? partner.name : "Skill Partner";
                const partnerAvatar = partner && typeof partner === "object" ? partner.profilePicture : "";

                // Skills determination:
                const mySkillName = isFromMe
                  ? getSkillName(swap.offeredSkill, swap.offeredSkillSnapshot?.name, "My Skill")
                  : getSkillName(swap.wantedSkill, swap.wantedSkillSnapshot?.name, "My Skill");

                const partnerSkillName = isFromMe
                  ? getSkillName(swap.wantedSkill, swap.wantedSkillSnapshot?.name, "Partner's Skill")
                  : getSkillName(swap.offeredSkill, swap.offeredSkillSnapshot?.name, "Partner's Skill");

                return (
                  <div
                    key={swapId}
                    className="p-3.5 sm:p-4 rounded-xl border border-[#E6E3DA] bg-white hover:border-[#1B4332] transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Partner info + Skills */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <Link to={partnerId ? `/users/${partnerId}` : "#"} className="shrink-0">
                        {partnerAvatar ? (
                          <img
                            src={partnerAvatar}
                            alt={partnerName}
                            className="w-10 h-10 rounded-full object-cover border border-[#E6E3DA]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#E4EEE8] text-[#1B4332] font-bold flex items-center justify-center text-sm border border-[#1B4332]/20">
                            {partnerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={partnerId ? `/users/${partnerId}` : "#"}
                            className="text-xs sm:text-sm font-bold text-[#16160F] hover:text-[#1B4332] transition-colors truncate"
                          >
                            {partnerName}
                          </Link>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E4EEE8] text-[#1B4332]">
                            Active
                          </span>
                        </div>

                        {/* Skill Exchange Row */}
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#6B6858]">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#1B4332] bg-[#E4EEE8]/70 px-1.5 py-0.5 rounded text-[11px]">
                            <OfferedSkillIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[120px]">{partnerSkillName}</span>
                          </span>
                          <span className="text-[#6B6858]">↔</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#16160F] bg-[#F7F6F2] border border-[#E6E3DA] px-1.5 py-0.5 rounded text-[11px]">
                            <WantedSkillIcon className="w-3 h-3 shrink-0 text-amber-700" />
                            <span className="truncate max-w-[120px]">{mySkillName}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E3DA]/60">
                      <Link
                        to={`/swaps/${swapId}/chat`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1B4332] text-white hover:bg-[#153427] transition-colors shrink-0 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Chat →</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
