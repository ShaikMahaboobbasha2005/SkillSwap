export default function EmptyState({
  icon = "📚",
  title = "No skills added yet",
  description = "Show everyone what you're good at.",
  actionText = "Add Your First Skill",
  onAction,
}) {
  return (
    <div className="w-full text-center py-8 px-4 bg-[#F7F6F2] rounded-2xl border border-dashed border-[#E6E3DA] flex flex-col items-center justify-center space-y-2.5">
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#E6E3DA] shadow-2xs flex items-center justify-center text-3xl mb-1">
        {icon}
      </div>
      <p className="text-xs font-extrabold text-[#16160F]">{title}</p>
      {description && <p className="text-[11px] text-[#6B6858] max-w-xs">{description}</p>}
      {actionText && (
        <button
          onClick={onAction}
          className="mt-2.5 h-9 px-4.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-semibold rounded-xl transition-all shadow-2xs active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
