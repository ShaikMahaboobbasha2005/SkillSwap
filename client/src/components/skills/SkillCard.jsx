import { CheckCircle2, EyeOff } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import LevelBadge from "./LevelBadge";

export default function SkillCard({ skill, isOwner = false, onEdit, onDelete }) {
  if (!skill) return null;

  const isInactive = skill.status === "Inactive";

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col justify-between shadow-xs transition-all duration-200 group relative ${
        isInactive && isOwner
          ? "bg-[#F7F6F2]/60 border-[#E6E3DA] opacity-85 hover:opacity-100 hover:border-[#6B6858]/40"
          : "bg-white border-[#E6E3DA] hover:shadow-md hover:-translate-y-0.5 hover:border-[#1B4332]/30"
      }`}
    >
      <div>
        {/* Header: Title & Owner Actions / Badges */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center flex-wrap gap-2 min-w-0">
            <h3 className="text-sm font-extrabold text-[#16160F] truncate tracking-tight">
              {skill.name}
            </h3>

            {/* Status Badge for Owner */}
            {isOwner && (
              isInactive ? (
                <span
                  className="shrink-0 text-[10px] font-semibold text-[#6B6858] bg-[#F7F6F2] px-2 py-0.5 rounded-full border border-[#E6E3DA] flex items-center gap-1"
                  title="Inactive skill (hidden from community)"
                >
                  <EyeOff className="w-3 h-3 text-[#6B6858]" />
                  <span>Inactive • Hidden from community</span>
                </span>
              ) : (
                <span
                  className="shrink-0 text-[10px] font-semibold text-[#1B4332] bg-[#E4EEE8] px-2 py-0.5 rounded-full border border-[#1B4332]/20 flex items-center gap-1"
                  title="Active skill (available to community)"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#1B4332]" />
                  <span>Active</span>
                </span>
              )
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit(skill)}
                aria-label={`Edit ${skill.name}`}
                className="w-7 h-7 rounded-lg text-[#6B6858] hover:text-[#1B4332] hover:bg-[#E4EEE8] flex items-center justify-center transition-colors cursor-pointer"
                title="Edit Skill"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onDelete(skill)}
                aria-label={`Delete ${skill.name}`}
                className="w-7 h-7 rounded-lg text-[#6B6858] hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Delete Skill"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CategoryBadge category={skill.category} />
          <LevelBadge level={skill.level} yearsOfExperience={skill.yearsOfExperience} />
        </div>

        {/* Description */}
        {skill.description && (
          <p className="text-xs text-[#6B6858] leading-relaxed line-clamp-3 font-normal">
            {skill.description}
          </p>
        )}
      </div>

      {/* Footer Timestamp / Tag */}
      <div className="mt-3 pt-2.5 border-t border-[#E6E3DA]/60 flex items-center justify-between text-[10px] text-[#6B6858]">
        <span className="font-semibold text-[#1B4332]/80">
          {skill.type === "Offer" ? "Available to Teach" : "Seeking to Learn"}
        </span>
      </div>
    </div>
  );
}
