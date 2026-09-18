import { useState, useEffect } from "react";
import Modal from "../Modal";
import { Tag, Loader2, AlertCircle } from "lucide-react";
import { updatePortfolioItem } from "../../services/portfolioService";
import { getOwnSkills } from "../../services/skillService";

/**
 * PortfolioEditModal Component
 *
 * Modal for editing an existing portfolio item's caption and linked skill.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Object} props.item - Portfolio item being edited
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onSuccess - Update success callback (receives updatedItem)
 */
export default function PortfolioEditModal({
  isOpen,
  item,
  onClose,
  onSuccess,
}) {
  const [caption, setCaption] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [userSkills, setUserSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load user's active skills and pre-fill form
  useEffect(() => {
    if (isOpen && item) {
      setCaption(item.caption || "");
      setSelectedSkillId(item.skill?._id || item.skill || "");
      setError("");
      setSaving(false);

      getOwnSkills()
        .then((res) => {
          if (res?.success && Array.isArray(res.data)) {
            setUserSkills(res.data.filter((s) => s.status === "Active"));
          }
        })
        .catch((err) => {
          console.warn("Failed to load skills for portfolio edit:", err?.message);
        });
    }
  }, [isOpen, item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item || saving) return;

    setSaving(true);
    setError("");

    try {
      const itemId = item._id || item.id;
      const res = await updatePortfolioItem(itemId, {
        caption: caption.trim(),
        skillId: selectedSkillId || null,
      });

      if (res?.success && res?.data) {
        onSuccess?.(res.data);
        onClose?.();
      }
    } catch (err) {
      console.error("Failed to update portfolio item:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update portfolio item. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  const isVideo = item.media?.type === "video";
  const thumbnailUrl = item.media?.thumbnailUrl || item.media?.url;

  return (
    <Modal
      isOpen={isOpen}
      onClose={saving ? undefined : onClose}
      maxWidth="max-w-md"
      title="Edit Portfolio Item"
      showCloseButton={!saving}
      closeOnBackdrop={!saving}
      closeOnEsc={!saving}
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Media Thumbnail Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29]">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-black shrink-0 border border-[#E6E3DA] dark:border-[#2A2E29]">
            <img
              src={thumbnailUrl}
              alt="Media thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] truncate">
              {isVideo ? "Video Media" : "Image Media"}
            </p>
            <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">
              Media content cannot be replaced. You can edit the caption and linked skill.
            </p>
          </div>
        </div>

        {/* Caption Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="edit-portfolio-caption" className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC]">
              Caption <span className="text-[#6B6858] dark:text-[#9C9A8C] font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] font-medium">
              {caption.length}/500
            </span>
          </div>
          <textarea
            id="edit-portfolio-caption"
            rows={3}
            maxLength={500}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={saving}
            placeholder="Describe your work, tools used, or project context..."
            className="w-full px-3.5 py-2.5 text-xs text-[#16160F] dark:text-[#F2F1EC] bg-white dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#3FA873] placeholder:text-[#6B6858]/60 dark:placeholder:text-[#9C9A8C]/60 resize-none transition-all disabled:opacity-50"
          />
        </div>

        {/* Skill Link Dropdown */}
        <div className="space-y-1">
          <label htmlFor="edit-portfolio-skill" className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-[#1B4332] dark:text-[#3FA873]" />
            <span>Link to Offered Skill <span className="text-[#6B6858] dark:text-[#9C9A8C] font-normal">(Optional)</span></span>
          </label>
          <select
            id="edit-portfolio-skill"
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            disabled={saving}
            className="w-full px-3.5 py-2.5 text-xs text-[#16160F] dark:text-[#F2F1EC] bg-white dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#3FA873] transition-all disabled:opacity-50 cursor-pointer"
          >
            <option value="">No linked skill</option>
            {userSkills.map((skill) => (
              <option key={skill._id} value={skill._id}>
                {skill.name} ({skill.type === "Offer" ? "Offering" : "Learning"}) &middot; {skill.level}
              </option>
            ))}
          </select>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E3DA] dark:border-[#2A2E29]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] bg-[#F7F6F2] dark:bg-[#202520] hover:bg-[#E4EEE8] dark:hover:bg-[#2A2E29] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#348C5E] rounded-xl transition-all active:scale-[0.98] shadow-2xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
