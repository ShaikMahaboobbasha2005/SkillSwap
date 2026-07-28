export default function ProfileCompletionCard({ profile, bio, skillsCount = { offered: 0, wanted: 0 } }) {
  if (!profile) return null;

  const items = [
    {
      id: "photo",
      label: "Photo",
      completed: Boolean(profile.profilePicture && profile.profilePicture.trim().length > 0),
    },
    {
      id: "bio",
      label: "Bio",
      completed: Boolean(bio && bio.trim().length > 0),
    },
    {
      id: "location",
      label: "Location",
      completed: Boolean(profile.location && profile.location.trim().length > 0),
    },
    {
      id: "offerSkills",
      label: "Offer Skills",
      completed: Boolean(skillsCount.offered > 0),
    },
    {
      id: "learnSkills",
      label: "Learn Skills",
      completed: Boolean(skillsCount.wanted > 0),
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-[#E6E3DA] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E4EEE8] text-[#1B4332] flex items-center justify-center font-bold text-sm">
            ✨
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#16160F]">Profile Completion</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold text-[#1B4332]">{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#F7F6F2] rounded-full h-2.5 overflow-hidden border border-[#E6E3DA] my-2.5">
        <div
          className="bg-[#1B4332] h-full rounded-full transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Encouraging Helper Text below progress bar */}
      <p className="text-[11px] font-medium text-[#6B6858] mb-3">
        {percentage === 100
          ? "✓ Profile 100% complete! Ready for top quality skill swap matches."
          : "Complete your skills to improve matching."}
      </p>

      {/* Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[#E6E3DA]/60">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              item.completed
                ? "bg-[#E4EEE8]/80 text-[#1B4332] border border-[#1B4332]/20"
                : "bg-[#F7F6F2] text-[#6B6858] border border-[#E6E3DA]"
            }`}
          >
            <span className="font-bold text-xs">
              {item.completed ? "✓" : "○"}
            </span>
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
