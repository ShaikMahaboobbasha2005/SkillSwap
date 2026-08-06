import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Handshake,
  GraduationCap,
  Target,
  Sparkles,
  UserCheck,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

export default function DiscoverCard({ user, onRequestSwap }) {
  const { user: currentUser } = useAuth();
  const {
    userId,
    name,
    avatar,
    banner,
    location,
    rating,
    completedSwaps,
    offeringSkills = [],
    learningSkills = [],
    matchedSkillIds = [],
  } = user;

  const targetId = userId || user._id;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isSelfCard = Boolean(currentUserId && targetId && String(currentUserId) === String(targetId));

  // Independent expansion state for offering and learning sections
  const [isOfferingExpanded, setIsOfferingExpanded] = useState(false);
  const [isLearningExpanded, setIsLearningExpanded] = useState(false);

  // Reset expansion state when user or search/filter match metadata changes
  useEffect(() => {
    setIsOfferingExpanded(false);
    setIsLearningExpanded(false);
  }, [targetId, matchedSkillIds]);

  // Set of matched skill IDs for fast lookup
  const matchedSet = useMemo(
    () => new Set((matchedSkillIds || []).map((id) => String(id))),
    [matchedSkillIds]
  );

  // Prioritize skills: matched skills first, remaining skills next
  const prioritizedOfferingSkills = useMemo(() => {
    if (!Array.isArray(offeringSkills)) return [];
    if (matchedSet.size === 0) return offeringSkills;
    const matched = [];
    const unmatched = [];
    offeringSkills.forEach((s) => {
      const sId = String(s.skillId || s._id || s.id);
      if (matchedSet.has(sId)) {
        matched.push(s);
      } else {
        unmatched.push(s);
      }
    });
    return [...matched, ...unmatched];
  }, [offeringSkills, matchedSet]);

  const prioritizedLearningSkills = useMemo(() => {
    if (!Array.isArray(learningSkills)) return [];
    if (matchedSet.size === 0) return learningSkills;
    const matched = [];
    const unmatched = [];
    learningSkills.forEach((s) => {
      const sId = String(s.skillId || s._id || s.id);
      if (matchedSet.has(sId)) {
        matched.push(s);
      } else {
        unmatched.push(s);
      }
    });
    return [...matched, ...unmatched];
  }, [learningSkills, matchedSet]);

  // Section visible chips and +N count calculation
  const totalOfferingCount = offeringSkills.length;
  const visibleOfferingSkills = isOfferingExpanded
    ? prioritizedOfferingSkills
    : prioritizedOfferingSkills.slice(0, 2);
  const extraOfferingCount = totalOfferingCount - 2;

  const totalLearningCount = learningSkills.length;
  const visibleLearningSkills = isLearningExpanded
    ? prioritizedLearningSkills
    : prioritizedLearningSkills.slice(0, 2);
  const extraLearningCount = totalLearningCount - 2;

  // Format Rating per Design.md rules (Gold color #B8860B strictly for ratings only)
  const renderRating = () => {
    if (!rating || rating === 0) {
      return (
        <span className="text-[11px] font-semibold text-[#6B6858]">
          No ratings yet
        </span>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <Star className="w-3.5 h-3.5 fill-[#B8860B] text-[#B8860B]" />
        <span className="text-xs font-bold text-[#16160F]">
          {Number(rating).toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <article
      className="bg-white border border-[#E6E3DA] rounded-2xl overflow-hidden shadow-xs hover:border-[#1B4332]/40 transition-all duration-300 flex flex-col justify-between group"
      aria-label={`Profile card for ${name}`}
    >
      <div>
        {/* Responsive Banner Header Area */}
        <div className="relative h-16 sm:h-20 bg-[#F7F6F2] overflow-hidden border-b border-[#E6E3DA]/60">
          {banner ? (
            <img
              src={banner}
              alt={`${name}'s banner`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#E4EEE8]/60 via-[#F7F6F2] to-[#E4EEE8]/40" />
          )}
        </div>

        {/* User Profile Header: Avatar, Name, Location, Rating */}
        <div className="px-5 pt-0 relative pb-3 border-b border-[#E6E3DA]/60">
          <div className="flex items-end justify-between -mt-5 sm:-mt-6 mb-2">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#1B4332] text-white font-bold text-sm sm:text-base flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : name ? (
                name.charAt(0).toUpperCase()
              ) : (
                "U"
              )}
            </div>

            {/* Rating & Completed Swaps Metadata */}
            <div className="flex items-center gap-3 mb-0.5">
              {renderRating()}
              <div className="flex items-center gap-1 text-[11px] font-medium text-[#6B6858]">
                <Handshake className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>{completedSwaps || 0} Swaps</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#16160F] group-hover:text-[#1B4332] transition-colors truncate">
              {name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-[#6B6858]">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{location || "Location not specified"}</span>
            </div>
          </div>
        </div>

        {/* Grouped Skills Sections */}
        <div className="p-5 space-y-4">
          {/* Offering Skills Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-[#1B4332]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#16160F]">
                Offering Skills
              </h4>
            </div>

            {totalOfferingCount > 0 ? (
              <div className="flex items-center flex-wrap gap-1.5">
                {visibleOfferingSkills.map((s) => {
                  const sId = String(s.skillId || s._id || s.id);
                  const isMatch = matchedSet.has(sId);
                  return (
                    <span
                      key={sId || s.name}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 transition-colors ${
                        isMatch
                          ? "text-[#1B4332] bg-[#E4EEE8] border border-[#1B4332]/60 font-bold shadow-2xs"
                          : "text-[#1B4332] bg-[#E4EEE8]/70 border border-[#1B4332]/20"
                      }`}
                      title={s.level ? `Level: ${s.level}` : undefined}
                    >
                      <span>{s.name}</span>
                      {s.level && (
                        <span className="text-[10px] opacity-75 font-normal">
                          ({s.level})
                        </span>
                      )}
                    </span>
                  );
                })}

                {!isOfferingExpanded && extraOfferingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsOfferingExpanded(true)}
                    className="px-2.5 py-1 text-xs font-bold text-[#1B4332] bg-white hover:bg-[#E4EEE8] border border-[#1B4332]/30 rounded-full transition-colors cursor-pointer shrink-0"
                    title="Click to view all offering skills"
                  >
                    +{extraOfferingCount} more
                  </button>
                )}

                {isOfferingExpanded && totalOfferingCount > 2 && (
                  <button
                    type="button"
                    onClick={() => setIsOfferingExpanded(false)}
                    className="px-2.5 py-1 text-xs font-bold text-[#6B6858] hover:text-[#16160F] bg-white hover:bg-[#F7F6F2] border border-[#E6E3DA] rounded-full transition-colors cursor-pointer shrink-0"
                  >
                    Show less
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#6B6858] italic">
                No skills specified to offer
              </p>
            )}
          </div>

          {/* Learning Skills Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-amber-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#16160F]">
                Learning Skills
              </h4>
            </div>

            {totalLearningCount > 0 ? (
              <div className="flex items-center flex-wrap gap-1.5">
                {visibleLearningSkills.map((s) => {
                  const sId = String(s.skillId || s._id || s.id);
                  const isMatch = matchedSet.has(sId);
                  return (
                    <span
                      key={sId || s.name}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
                        isMatch
                          ? "text-amber-950 bg-amber-100 border border-amber-400 font-bold shadow-2xs"
                          : "text-amber-900 bg-amber-50 border border-amber-200"
                      }`}
                    >
                      {s.name}
                    </span>
                  );
                })}

                {!isLearningExpanded && extraLearningCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsLearningExpanded(true)}
                    className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-white hover:bg-amber-50 border border-amber-300 rounded-full transition-colors cursor-pointer shrink-0"
                    title="Click to view all learning skills"
                  >
                    +{extraLearningCount} more
                  </button>
                )}

                {isLearningExpanded && totalLearningCount > 2 && (
                  <button
                    type="button"
                    onClick={() => setIsLearningExpanded(false)}
                    className="px-2.5 py-1 text-xs font-bold text-[#6B6858] hover:text-[#16160F] bg-white hover:bg-[#F7F6F2] border border-[#E6E3DA] rounded-full transition-colors cursor-pointer shrink-0"
                  >
                    Show less
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#6B6858] italic">
                No skills specified to learn
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Action Buttons */}
      <div className="px-5 pb-5 pt-0">
        <div className="flex items-center gap-2 pt-3 border-t border-[#E6E3DA]/60">
          <Link
            to={`/users/${userId}`}
            className="flex-1 h-9 text-xs font-semibold text-[#1B4332] bg-[#E4EEE8] hover:bg-[#1B4332] hover:text-white border border-[#1B4332]/20 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>View Profile</span>
          </Link>

          <button
            type="button"
            onClick={onRequestSwap && !isSelfCard ? () => onRequestSwap(user) : undefined}
            disabled={!onRequestSwap || isSelfCard}
            className="h-9 px-3.5 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] shadow-2xs shrink-0"
            title={
              isSelfCard
                ? "You cannot request a swap with yourself"
                : onRequestSwap
                ? "Request a skill swap"
                : "Skill swap request integration point"
            }
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Request Swap</span>
          </button>
        </div>
      </div>
    </article>
  );
}
