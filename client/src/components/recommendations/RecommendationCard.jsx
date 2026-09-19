import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Sparkles,
  ArrowLeftRight,
  CheckCircle2,
  User,
  ArrowRight,
  ChevronDown,
  Layers,
  BookOpen,
} from "lucide-react";
import { OfferedSkillIcon, WantedSkillIcon, MatchesIcon } from "../icons";

/**
 * Derives compatibility tier label and color styles based on score
 * @param {number} score - Compatibility score (0–100)
 * @returns {{ label: string, badgeBg: string, badgeText: string, barColor: string, iconColor: string }}
 */
const getCompatibilityTier = (score) => {
  if (score >= 80) {
    return {
      label: "Excellent Match",
      badgeBg: "bg-[#E4EEE8] dark:bg-[#1C2E24]",
      badgeText: "text-[#1B4332] dark:text-[#3FA873]",
      barColor: "bg-[#1B4332] dark:bg-[#3FA873]",
      iconColor: "text-[#1B4332] dark:text-[#3FA873]",
    };
  }
  if (score >= 60) {
    return {
      label: "Strong Match",
      badgeBg: "bg-[#E4EEE8] dark:bg-[#1C2E24]",
      badgeText: "text-[#1B4332] dark:text-[#3FA873]",
      barColor: "bg-[#3FA873]",
      iconColor: "text-[#3FA873]",
    };
  }
  if (score >= 30) {
    return {
      label: "Potential Match",
      badgeBg: "bg-[#F7F6F2] dark:bg-[#202520]",
      badgeText: "text-[#16160F] dark:text-[#F2F1EC]",
      barColor: "bg-[#6B6858] dark:bg-[#9C9A8C]",
      iconColor: "text-[#6B6858] dark:text-[#9C9A8C]",
    };
  }
  return {
    label: "Related Skills",
    badgeBg: "bg-[#F7F6F2] dark:bg-[#202520]",
    badgeText: "text-[#6B6858] dark:text-[#9C9A8C]",
    barColor: "bg-[#E6E3DA] dark:bg-[#2A2E29]",
    iconColor: "text-[#6B6858] dark:text-[#9C9A8C]",
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
      className={`bg-white dark:bg-[#181B18] border rounded-2xl overflow-hidden shadow-xs hover:border-[#1B4332]/40 dark:hover:border-[#3FA873]/50 motion-card-interactive flex flex-col justify-between ${
        mutualMatch
          ? "border-[#1B4332]/30 dark:border-[#3FA873]/30 ring-1 ring-[#1B4332]/10 dark:ring-[#3FA873]/20"
          : "border-[#E6E3DA] dark:border-[#2A2E29]"
      }`}
    >
      {/* Top Section */}
      <div>
        {/* Mutual Match Top Banner if two-way exchange */}
        {mutualMatch && (
          <div className="bg-[#E4EEE8] dark:bg-[#1C2E24] border-b border-[#1B4332]/15 dark:border-[#3FA873]/25 px-3.5 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#3FA873]" />
              <span className="text-[10.5px] font-bold text-[#1B4332] dark:text-[#3FA873] tracking-wider uppercase">
                Mutual Skill Match
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#1B4332]/80 dark:text-[#3FA873]/80">
              Two-way Exchange
            </span>
          </div>
        )}

        {/* User Identity Header */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            {/* Avatar & Name Info */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Link
                to={`/profile/${targetId}`}
                className="w-11 h-11 rounded-full bg-[#1B4332] dark:bg-[#1C2E24] text-white dark:text-[#3FA873] flex items-center justify-center font-bold text-sm overflow-hidden border border-[#E6E3DA] dark:border-[#2A2E29] shrink-0 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
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
                  className="text-sm font-bold text-[#16160F] dark:text-[#F2F1EC] hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors truncate block leading-tight"
                >
                  {user?.name || "SkillSwap Member"}
                </Link>

                {/* Location + Rating + Swaps meta row */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#6B6858] dark:text-[#9C9A8C] mt-1 truncate">
                  {user?.location && (
                    <>
                      <span className="truncate max-w-[90px] sm:max-w-[120px] flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 shrink-0 opacity-70" />
                        <span className="truncate">{user.location}</span>
                      </span>
                      <span className="text-[#E6E3DA] dark:text-[#2A2E29] shrink-0">•</span>
                    </>
                  )}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Star className="w-3 h-3 fill-[#B8860B] text-[#B8860B]" />
                    <span className="font-bold text-[#16160F] dark:text-[#F2F1EC]">
                      {user?.avgRating && user.avgRating > 0 ? user.avgRating.toFixed(1) : "New"}
                    </span>
                  </div>
                  <span className="text-[#E6E3DA] dark:text-[#2A2E29] shrink-0">•</span>
                  <span className="shrink-0 font-medium">{user?.completedSwaps || 0} swaps</span>
                </div>
              </div>
            </div>
          </div>

          {/* Match Score Box */}
          <div className="mt-3 p-2.5 rounded-xl bg-[#F7F6F2] dark:bg-[#121512] border border-[#E6E3DA] dark:border-[#2A2E29] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg ${tier.badgeBg} flex items-center justify-center shrink-0`}>
                  <MatchesIcon className={`w-3.5 h-3.5 ${tier.iconColor}`} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC]">{tier.label}</span>
                  <span className="text-[#6B6858] dark:text-[#9C9A8C] text-[11px] font-normal">•</span>
                  <span className="text-xs font-extrabold text-[#1B4332] dark:text-[#3FA873]">{compatibilityScore}% Match</span>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#E6E3DA]/60 dark:bg-[#2A2E29] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${tier.barColor}`}
                style={{ width: `${Math.min(100, Math.max(8, compatibilityScore))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E6E3DA] dark:border-[#2A2E29]" />

        {/* Skill Exchange Visualization Section */}
        <div className="p-4 pt-3 space-y-3">
          {/* They can teach you (Candidate Offers) */}
          {exactMatchesForYou.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#1B4332] dark:text-[#3FA873] uppercase tracking-wider mb-1.5">
                <OfferedSkillIcon className="w-3.5 h-3.5 shrink-0" />
                <span>They Can Teach You</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {exactMatchesForYou.map((skill, idx) => (
                  <span
                    key={skill.id || `foryou-${idx}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30 leading-snug"
                  >
                    <span className="font-semibold">{skill.name}</span>
                    {skill.level && (
                      <span className="text-[10px] opacity-75 font-normal">
                        ({skill.level})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* You can teach them (Candidate Wants to Learn) */}
          {exactMatchesForThem.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#16160F] dark:text-[#F2F1EC] uppercase tracking-wider mb-1.5">
                <WantedSkillIcon className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>You Can Teach Them</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {exactMatchesForThem.map((skill, idx) => (
                  <span
                    key={skill.id || `forthem-${idx}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F7F6F2] dark:bg-[#202520] text-[#16160F] dark:text-[#F2F1EC] border border-[#E6E3DA] dark:border-[#2A2E29] leading-snug"
                  >
                    <span className="font-semibold">{skill.name}</span>
                    {skill.level && (
                      <span className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] font-normal">
                        ({skill.level})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Categories (when no direct exact match in that area) */}
          {exactMatchesForYou.length === 0 && relatedCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#6B6858] dark:text-[#9C9A8C] uppercase tracking-wider mb-1.5">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Related Category Interests</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {relatedCategories.map((cat, idx) => (
                  <span
                    key={`cat-${idx}`}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F7F6F2] dark:bg-[#202520] text-[#6B6858] dark:text-[#9C9A8C] border border-[#E6E3DA] dark:border-[#2A2E29] leading-snug"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Match Reasons / Why This Match */}
          {reasons.length > 0 && (
            <div className="pt-2 border-t border-[#E6E3DA]/60 dark:border-[#2A2E29]">
              <div className="text-[10.5px] font-bold text-[#6B6858] dark:text-[#9C9A8C] uppercase tracking-wider mb-1.5">
                Why this match
              </div>
              <ul className="space-y-1.5 text-xs text-[#6B6858] dark:text-[#9C9A8C] leading-normal">
                {visibleReasons.map((reason, idx) => {
                  const isAiReason =
                    Array.isArray(recommendation.aiMatchReasons) &&
                    recommendation.aiMatchReasons.includes(reason);

                  return (
                    <li key={idx} className="flex items-start gap-2">
                      {isAiReason ? (
                        <Sparkles className="w-3.5 h-3.5 text-[#3FA873] shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3FA873] shrink-0 mt-0.5" />
                      )}
                      <span className={isAiReason ? "text-[#16160F] dark:text-[#F2F1EC] font-medium" : "text-[#16160F] dark:text-[#F2F1EC]"}>
                        {isAiReason && (
                          <span className="inline-block text-[9px] font-bold text-[#1B4332] dark:text-[#3FA873] tracking-wider uppercase mr-1.5 px-1.5 py-0.5 bg-[#E4EEE8] dark:bg-[#1C2E24] rounded-md border border-[#1B4332]/15 dark:border-[#3FA873]/25">
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
                  className="mt-1.5 text-xs font-bold text-[#1B4332] dark:text-[#3FA873] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>
                    {expandedReasons
                      ? "Show fewer reasons"
                      : `+${extraReasonsCount} more reason${extraReasonsCount > 1 ? "s" : ""}`}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
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
      <div className="p-3.5 pt-2.5 flex items-center gap-2.5 border-t border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18]">
        <Link
          to={`/profile/${targetId}`}
          className="flex-1 py-2 px-3 text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] bg-[#F7F6F2] dark:bg-[#202520] hover:bg-[#E6E3DA]/60 dark:hover:bg-[#2A2E29] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl text-center transition-colors flex items-center justify-center gap-1.5 motion-btn-interactive"
        >
          <User className="w-3.5 h-3.5 text-[#6B6858] dark:text-[#9C9A8C]" />
          <span>View Profile</span>
        </Link>

        {onRequestSwap && (
          <button
            type="button"
            onClick={() => onRequestSwap(user, firstLearnSkill)}
            className="flex-1 py-2 px-3 text-xs font-bold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#338d60] rounded-xl text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs motion-btn-interactive"
          >
            <span>Swap Skills</span>
            <ArrowRight className="w-3.5 h-3.5 text-white dark:text-[#0F1210]" />
          </button>
        )}
      </div>
    </div>
  );
}
