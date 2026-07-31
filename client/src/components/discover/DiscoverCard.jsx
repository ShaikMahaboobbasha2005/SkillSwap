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
  } = user;

  const targetId = userId || user._id;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isSelfCard = Boolean(currentUserId && targetId && String(currentUserId) === String(targetId));

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

            {offeringSkills.length > 0 ? (
              <div className="flex items-center flex-wrap gap-1.5">
                {offeringSkills.map((s) => (
                  <span
                    key={s.skillId || s.name}
                    className="px-2.5 py-1 text-xs font-semibold text-[#1B4332] bg-[#E4EEE8] border border-[#1B4332]/20 rounded-full inline-flex items-center gap-1"
                    title={s.level ? `Level: ${s.level}` : undefined}
                  >
                    <span>{s.name}</span>
                    {s.level && (
                      <span className="text-[10px] opacity-75 font-normal">
                        ({s.level})
                      </span>
                    )}
                  </span>
                ))}
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

            {learningSkills.length > 0 ? (
              <div className="flex items-center flex-wrap gap-1.5">
                {learningSkills.map((s) => (
                  <span
                    key={s.skillId || s.name}
                    className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 rounded-full"
                  >
                    {s.name}
                  </span>
                ))}
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
