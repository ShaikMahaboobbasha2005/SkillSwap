import { useState, useEffect, useMemo } from "react";
import Modal from "../Modal";
import ToastNotification from "../ToastNotification";
import { getOwnSkills, getUserActiveSkills } from "../../services/skillService";
import swapService from "../../services/swapService";
import useAuth from "../../hooks/useAuth";
import { useSwap } from "../../context/SwapContext";
import { Sparkles, GraduationCap, ArrowRight, UserCheck, AlertCircle, ChevronDown } from "lucide-react";

/**
 * SwapRequestModal Component
 *
 * Allows a logged-in user to send a skill swap request to a target user.
 * Allows selecting any active offered skill belonging to the target user.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback to close modal
 * @param {Object} props.targetUser - Recipient user profile object
 * @param {Object|string} [props.targetSkill] - Optional pre-selected target skill object or skill ID
 * @param {Array} [props.currentUserOfferedSkills] - Optional pre-loaded offered skills of current user
 * @param {Function} [props.onSuccess] - Callback triggered after swap request is successfully created
 */
export default function SwapRequestModal({
  isOpen,
  onClose,
  targetUser,
  targetSkill,
  currentUserOfferedSkills,
  onSuccess,
}) {
  const { user: currentUser } = useAuth();
  const { refreshStats } = useSwap();

  const [ownSkills, setOwnSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [fetchedTargetOfferedSkills, setFetchedTargetOfferedSkills] = useState([]);
  const [loadingTargetSkills, setLoadingTargetSkills] = useState(false);
  const [offeredSkillId, setOfferedSkillId] = useState("");
  const [wantedSkillId, setWantedSkillId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  // Normalize target user ID (supports both _id and userId keys)
  const targetUserId = targetUser?._id || targetUser?.userId;
  const targetName = targetUser?.name || "User";
  const targetAvatar = targetUser?.avatar || targetUser?.profilePicture;
  const targetLocation = targetUser?.location || "";

  // Self request check
  const currentUserId = currentUser?._id || currentUser?.id;
  const isSelfRequest = Boolean(
    currentUserId && targetUserId && String(currentUserId) === String(targetUserId)
  );

  // Normalize target skills offered by targetUser (supports Discover pre-grouped, embedded user skills, or dynamically fetched)
  const targetOfferedSkills = useMemo(() => {
    let rawList = [];
    if (fetchedTargetOfferedSkills.length > 0) {
      rawList = [...fetchedTargetOfferedSkills];
    } else if (targetUser?.offeringSkills && targetUser.offeringSkills.length > 0) {
      rawList = [...targetUser.offeringSkills];
    } else if (targetUser?.skills && targetUser.skills.length > 0) {
      rawList = targetUser.skills.filter(
        (s) => (s.type === "Offer" || !s.type) && (s.status === "Active" || !s.status)
      );
    }

    // Ensure targetSkill object is included in list if passed as an object and not already in list
    if (typeof targetSkill === "object" && targetSkill !== null) {
      const targetSkillId = targetSkill._id || targetSkill.skillId || targetSkill.id;
      if (targetSkillId) {
        const alreadyPresent = rawList.some(
          (s) => String(s._id || s.skillId || s.id) === String(targetSkillId)
        );
        if (!alreadyPresent && targetSkill.type !== "Want") {
          rawList = [targetSkill, ...rawList];
        }
      }
    }

    return rawList.filter(
      (s) => (s.type === "Offer" || !s.type) && (s.status === "Active" || !s.status)
    );
  }, [targetUser, targetSkill, fetchedTargetOfferedSkills]);

  // Determine normalized target skill object to display for current wantedSkillId
  const selectedTargetSkill = useMemo(() => {
    if (!wantedSkillId && targetOfferedSkills.length > 0) {
      return targetOfferedSkills[0];
    }
    return (
      targetOfferedSkills.find(
        (s) => String(s._id || s.skillId || s.id) === String(wantedSkillId)
      ) ||
      (typeof targetSkill === "object" && targetSkill !== null ? targetSkill : null) ||
      targetOfferedSkills[0] ||
      null
    );
  }, [wantedSkillId, targetOfferedSkills, targetSkill]);

  useEffect(() => {
    if (!isOpen || !targetUserId) return;

    // Reset state on modal open to prevent stale state
    setOwnSkills([]);
    setOfferedSkillId("");
    setFetchedTargetOfferedSkills([]);
    setMessage("");
    setSubmitting(false);
    setToast({ show: false, type: "", message: "" });

    // Determine initial wanted skill ID from props
    let initialWantedId = "";
    if (typeof targetSkill === "object" && targetSkill !== null) {
      initialWantedId = targetSkill._id || targetSkill.skillId || targetSkill.id || "";
    } else if (typeof targetSkill === "string") {
      initialWantedId = targetSkill;
    }

    if (initialWantedId) {
      setWantedSkillId(initialWantedId);
    }

    // Always fetch target user's active offered skills to ensure complete list is available in modal
    setLoadingTargetSkills(true);
    getUserActiveSkills(targetUserId)
      .then((res) => {
        const rawSkills = res.data || res.skills || [];
        const activeOffered = rawSkills
          .filter((s) => (s.type === "Offer" || !s.type) && (s.status === "Active" || !s.status))
          .map((s) => ({
            skillId: s._id || s.skillId || s.id,
            _id: s._id || s.skillId || s.id,
            name: s.name,
            category: s.category,
            level: s.level,
            description: s.description,
            type: "Offer",
            status: "Active",
          }));

        // Merge with preloaded offeringSkills if any
        if (targetUser?.offeringSkills && Array.isArray(targetUser.offeringSkills)) {
          targetUser.offeringSkills.forEach((ps) => {
            const pId = ps._id || ps.skillId || ps.id;
            if (pId && !activeOffered.some((s) => String(s._id || s.skillId) === String(pId))) {
              activeOffered.push(ps);
            }
          });
        }

        // Include targetSkill if it was passed as object
        if (typeof targetSkill === "object" && targetSkill !== null) {
          const tId = targetSkill._id || targetSkill.skillId || targetSkill.id;
          if (tId && !activeOffered.some((s) => String(s._id || s.skillId) === String(tId))) {
            activeOffered.unshift(targetSkill);
          }
        }

        setFetchedTargetOfferedSkills(activeOffered);

        if (initialWantedId) {
          setWantedSkillId(initialWantedId);
        } else if (activeOffered.length > 0) {
          const firstId = activeOffered[0]._id || activeOffered[0].skillId;
          setWantedSkillId(firstId);
        }
      })
      .catch((err) => {
        console.error("Failed to load target user active skills:", err);
      })
      .finally(() => {
        setLoadingTargetSkills(false);
      });

    // Load fresh offered skills for current authenticated user
    if (Array.isArray(currentUserOfferedSkills) && currentUserOfferedSkills.length > 0) {
      const activeOffered = currentUserOfferedSkills.filter(
        (s) => (s.type === "Offer" || !s.type) && (s.status === "Active" || !s.status)
      );
      setOwnSkills(activeOffered);
      if (activeOffered.length > 0) {
        setOfferedSkillId(activeOffered[0]._id || activeOffered[0].skillId || "");
      }
    } else {
      fetchUserOfferedSkills();
    }
  }, [isOpen, targetUser, targetSkill, targetUserId]);

  const fetchUserOfferedSkills = async () => {
    setLoadingSkills(true);
    try {
      const res = await getOwnSkills();
      const skillsList = res.data || res.skills || [];
      const activeOffered = skillsList.filter(
        (s) => (s.type === "Offer" || !s.type) && (s.status === "Active" || !s.status)
      );
      setOwnSkills(activeOffered);
      if (activeOffered.length > 0) {
        setOfferedSkillId(activeOffered[0]._id || activeOffered[0].skillId || "");
      } else {
        setOfferedSkillId("");
      }
    } catch (err) {
      console.error("Failed to load user offered skills:", err);
      setToast({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Failed to load your offered skills.",
      });
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSelfRequest) {
      setToast({
        show: true,
        type: "error",
        message: "You cannot send a swap request to yourself.",
      });
      return;
    }
    if (!offeredSkillId || !wantedSkillId || submitting) return;

    setSubmitting(true);
    setToast({ show: false, type: "", message: "" });

    try {
      const payload = {
        toUser: targetUserId,
        offeredSkill: offeredSkillId,
        wantedSkill: wantedSkillId,
        message: message.trim(),
      };

      const res = await swapService.createSwap(payload);

      setToast({
        show: true,
        type: "sent",
        message: "Swap request sent successfully!",
      });

      refreshStats();

      if (onSuccess) {
        onSuccess(res.data);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed to create swap request:", err);
      const status = err.response?.status;
      const rawMsg = err.response?.data?.message || err.message || "";

      let userFriendlyMsg = "Failed to send swap request. Please try again.";

      if (
        status === 409 ||
        rawMsg.toLowerCase().includes("already exists") ||
        rawMsg.toLowerCase().includes("active") ||
        rawMsg.toLowerCase().includes("pending") ||
        rawMsg.toLowerCase().includes("duplicate")
      ) {
        userFriendlyMsg = rawMsg || "You already have an active or pending swap request for these skills.";
      } else if (
        status === 400 &&
        (rawMsg.toLowerCase().includes("yourself") || rawMsg.toLowerCase().includes("self"))
      ) {
        userFriendlyMsg = "You cannot send a swap request to yourself.";
      } else if (rawMsg) {
        userFriendlyMsg = rawMsg;
      }

      setToast({
        show: true,
        type: "error",
        message: userFriendlyMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isSendDisabled = isSelfRequest || !offeredSkillId || !wantedSkillId || submitting || ownSkills.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Skill Swap"
      showCloseButton={true}
      maxWidth="max-w-lg"
    >
      {/* Toast Notification Container */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast({ show: false, type: "", message: "" })}
        showCloseButton={true}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-[#16160F]">
        {/* Scrollable Modal Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Self-request warning banner */}
          {isSelfRequest && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>You cannot send a swap request to yourself.</span>
            </div>
          )}

          {/* Recipient User Header Summary Card */}
          <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white font-bold text-sm flex items-center justify-center border border-white shadow-xs shrink-0 overflow-hidden">
                {targetAvatar ? (
                  <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
                ) : (
                  targetName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#6B6858] uppercase tracking-wider">Sending Request To</p>
                <h3 className="text-sm font-extrabold text-[#16160F] truncate">{targetName}</h3>
                {targetLocation && <p className="text-[11px] text-[#6B6858] truncate">{targetLocation}</p>}
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-[#1B4332] shrink-0" />
          </div>

          {/* Section 1: Requested Skill */}
          <div className="space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#16160F]">
                I'm Requesting
              </label>
              <span className="text-[11px] text-[#6B6858]">
                {targetName} is offering {targetOfferedSkills.length > 1 ? "these skills" : "this skill"}.
              </span>
            </div>

            {loadingTargetSkills ? (
              <div className="h-10 bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl animate-pulse flex items-center px-3 text-xs text-[#6B6858]">
                Loading {targetName}'s offered skills...
              </div>
            ) : targetOfferedSkills.length > 0 ? (
              <div className="space-y-1.5">
                {targetOfferedSkills.length > 1 ? (
                  <div className="relative group">
                    <select
                      value={wantedSkillId}
                      onChange={(e) => setWantedSkillId(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 text-xs font-bold bg-[#E4EEE8]/70 hover:bg-[#E4EEE8] border border-[#1B4332]/30 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] rounded-xl transition-all appearance-none cursor-pointer text-[#1B4332]"
                    >
                      {targetOfferedSkills.map((skill) => {
                        const sId = skill._id || skill.skillId || skill.id;
                        const skillName = skill.name;
                        const levelStr = skill.level ? ` (${skill.level})` : "";
                        const catStr = skill.category ? ` • ${skill.category}` : "";
                        return (
                          <option key={sId} value={sId} className="bg-white text-[#16160F] font-medium py-1">
                            {skillName}{levelStr}{catStr}
                          </option>
                        );
                      })}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#1B4332]">
                      <GraduationCap className="w-4 h-4" />
                    </div>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#1B4332]">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#E4EEE8]/60 border border-[#1B4332]/20 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <GraduationCap className="w-4 h-4 text-[#1B4332] shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-[#1B4332] block truncate">
                          {selectedTargetSkill?.name}
                        </span>
                        {selectedTargetSkill?.category && (
                          <span className="text-[11px] text-[#6B6858] block truncate">
                            Category: {selectedTargetSkill.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedTargetSkill?.level && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#1B4332] text-white rounded-full shrink-0">
                        {selectedTargetSkill.level}
                      </span>
                    )}
                  </div>
                )}

                {/* Sub-card metadata preview if multiple skills */}
                {targetOfferedSkills.length > 1 && selectedTargetSkill && (
                  <div className="px-3 py-1.5 bg-[#F7F6F2] border border-[#E6E3DA] rounded-lg flex items-center justify-between text-[11px]">
                    <span className="text-[#6B6858]">
                      {selectedTargetSkill.category ? `Category: ${selectedTargetSkill.category}` : "Offered Skill"}
                    </span>
                    {selectedTargetSkill.level && (
                      <span className="font-bold text-[#1B4332] uppercase">
                        {selectedTargetSkill.level}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Target user currently has no active skills available for swapping.</span>
              </div>
            )}
          </div>

          {/* Visual Exchange Connector */}
          <div className="flex items-center justify-center py-1">
            <div className="w-8 h-8 rounded-full bg-[#E4EEE8] border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332]">
              <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-90" />
            </div>
          </div>

          {/* Section 2: Offered Skill */}
          <div className="space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#16160F]">
                I'll Offer <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-[#6B6858]">
                Choose one of your skills to exchange.
              </span>
            </div>

            {loadingSkills ? (
              <div className="h-10 bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl animate-pulse flex items-center px-3 text-xs text-[#6B6858]">
                Loading your offered skills...
              </div>
            ) : ownSkills.length > 0 ? (
              <select
                value={offeredSkillId}
                onChange={(e) => setOfferedSkillId(e.target.value)}
                required
                className="w-full h-10 px-3 text-xs font-medium bg-white border border-[#E6E3DA] rounded-xl focus:outline-hidden focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-colors"
              >
                {ownSkills.map((skill) => {
                  const sId = skill._id || skill.skillId || skill.id;
                  return (
                    <option key={sId} value={sId}>
                      {skill.name} {skill.level ? `(${skill.level})` : ""}
                    </option>
                  );
                })}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>No active skills to offer</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  You must add at least one active offered skill to your profile before sending a swap request.
                </p>
              </div>
            )}
          </div>

          {/* Optional Request Message */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#16160F]">
                Message <span className="text-[#6B6858] font-normal text-[11px] lowercase">(optional)</span>
              </label>
              <span className="text-[10px] text-[#6B6858]">{message.length}/500</span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${targetName}, I'd love to swap my skill for your ${selectedTargetSkill?.name || "skill"}!`}
              className="w-full p-3 text-xs bg-white border border-[#E6E3DA] rounded-xl focus:outline-hidden focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-colors resize-none placeholder:text-[#6B6858]/60"
            />
          </div>
        </div>

        {/* Pinned Action Footer */}
        <div className="p-4 sm:px-5 py-3 border-t border-[#E6E3DA] bg-[#F7F6F2] flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-9 px-4 text-xs font-semibold text-[#6B6858] hover:text-[#16160F] hover:bg-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 border border-transparent hover:border-[#E6E3DA]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSendDisabled}
            className="h-9 px-4 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
