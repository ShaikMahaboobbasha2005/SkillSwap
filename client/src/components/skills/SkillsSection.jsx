import { useState, useEffect } from "react";
import SkillCard from "./SkillCard";
import SkillModal from "./SkillModal";
import DeleteSkillDialog from "./DeleteSkillDialog";
import EmptyState from "../EmptyState";
import {
  getOwnSkills,
  getUserPublicSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../../services/skillService";

export default function SkillsSection({
  userId,
  isOwner = false,
  showToast,
  onSkillsCountChanged,
}) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [modalType, setModalType] = useState("Offer");
  const [apiError, setApiError] = useState("");

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, [userId, isOwner]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      let res;
      if (isOwner) {
        res = await getOwnSkills();
      } else if (userId) {
        res = await getUserPublicSkills(userId);
      }

      if (res && res.success && Array.isArray(res.data)) {
        setSkills(res.data);
        if (onSkillsCountChanged) {
          onSkillsCountChanged(res.data.length);
        }
      }
    } catch (err) {
      console.error("Failed to load skills:", err);
      if (showToast) showToast("Failed to load skills", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (type = "Offer") => {
    setSelectedSkill(null);
    setModalType(type);
    setApiError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (skill) => {
    setSelectedSkill(skill);
    setModalType(skill.type);
    setApiError("");
    setShowModal(true);
  };

  const handleOpenDeleteDialog = (skill) => {
    setSkillToDelete(skill);
    setShowDeleteDialog(true);
  };

  const handleModalSubmit = async (payload) => {
    setSubmitting(true);
    setApiError("");

    try {
      if (selectedSkill && selectedSkill._id) {
        // Update Skill
        const res = await updateSkill(selectedSkill._id, payload);
        if (res.success && res.data) {
          setSkills((prev) =>
            prev.map((s) => (s._id === res.data._id ? res.data : s))
          );
          if (showToast) showToast("Skill updated successfully", "success");
          setShowModal(false);
          setSelectedSkill(null);
        }
      } else {
        // Create Skill
        const res = await createSkill(payload);
        if (res.success && res.data) {
          setSkills((prev) => [res.data, ...prev]);
          if (showToast) showToast("Skill added successfully", "success");
          if (onSkillsCountChanged) {
            onSkillsCountChanged(skills.length + 1);
          }
          setShowModal(false);
          setSelectedSkill(null);
        }
      }
    } catch (err) {
      console.error("Error saving skill:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to save skill";
      
      // 1. Display Toast Notification
      if (showToast) showToast(errMsg, "error");
      
      // 2. Set API error state to highlight input & keep modal open with preserved form data
      setApiError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!skillToDelete || !skillToDelete._id) return;
    setDeleting(true);
    try {
      const res = await deleteSkill(skillToDelete._id);
      if (res.success) {
        setSkills((prev) => prev.filter((s) => s._id !== skillToDelete._id));
        if (showToast) showToast("Skill deleted successfully", "info");
        if (onSkillsCountChanged) {
          onSkillsCountChanged(Math.max(0, skills.length - 1));
        }
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
      if (showToast) showToast("Failed to delete skill", "error");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setSkillToDelete(null);
    }
  };

  const offeredSkills = skills.filter((s) => s.type === "Offer");
  const wantedSkills = skills.filter((s) => s.type === "Learn");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E6E3DA] p-6 shadow-sm space-y-4">
            <div className="h-5 bg-[#E6E3DA] rounded-md w-32 animate-shimmer"></div>
            <div className="h-3 bg-[#E6E3DA] rounded-md w-48 animate-shimmer"></div>
            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="h-24 bg-[#E6E3DA]/60 rounded-2xl animate-shimmer"></div>
              <div className="h-24 bg-[#E6E3DA]/60 rounded-2xl animate-shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skill Modal for Create & Edit */}
      <SkillModal
        isOpen={showModal}
        initialData={selectedSkill}
        type={modalType}
        submitting={submitting}
        apiError={apiError}
        onSubmit={handleModalSubmit}
        onCancel={() => {
          setShowModal(false);
          setSelectedSkill(null);
          setApiError("");
        }}
      />

      {/* Delete Skill Confirmation Dialog */}
      <DeleteSkillDialog
        isOpen={showDeleteDialog}
        skill={skillToDelete}
        isDeleting={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSkillToDelete(null);
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SKILLS OFFERED SECTION */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332]"></span>
                <h2 className="text-sm font-extrabold text-[#16160F]">Skills Offered</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#1B4332] bg-[#E4EEE8] px-2.5 py-0.5 rounded-full border border-[#1B4332]/20">
                  {offeredSkills.length} {offeredSkills.length === 1 ? "Skill" : "Skills"}
                </span>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal("Offer")}
                    className="h-7 px-2.5 text-[11px] font-bold text-white bg-[#1B4332] hover:bg-[#143326] rounded-lg transition-all active:scale-[0.98] inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Add Offered Skill"
                  >
                    <span>+ Add</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#6B6858] mb-4">Skills available to teach and mentor other members</p>

            {offeredSkills.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 animate-fadeIn">
                {offeredSkills.map((skill) => (
                  <SkillCard
                    key={skill._id}
                    skill={skill}
                    isOwner={isOwner}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteDialog}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="📚"
                title="No Skills Offered Yet"
                description="Share what you know and help others learn."
                actionText={isOwner ? "Add Your First Skill" : ""}
                onAction={isOwner ? () => handleOpenAddModal("Offer") : undefined}
              />
            )}
          </div>
        </div>

        {/* SKILLS WANTED SECTION */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <h2 className="text-sm font-extrabold text-[#16160F]">Skills Wanted</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#16160F] bg-[#F7F6F2] px-2.5 py-0.5 rounded-full border border-[#E6E3DA]">
                  {wantedSkills.length} {wantedSkills.length === 1 ? "Skill" : "Skills"}
                </span>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal("Learn")}
                    className="h-7 px-2.5 text-[11px] font-bold text-white bg-[#1B4332] hover:bg-[#143326] rounded-lg transition-all active:scale-[0.98] inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Add Learning Skill"
                  >
                    <span>+ Add</span>
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#6B6858] mb-4">Skills looking to learn from community mentors</p>

            {wantedSkills.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 animate-fadeIn">
                {wantedSkills.map((skill) => (
                  <SkillCard
                    key={skill._id}
                    skill={skill}
                    isOwner={isOwner}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteDialog}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🎯"
                title="No Skills Wanted Yet"
                description="Tell the community what you want to learn."
                actionText={isOwner ? "Add Your First Skill" : ""}
                onAction={isOwner ? () => handleOpenAddModal("Learn") : undefined}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
