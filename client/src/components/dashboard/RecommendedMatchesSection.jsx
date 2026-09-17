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
      badgeBg: "bg-[#E4EEE8]",
      badgeText: "text-[#1B4332]",
    };
  }
  if (score >= 60) {
    return {
      label: "Strong Match",
      badgeBg: "bg-[#E4EEE8]",
      badgeText: "text-[#1B4332]",
    };
  }
  if (score >= 30) {
    return {
      label: "Potential Match",
      badgeBg: "bg-[#F7F6F2]",
      badgeText: "text-[#16160F]",
    };
  }
  return {
    label: "Related Skills",
    badgeBg: "bg-[#F7F6F2]",
    badgeText: "text-[#6B6858]",
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
    <div className="bg-white border border-[#E6E3DA] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E3DA]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#E4EEE8] flex items-center justify-center text-[#1B4332]">
              <MatchesIcon className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#16160F] tracking-tight">
              Recommended Matches
            </h2>
          </div>
          <Link
            to="/recommendations"
            className="text-xs font-bold text-[#1B4332] hover:underline inline-flex items-center gap-1 transition-colors"
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
                <div key={n} className="h-20 bg-zinc-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : safeRecommendations.length === 0 ? (
            /* Empty State */
            <div className="py-8 text-center px-4 bg-[#F7F6F2] border border-dashed border-[#E6E3DA] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white border border-[#E6E3DA] flex items-center justify-center mx-auto text-[#1B4332] mb-3">
                <MatchesIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#16160F]">
                No recommendations yet
              </h3>
              <p className="mt-1 text-xs text-[#6B6858] max-w-sm mx-auto">
                Add skills you offer and want to learn to get personalized partner matches.
              </p>
              <Link
                to="/profile"
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1B4332] text-white hover:bg-[#153427] transition-colors"
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
                    className="p-3.5 sm:p-4 rounded-xl border border-[#E6E3DA] bg-white hover:border-[#1B4332] transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* User info & Skills */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <Link to={partner._id || partner.id ? `/profile/${partner._id || partner.id}` : "#"} className="shrink-0">
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
                            to={partner._id || partner.id ? `/profile/${partner._id || partner.id}` : "#"}
                            className="text-xs sm:text-sm font-bold text-[#16160F] hover:text-[#1B4332] transition-colors truncate"
                          >
                            {partnerName}
                          </Link>
                          {hasValidRating && (
                            <div className="flex items-center gap-0.5 text-[11px] text-[#6B6858] shrink-0">
                              <Star className="w-3 h-3 fill-[#B8860B] text-[#B8860B]" />
                              <span className="font-semibold text-[#16160F]">
                                {partnerRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {partnerLocation && (
                            <div className="hidden sm:flex items-center gap-0.5 text-[11px] text-[#6B6858] truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{partnerLocation}</span>
                            </div>
                          )}
                        </div>

                        {/* Skill Match Flow */}
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#6B6858]">
                          {firstTeachName ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#1B4332] bg-[#E4EEE8]/80 px-1.5 py-0.5 rounded text-[11px]">
                              <OfferedSkillIcon className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[120px]">Teaches {firstTeachName}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6B6858]">Compatible Skills</span>
                          )}

                          {firstWantName && (
                            <>
                              <span className="text-[#6B6858]">↔</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[#16160F] bg-[#F7F6F2] border border-[#E6E3DA] px-1.5 py-0.5 rounded text-[11px]">
                                <WantedSkillIcon className="w-3 h-3 shrink-0 text-amber-700" />
                                <span className="truncate max-w-[120px]">Wants {firstWantName}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Score & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6E3DA]/60">
                      {/* Compatibility Badge */}
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${tier.badgeBg} ${tier.badgeText} border border-black/5`}
                      >
                        <MatchesIcon className="w-3.5 h-3.5" />
                        <span>{score}% Match</span>
                      </div>

                      {/* CTA Button */}
                      <Link
                        to="/recommendations"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#1B4332] hover:bg-[#E4EEE8] transition-colors"
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
