import { useState, useEffect, useRef } from "react";
import Modal from "../Modal";
import ConfirmModal from "../ConfirmModal";
import {
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  SKILL_STATUS,
} from "../../constants/skillConstants";
import { OfferedSkillIcon, WantedSkillIcon } from "../icons";

export default function SkillModal({
  isOpen,
  initialData = null,
  type = "Offer",
  submitting = false,
  apiError = "",
  onSubmit,
  onCancel,
}) {
  const isEditing = Boolean(initialData && initialData._id);
  const fixedType = initialData?.type || type;
  const nameInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    category: SKILL_CATEGORIES[0],
    level: "Intermediate",
    description: "",
    yearsOfExperience: "",
    status: "Active",
  });

  const [error, setError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          category: initialData.category || SKILL_CATEGORIES[0],
          level: initialData.level || "Intermediate",
          description: initialData.description || "",
          yearsOfExperience:
            initialData.yearsOfExperience !== null && initialData.yearsOfExperience !== undefined
              ? String(initialData.yearsOfExperience)
              : "",
          status: initialData.status || "Active",
        });
      } else {
        setFormData({
          name: "",
          category: SKILL_CATEGORIES[0],
          level: "Intermediate",
          description: "",
          yearsOfExperience: "",
          status: "Active",
        });
      }
      setError(apiError || "");
      setShowCancelConfirm(false);
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 100);
    }
  }, [isOpen, initialData]);

  // Sync API error from parent & focus input
  useEffect(() => {
    if (apiError) {
      setError(apiError);
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 100);
    }
  }, [apiError]);

  if (!isOpen) return null;

  // Determine if user has entered unsaved changes
  const isDirty = Boolean(
    formData.name.trim().length > 0 ||
      formData.description.trim().length > 0 ||
      formData.category !== SKILL_CATEGORIES[0] ||
      formData.level !== "Intermediate" ||
      formData.yearsOfExperience !== ""
  );

  const handleCloseAttempt = () => {
    if (isDirty && !submitting) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Skill name is required.");
      nameInputRef.current?.focus();
      return;
    }
    if (formData.name.trim().length < 2) {
      setError("Skill name must be at least 2 characters.");
      nameInputRef.current?.focus();
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      level: formData.level,
      type: fixedType,
      description: formData.description.trim(),
      yearsOfExperience:
        formData.yearsOfExperience !== "" ? Number(formData.yearsOfExperience) : null,
      status: formData.status,
    };

    onSubmit(payload);
  };

  const modalTitle = isEditing
    ? fixedType === "Offer"
      ? "Edit Offered Skill"
      : "Edit Learning Skill"
    : fixedType === "Offer"
    ? "Add Offered Skill"
    : "Add Learning Skill";

  const modalSubtext = isEditing
    ? "Update proficiency, level, and description for this skill."
    : fixedType === "Offer"
    ? "Add a skill you offer to teach and mentor other community members."
    : "Add a skill you wish to learn from experienced community mentors.";

  return (
    <>
      <ConfirmModal
        isOpen={showCancelConfirm}
        title="Discard Unsaved Changes?"
        message="You have unsaved modifications in this skill form. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        onConfirm={() => {
          setShowCancelConfirm(false);
          onCancel();
        }}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        maxWidth="max-w-lg"
        showCloseButton={false}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E6E3DA] dark:border-[#2A2E29] flex items-center justify-between bg-[#F7F6F2] dark:bg-[#202520]">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base border shrink-0 ${
                fixedType === "Offer"
                  ? "bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border-[#1B4332]/20 dark:border-[#3FA873]/30"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
              }`}
            >
              {fixedType === "Offer" ? (
                <OfferedSkillIcon className="w-5 h-5 text-[#1B4332] dark:text-[#3FA873]" />
              ) : (
                <WantedSkillIcon className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#16160F] dark:text-[#F2F1EC]">{modalTitle}</h2>
              <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] mt-0.5">{modalSubtext}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseAttempt}
            disabled={submitting}
            className="text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] text-base font-bold transition-colors cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white dark:bg-[#181B18] overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs font-medium rounded-xl flex items-center justify-between animate-fadeIn shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="font-bold">⚠️</span>
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError("")} className="font-bold text-red-500 hover:text-red-700 cursor-pointer ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Skill Name */}
          <div>
            <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1">
              Skill Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              maxLength={60}
              value={formData.name}
              onChange={(e) => {
                setError("");
                setFormData({ ...formData, name: e.target.value });
              }}
              className={`w-full h-10 px-3.5 text-xs bg-[#F7F6F2] dark:bg-[#202520] border rounded-xl focus:outline-none text-[#16160F] dark:text-[#F2F1EC] transition-all ${
                error
                  ? "border-red-500 ring-2 ring-red-200 bg-red-50/20"
                  : "border-[#E6E3DA] dark:border-[#2A2E29] focus:border-[#1B4332] dark:focus:border-[#3FA873]"
              }`}
              placeholder={
                fixedType === "Offer"
                  ? "e.g. React.js, Python, UI/UX Design"
                  : "e.g. Spanish, Data Science, Guitar"
              }
            />
          </div>

          {/* Category & Level Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] text-[#16160F] dark:text-[#F2F1EC] transition-colors cursor-pointer"
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1">Proficiency Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] text-[#16160F] dark:text-[#F2F1EC] transition-colors cursor-pointer"
              >
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1">
              Years of Experience <span className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
              className="w-full h-10 px-3.5 text-xs bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] text-[#16160F] dark:text-[#F2F1EC] transition-colors"
              placeholder="e.g. 3"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1.5">Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "Active" })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  formData.status === "Active"
                    ? "border-[#1B4332] dark:border-[#3FA873] bg-[#E4EEE8]/40 dark:bg-[#1C2E24]/40 ring-1 ring-[#1B4332] dark:ring-[#3FA873]"
                    : "border-[#E6E3DA] dark:border-[#2A2E29] bg-[#F7F6F2] dark:bg-[#202520] hover:border-[#1B4332]/40 dark:hover:border-[#3FA873]/40"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  formData.status === "Active" ? "border-[#1B4332] dark:border-[#3FA873] bg-[#1B4332] dark:bg-[#3FA873]" : "border-[#6B6858] dark:border-[#9C9A8C]"
                }`}>
                  {formData.status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#0F1210]" />}
                </span>
                <div>
                  <div className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC]">Active</div>
                  <div className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] leading-tight mt-0.5">
                    Available for learning or teaching.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "Inactive" })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  formData.status === "Inactive"
                    ? "border-[#6B6858] dark:border-[#9C9A8C] bg-[#F7F6F2] dark:bg-[#202520] ring-1 ring-[#6B6858] dark:ring-[#9C9A8C]"
                    : "border-[#E6E3DA] dark:border-[#2A2E29] bg-[#F7F6F2] dark:bg-[#202520] hover:border-[#6B6858]/40 dark:hover:border-[#9C9A8C]/40"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  formData.status === "Inactive" ? "border-[#6B6858] dark:border-[#9C9A8C] bg-[#6B6858] dark:bg-[#9C9A8C]" : "border-[#6B6858] dark:border-[#9C9A8C]"
                }`}>
                  {formData.status === "Inactive" && <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#0F1210]" />}
                </span>
                <div>
                  <div className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC]">Inactive</div>
                  <div className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] leading-tight mt-0.5">
                    Hidden from the community until you're ready.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Description Textarea with Live Character Counter (Max 250) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC]">Description</label>
              <span
                className={`text-[11px] font-semibold ${
                  formData.description.length >= 230 ? "text-amber-600 dark:text-amber-400" : "text-[#6B6858] dark:text-[#9C9A8C]"
                }`}
              >
                {formData.description.length} / 250
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={250}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 text-xs bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] text-[#16160F] dark:text-[#F2F1EC] transition-colors resize-none"
              placeholder={
                fixedType === "Offer"
                  ? "Briefly describe your experience and what you can teach..."
                  : "Briefly describe what you hope to learn and master..."
              }
            />
          </div>

          {/* Modal Footer Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E6E3DA] dark:border-[#2A2E29]">
            <button
              type="button"
              onClick={handleCloseAttempt}
              disabled={submitting}
              className="h-10 px-4 text-xs font-semibold text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !formData.name.trim()}
              className={`h-10 px-6 text-xs font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                formData.name.trim() && !submitting
                  ? "bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#339162] text-white dark:text-[#0F1210] shadow-sm cursor-pointer"
                  : "bg-[#1B4332]/50 dark:bg-[#3FA873]/50 text-white/70 dark:text-[#0F1210]/70 cursor-not-allowed"
              }`}
            >
              {submitting && (
                <div className="w-3.5 h-3.5 border-2 border-white dark:border-[#0F1210] border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isEditing ? "Update Skill" : "Save Skill"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
