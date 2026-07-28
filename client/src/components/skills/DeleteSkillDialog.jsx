export default function DeleteSkillDialog({ isOpen, skill, isDeleting, onConfirm, onCancel }) {
  if (!isOpen || !skill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-[#E6E3DA] rounded-2xl max-w-sm w-full p-6 shadow-xl animate-slideDown flex flex-col space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-bold text-lg shrink-0">
            🗑️
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#16160F]">Delete Skill?</h3>
            <p className="text-xs text-[#6B6858] mt-0.5">
              Are you sure you want to delete <span className="font-bold text-[#16160F]">"{skill.name}"</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E6E3DA]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-3.5 py-2 text-xs font-semibold text-[#16160F] bg-[#F7F6F2] hover:bg-[#E4EEE8] border border-[#E6E3DA] rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            {isDeleting && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>Delete Skill</span>
          </button>
        </div>
      </div>
    </div>
  );
}
