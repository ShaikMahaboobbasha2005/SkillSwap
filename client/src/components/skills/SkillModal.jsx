import { useState, useEffect, useRef } from "react";
import Modal from "../Modal";
import ConfirmModal from "../ConfirmModal";
import {
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  SKILL_STATUS,
} from "../../constants/skillConstants";

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
        <div className="px-6 py-4 border-b border-[#E6E3DA] flex items-center justify-between bg-[#F7F6F2]">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base border shrink-0 ${
                fixedType === "Offer"
                  ? "bg-[#E4EEE8] text-[#1B4332] border-[#1B4332]/20"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {fixedType === "Offer" ? "🎓" : "🎯"}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#16160F]">{modalTitle}</h2>
              <p className="text-[11px] text-[#6B6858] mt-0.5">{modalSubtext}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseAttempt}
            disabled={submitting}
            className="text-[#6B6858] hover:text-[#16160F] text-base font-bold transition-colors cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center justify-between animate-fadeIn shadow-2xs">
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
            <label className="block text-xs font-bold text-[#16160F] mb-1">
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
              className={`w-full h-10 px-3.5 text-xs bg-[#F7F6F2] border rounded-xl focus:outline-none text-[#16160F] transition-all ${
                error
                  ? "border-red-500 ring-2 ring-red-200 bg-red-50/20"
                  : "border-[#E6E3DA] focus:border-[#1B4332]"
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
              <label className="block text-xs font-bold text-[#16160F] mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl focus:outline-none focus:border-[#1B4332] text-[#16160F] transition-colors cursor-pointer"
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16160F] mb-1">Proficiency Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full h-10 px-3 text-xs bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl focus:outline-none focus:border-[#1B4332] text-[#16160F] transition-colors cursor-pointer"
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
            <label className="block text-xs font-bold text-[#16160F] mb-1">
              Years of Experience <span className="text-[10px] text-[#6B6858] font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
              className="w-full h-10 px-3.5 text-xs bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl focus:outline-none focus:border-[#1B4332] text-[#16160F] transition-colors"
              placeholder="e.g. 3"
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-bold text-[#16160F] mb-1.5">Status</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "Active" })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  formData.status === "Active"
                    ? "border-[#1B4332] bg-[#E4EEE8]/40 ring-1 ring-[#1B4332]"
                    : "border-[#E6E3DA] bg-[#F7F6F2] hover:border-[#1B4332]/40"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  formData.status === "Active" ? "border-[#1B4332] bg-[#1B4332]" : "border-[#6B6858]"
                }`}>
                  {formData.status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <div>
                  <div className="text-xs font-bold text-[#16160F]">Active</div>
                  <div className="text-[10px] text-[#6B6858] leading-tight mt-0.5">
                    Available for learning or teaching.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "Inactive" })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  formData.status === "Inactive"
                    ? "border-[#6B6858] bg-[#F7F6F2] ring-1 ring-[#6B6858]"
                    : "border-[#E6E3DA] bg-[#F7F6F2] hover:border-[#6B6858]/40"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  formData.status === "Inactive" ? "border-[#6B6858] bg-[#6B6858]" : "border-[#6B6858]"
                }`}>
                  {formData.status === "Inactive" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <div>
                  <div className="text-xs font-bold text-[#16160F]">Inactive</div>
                  <div className="text-[10px] text-[#6B6858] leading-tight mt-0.5">
                    Hidden from the community until you're ready.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Description Textarea with Live Character Counter (Max 250) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#16160F]">Description</label>
              <span
                className={`text-[11px] font-semibold ${
                  formData.description.length >= 230 ? "text-amber-600" : "text-[#6B6858]"
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
              className="w-full p-3 text-xs bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl focus:outline-none focus:border-[#1B4332] text-[#16160F] transition-colors resize-none"
              placeholder={
                fixedType === "Offer"
                  ? "Briefly describe your experience and what you can teach..."
                  : "Briefly describe what you hope to learn and master..."
              }
            />
          </div>

          {/* Modal Footer Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E6E3DA]">
            <button
              type="button"
              onClick={handleCloseAttempt}
              disabled={submitting}
              className="h-10 px-4 text-xs font-semibold text-[#6B6858] hover:text-[#16160F] bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !formData.name.trim()}
              className={`h-10 px-6 text-xs font-semibold text-white rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                formData.name.trim() && !submitting
                  ? "bg-[#1B4332] hover:bg-[#143326] shadow-sm cursor-pointer"
                  : "bg-[#1B4332]/50 cursor-not-allowed"
              }`}
            >
              {submitting && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isEditing ? "Update Skill" : "Save Skill"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
