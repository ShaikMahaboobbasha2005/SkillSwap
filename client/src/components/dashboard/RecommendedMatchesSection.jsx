import { Link } from "react-router-dom";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { MatchesIcon, OfferedSkillIcon, WantedSkillIcon } from "../icons";

/**
 * Derives compatibility tier label and color styles based on score
 */
const getCompatibilityTier = (score) => {
  if (score >= 80) {
    return {
      label: "Excellent Match",
      badgeBg: "bg-[#E4EEE8] dark:bg-[#1C2E24]",
      badgeText: "text-[#1B4332] dark:text-[#3FA873]",
    };
  }
  if (score >= 60) {
    return {
      label: "Strong Match",
      badgeBg: "bg-[#E4EEE8] dark:bg-[#1C2E24]",
      badgeText: "text-[#1B4332] dark:text-[#3FA873]",
    };
  }
  if (score >= 30) {
    return {
      label: "Potential Match",
      badgeBg: "bg-[#F7F6F2] dark:bg-[#202520]",
      badgeText: "text-[#16160F] dark:text-[#F2F1EC]",
    };
  }
  return {
    label: "Related Skills",
    badgeBg: "bg-[#F7F6F2] dark:bg-[#202520]",
    badgeText: "text-[#6B6858] dark:text-[#9C9A8C]",
  };
};

/**
 * Safely extracts skill name from an exact match item (which is an object { id, name, category, level } or string)
 */
const getMatchSkillName = (skillItem, fallback = "") => {
  if (!skillItem) return fallback;
  if (typeof skillItem === "object") {
    return skillItem.name || skillItem.title || fallback;
  }
  if (typeof skillItem === "string") {
    return skillItem;
  }
  return fallback;
};

/**
 * RecommendedMatchesSection Component
 *
 * Displays a compact preview of personalized partner matches with exact match
 * compatibility scores, skills exchange details, and direct CTAs.
 */
export default function RecommendedMatchesSection({
  recommendations = [],
  loading = false,
}) {
  const safeRecommendations = Array.isArray(recommendations)
    ? recommendations.filter(Boolean)
    : [];

  return (
    <div className="bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E3DA] dark:border-[#2A2E29]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#E4EEE8] dark:bg-[#1C2E24] flex items-center justify-center text-[#1B4332] dark:text-[#3FA873]">
              <MatchesIcon className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#16160F] dark:text-[#F2F1EC] tracking-tight">
              Recommended Matches
            </h2>
          </div>
          <Link
            to="/recommendations"
            className="text-xs font-bold text-[#1B4332] dark:text-[#3FA873] hover:underline inline-flex items-center gap-1 transition-colors"
          >
            <span>View All Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Area */}
        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-20 bg-zinc-100 dark:bg-[#202520] animate-pulse rounded-xl" />
              ))}
            </div>
          ) : safeRecommendations.length === 0 ? (
            /* Empty State */
            <div className="py-8 text-center px-4 bg-[#F7F6F2] dark:bg-[#121512] border border-dashed border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] flex items-center justify-center mx-auto text-[#1B4332] dark:text-[#3FA873] mb-3">
                <MatchesIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#16160F] dark:text-[#F2F1EC]">
                No recommendations yet
              </h3>
              <p className="mt-1 text-xs text-[#6B6858] dark:text-[#9C9A8C] max-w-sm mx-auto">
                Add skills you offer and want to learn to get personalized partner matches.
              </p>
              <Link
                to="/profile"
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] hover:bg-[#153427] dark:hover:bg-[#338d60] transition-colors"
              >
                <span>Manage My Skills →</span>
              </Link>
            </div>
          ) : (
            /* Recommendations List */
            <div className="space-y-3">
              {safeRecommendations.slice(0, 3).map((rec, index) => {
                const partner = rec.user || {};
                const partnerId = partner._id || partner.id || `rec-${index}`;
                const partnerName = partner.name || "SkillSwap Member";
                const partnerAvatar = partner.profilePicture || "";
                const partnerLocation = partner.location || "";
                const score = typeof rec.compatibilityScore === "number" ? rec.compatibilityScore : 0;
                const tier = getCompatibilityTier(score);

                const matchDetails = rec.matchDetails || {};
                const canTeachSkills = Array.isArray(matchDetails.exactMatchesForYou)
                  ? matchDetails.exactMatchesForYou
                  : [];
                const wantsToLearnSkills = Array.isArray(matchDetails.exactMatchesForThem)
                  ? matchDetails.exactMatchesForThem
                  : [];

                const firstTeachName = getMatchSkillName(canTeachSkills[0], "");
                const firstWantName = getMatchSkillName(wantsToLearnSkills[0], "");

                const partnerRating = Number(partner.avgRating);
                const hasValidRating = !isNaN(partnerRating) && partnerRating > 0;

                return (
                  <div
                    key={partnerId}
                    className="p-3.5 sm:p-4 rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] bg-white dark:bg-[#181B18] hover:border-[#1B4332] dark:hover:border-[#3FA873] hover:bg-[#FDFCFB] dark:hover:bg-[#1C201C] transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* User info & Skills */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <Link to={partner._id || partner.id ? `/profile/${partner._id || partner.id}` : "#"} className="shrink-0">
                        {partnerAvatar ? (
                          <img
                            src={partnerAvatar}
                            alt={partnerName}
                            className="w-10 h-10 rounded-full object-cover border border-[#E6E3DA] dark:border-[#2A2E29]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] font-bold flex items-center justify-center text-sm border border-[#1B4332]/20 dark:border-[#3FA873]/30">
                            {partnerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={partner._id || partner.id ? `/profile/${partner._id || partner.id}` : "#"}
                            className="text-xs sm:text-sm font-bold text-[#16160F] dark:text-[#F2F1EC] hover:text-[#1B4332] dark:hover:text-[#3FA873] transition-colors truncate"
                          >
                            {partnerName}
                          </Link>
                          {hasValidRating && (
                            <div className="flex items-center gap-0.5 text-[11px] text-[#6B6858] dark:text-[#9C9A8C] shrink-0">
                              <Star className="w-3 h-3 fill-[#B8860B] text-[#B8860B]" />
                              <span className="font-semibold text-[#16160F] dark:text-[#F2F1EC]">
                                {partnerRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {partnerLocation && (
                            <div className="hidden sm:flex items-center gap-0.5 text-[11px] text-[#6B6858] dark:text-[#9C9A8C] truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{partnerLocation}</span>
                            </div>
                          )}
                        </div>

                        {/* Skill Match Flow */}
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#6B6858] dark:text-[#9C9A8C]">
                          {firstTeachName ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#1B4332] dark:text-[#3FA873] bg-[#E4EEE8]/80 dark:bg-[#1C2E24]/80 px-1.5 py-0.5 rounded text-[11px]">
                              <OfferedSkillIcon className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[120px]">Teaches {firstTeachName}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C]">Compatible Skills</span>
                          )}

                          {firstWantName && (
                            <>
                              <span className="text-[#6B6858] dark:text-[#9C9A8C]">↔</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[#16160F] dark:text-[#F2F1EC] bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] px-1.5 py-0.5 rounded text-[11px]">
                                <WantedSkillIcon className="w-3 h-3 shrink-0 text-amber-700 dark:text-amber-400" />
                                <span className="truncate max-w-[120px]">Wants {firstWantName}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Score & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E3DA]/60 dark:border-[#2A2E29]">
                      {/* Compatibility Badge */}
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${tier.badgeBg} ${tier.badgeText} border border-black/5 dark:border-white/10`}
                      >
                        <MatchesIcon className="w-3.5 h-3.5" />
                        <span>{score}% Match</span>
                      </div>

                      {/* CTA Button */}
                      <Link
                        to="/recommendations"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#1B4332] dark:text-[#3FA873] hover:bg-[#E4EEE8] dark:hover:bg-[#1C2E24] transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
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
