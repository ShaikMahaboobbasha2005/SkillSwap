import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Handshake,
  Sparkles,
  GraduationCap,
  ArrowLeftRight,
  CheckCircle2,
  User,
  Send,
  ChevronDown,
  Layers,
} from "lucide-react";

/**
 * Derives compatibility tier label and color styles based on score
 * @param {number} score - Compatibility score (0–100)
 * @returns {{ label: string, badgeBg: string, badgeText: string, barColor: string }}
 */
const getCompatibilityTier = (score) => {
  if (score >= 80) {
    return {
      label: "Excellent Match",
      badgeBg: "bg-[#E4EEE8]",
      badgeText: "text-[#1B4332]",
      barColor: "bg-[#1B4332]",
    };
  }
  if (score >= 60) {
    return {
      label: "Strong Match",
      badgeBg: "bg-[#E4EEE8]",
      badgeText: "text-[#1B4332]",
      barColor: "bg-[#3FA873]",
    };
  }
  if (score >= 30) {
    return {
      label: "Potential Match",
      badgeBg: "bg-[#F7F6F2]",
      badgeText: "text-[#16160F]",
      barColor: "bg-[#6B6858]",
    };
  }
  return {
    label: "Related Skills",
    badgeBg: "bg-[#F7F6F2]",
    badgeText: "text-[#6B6858]",
    barColor: "bg-[#E6E3DA]",
  };
};

export default function RecommendationCard({ recommendation, onRequestSwap }) {
  const { user, compatibilityScore = 0, matchDetails = {}, reasons = [] } = recommendation;
  const {
    exactMatchesForYou = [],
    exactMatchesForThem = [],
    relatedMatches = [],
    mutualMatch = false,
  } = matchDetails;

  const [expandedReasons, setExpandedReasons] = useState(false);

  const tier = getCompatibilityTier(compatibilityScore);
  const targetId = user?._id || user?.id;
  const firstLearnSkill = exactMatchesForYou[0] || null;

  // Display up to 2 reasons by default, toggle the rest if more exist
  const visibleReasons = expandedReasons ? reasons : reasons.slice(0, 2);
  const extraReasonsCount = reasons.length - 2;

  // Unique related categories list
  const relatedCategories = Array.from(
    new Set((relatedMatches || []).map((r) => r.category).filter(Boolean))
  );

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:border-[#1B4332]/40 transition-all duration-200 flex flex-col justify-between ${
        mutualMatch ? "border-[#1B4332]/30 ring-1 ring-[#1B4332]/10" : "border-[#E6E3DA]"
      }`}
    >
      {/* Top Section */}
      <div>
        {/* Mutual Match Banner if two-way exchange */}
        {mutualMatch && (
          <div className="bg-[#E4EEE8] border-b border-[#1B4332]/15 px-3 py-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ArrowLeftRight className="w-3 h-3 text-[#1B4332]" />
              <span className="text-[10px] font-bold text-[#1B4332] tracking-wider uppercase">
                Mutual Skill Match
              </span>
            </div>
            <span className="text-[9.5px] font-semibold text-[#1B4332]/80">
              Two-way Exchange
            </span>
          </div>
        )}

        {/* User Identity Header */}
        <div className="p-3.5 sm:p-4 pb-2.5">
          <div className="flex items-start justify-between gap-2.5">
            {/* Avatar & Name Info */}
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <Link
                to={`/profile/${targetId}`}
                className="w-10 h-10 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm overflow-hidden border border-[#E6E3DA] shrink-0 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
                aria-label={`View ${user?.name || "User"}'s profile`}
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || "User Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/profile/${targetId}`}
                  className="text-xs sm:text-sm font-bold text-[#16160F] hover:text-[#1B4332] transition-colors truncate block leading-tight"
                >
                  {user?.name || "SkillSwap Member"}
                </Link>

                {/* Compact Location + Rating + Swaps meta row */}
                <div className="flex items-center gap-1.5 text-[10.5px] text-[#6B6858] mt-0.5 truncate">
                  {user?.location && (
                    <>
                      <span className="truncate max-w-[80px] sm:max-w-[110px]">
                        {user.location}
                      </span>
                      <span className="text-[#E6E3DA] shrink-0">•</span>
                    </>
                  )}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Star className="w-2.5 h-2.5 fill-[#B8860B] text-[#B8860B]" />
                    <span className="font-semibold text-[#16160F]">
                      {user?.avgRating && user.avgRating > 0 ? user.avgRating.toFixed(1) : "New"}
                    </span>
                  </div>
                  <span className="text-[#E6E3DA] shrink-0">•</span>
                  <span className="shrink-0">{user?.completedSwaps || 0} swaps</span>
                </div>
              </div>
            </div>

            {/* Compatibility Strength Score Pill */}
            <div className="flex flex-col items-end shrink-0">
              <div
                className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 ${tier.badgeBg} ${tier.badgeText}`}
              >
                <Sparkles className="w-2.5 h-2.5 shrink-0" />
                <span>{compatibilityScore}% Match</span>
              </div>
              <span className="text-[9.5px] font-semibold text-[#6B6858] mt-0.5">
                {tier.label}
              </span>
            </div>
          </div>

          {/* Compatibility Visual Progress Bar */}
          <div className="w-full bg-[#F7F6F2] h-1 rounded-full overflow-hidden mt-2.5 border border-[#E6E3DA]/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${tier.barColor}`}
              style={{ width: `${Math.min(100, Math.max(8, compatibilityScore))}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E6E3DA]" />

        {/* Skill Exchange Visualization Section */}
        <div className="p-3.5 sm:p-4 pt-2.5 space-y-2.5">
          {/* They can teach you */}
          {exactMatchesForYou.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#1B4332] uppercase tracking-wider mb-1">
                <GraduationCap className="w-3 h-3 shrink-0" />
                <span>They Can Teach You</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {exactMatchesForYou.map((skill, idx) => (
                  <span
                    key={skill.id || `foryou-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 leading-snug"
                  >
                    <span>{skill.name}</span>
                    {skill.level && (
                      <span className="text-[9.5px] opacity-75 font-normal">
                        ({skill.level})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* You can teach them */}
          {exactMatchesForThem.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#16160F] uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-[#3FA873] shrink-0" />
                <span>You Can Teach Them</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {exactMatchesForThem.map((skill, idx) => (
                  <span
                    key={skill.id || `forthem-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F7F6F2] text-[#16160F] border border-[#E6E3DA] leading-snug"
                  >
                    <span>{skill.name}</span>
                    {skill.level && (
                      <span className="text-[9.5px] text-[#6B6858] font-normal">
                        ({skill.level})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Categories (only when no exact match for you in that area) */}
          {exactMatchesForYou.length === 0 && relatedCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#6B6858] uppercase tracking-wider mb-1">
                <Layers className="w-3 h-3 shrink-0" />
                <span>Related Category Interests</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {relatedCategories.map((cat, idx) => (
                  <span
                    key={`cat-${idx}`}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F7F6F2] text-[#6B6858] border border-[#E6E3DA] leading-snug"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Match Reasons (Deterministic + AI) */}
          {reasons.length > 0 && (
            <div className="pt-1.5 border-t border-[#E6E3DA]/60">
              <ul className="space-y-1 text-[11px] text-[#6B6858] leading-tight">
                {visibleReasons.map((reason, idx) => {
                  const isAiReason =
                    Array.isArray(recommendation.aiMatchReasons) &&
                    recommendation.aiMatchReasons.includes(reason);

                  return (
                    <li key={idx} className="flex items-start gap-1.5">
                      {isAiReason ? (
                        <Sparkles className="w-3 h-3 text-[#3FA873] shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-[#3FA873] shrink-0 mt-0.5" />
                      )}
                      <span className={isAiReason ? "text-[#16160F]" : ""}>
                        {isAiReason && (
                          <span className="inline-block text-[9px] font-bold text-[#1B4332] tracking-wider uppercase mr-1 px-1 py-0.2 bg-[#E4EEE8] rounded border border-[#1B4332]/15">
                            AI
                          </span>
                        )}
                        {reason}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {extraReasonsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setExpandedReasons(!expandedReasons)}
                  className="mt-1 text-[10.5px] font-bold text-[#1B4332] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <span>
                    {expandedReasons
                      ? "Show fewer"
                      : `+${extraReasonsCount} more reason${extraReasonsCount > 1 ? "s" : ""}`}
                  </span>
                  <ChevronDown
                    className={`w-2.5 h-2.5 transition-transform ${
                      expandedReasons ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="px-3 sm:px-3.5 pb-3 sm:pb-3.5 pt-2 flex items-center gap-2 border-t border-[#E6E3DA] bg-white">
        <Link
          to={`/profile/${targetId}`}
          className="flex-1 py-1.5 px-2.5 text-xs font-semibold text-[#16160F] bg-[#F7F6F2] hover:bg-[#E6E3DA]/60 border border-[#E6E3DA] rounded-lg text-center transition-colors flex items-center justify-center gap-1"
        >
          <User className="w-3 h-3 text-[#6B6858]" />
          <span>View Profile</span>
        </Link>

        {onRequestSwap && (
          <button
            type="button"
            onClick={() => onRequestSwap(user, firstLearnSkill)}
            className="flex-1 py-1.5 px-2.5 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#143326] rounded-lg text-center transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
          >
            <Send className="w-3 h-3 text-white" />
            <span>Request Swap</span>
          </button>
        )}
      </div>
    </div>
  );
}

