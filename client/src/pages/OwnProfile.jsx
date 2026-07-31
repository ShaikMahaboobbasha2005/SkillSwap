import { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getOwnProfile, updateOwnProfile, uploadProfilePicture } from "../services/profileService";
import Navbar from "../components/Navbar";
import ImageCropModal from "../components/ImageCropModal";
import ProfileBanner from "../components/ProfileBanner";
import ToastNotification from "../components/ToastNotification";
import ProfileSkeleton from "../components/ProfileSkeleton";
import CompactProfileStats from "../components/profile/CompactProfileStats";
import AvatarLightboxModal from "../components/profile/AvatarLightboxModal";
import ProfileCompletionCard from "../components/ProfileCompletionCard";
import ConfirmModal from "../components/ConfirmModal";
import SkillsSection from "../components/skills/SkillsSection";
import { Eye, Camera, Edit3, MapPin, Calendar } from "lucide-react";

export default function OwnProfile() {
  const { user: authUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Avatar contextual dropdown & Lightbox state
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [showAvatarLightbox, setShowAvatarLightbox] = useState(false);
  const avatarMenuRef = useRef(null);

  // Handle Click Outside & Escape key for Avatar Contextual Menu
  useEffect(() => {
    if (!avatarMenuOpen) return;

    const handleClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setAvatarMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [avatarMenuOpen]);

  // Skills Count tracking state for Stat cards & Completion card
  const [skillsMeta, setSkillsMeta] = useState({ total: 0, offered: 0, wanted: 0 });

  // Edit Mode state & Unsaved modal state
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
  });

  // Avatar Crop state
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [rawAvatarImageSrc, setRawAvatarImageSrc] = useState(null);
  const [showAvatarCropModal, setShowAvatarCropModal] = useState(false);
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);

  // Refs
  const avatarFileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const bioTextareaRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Auto-focus first input field when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isEditing]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOwnProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        const storedBio = localStorage.getItem(`skillswap_bio_${res.data._id}`) || "";
        setFormData({
          name: res.data.name || "",
          location: res.data.location || "",
          bio: storedBio,
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(err.response?.data?.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (isFormDirty) {
        setPendingAction(() => () => performCancelEdit());
        setShowConfirmModal(true);
        return;
      }
      performCancelEdit();
    } else {
      if (profile) {
        const storedBio = localStorage.getItem(`skillswap_bio_${profile._id}`) || "";
        setFormData({
          name: profile.name || "",
          location: profile.location || "",
          bio: storedBio,
        });
        setSelectedAvatarFile(null);
        setAvatarPreviewUrl("");
        setRawAvatarImageSrc(null);
        setError("");
      }
      setIsEditing(true);
    }
  };

  const performCancelEdit = () => {
    if (profile) {
      const storedBio = localStorage.getItem(`skillswap_bio_${profile._id}`) || "";
      setFormData({
        name: profile.name || "",
        location: profile.location || "",
        bio: storedBio,
      });
    }
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl("");
    setRawAvatarImageSrc(null);
    setShowAvatarCropModal(false);
    setError("");
    setIsEditing(false);
    setShowConfirmModal(false);
    showToast("Changes discarded", "info");
  };

  // Avatar file selection & crop
  const handleAvatarClick = () => {
    avatarFileInputRef.current?.click();
  };

  const processAvatarFile = (file) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError("Invalid file format. Allowed formats: JPG, PNG, WEBP");
      showToast("Upload failed: Invalid file format", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar file size exceeds 5 MB limit.");
      showToast("Upload failed: File exceeds 5MB", "error");
      return;
    }
    setError("");
    const objectUrl = URL.createObjectURL(file);
    setRawAvatarImageSrc(objectUrl);
    setShowAvatarCropModal(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    processAvatarFile(file);
    e.target.value = "";
  };

  const handleAvatarCropComplete = async (croppedFile, croppedPreviewUrl) => {
    setShowAvatarCropModal(false);
    setSelectedAvatarFile(croppedFile);
    setAvatarPreviewUrl(croppedPreviewUrl);

    // Instant Avatar Upload Workflow
    setUploadingAvatar(true);
    try {
      const uploadRes = await uploadProfilePicture(croppedFile);
      if (uploadRes.success && uploadRes.data?.url) {
        const imageUrl = uploadRes.data.url;
        const res = await updateOwnProfile({ profilePicture: imageUrl });
        if (res.success) {
          setProfile(res.data);
          updateUser(res.data);
          showToast("Profile photo updated successfully", "success");
        }
      } else {
        throw new Error(uploadRes.message || "Failed to upload photo");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      showToast(err.message || "Failed to update profile photo", "error");
      setAvatarPreviewUrl("");
    } finally {
      setUploadingAvatar(false);
      setRawAvatarImageSrc(null);
    }
  };

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= 160) {
      setFormData((prev) => ({ ...prev, bio: value }));
    }
    if (bioTextareaRef.current) {
      bioTextareaRef.current.style.height = "auto";
      bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight}px`;
    }
  };

  // Determine if form fields are modified
  const storedBio = profile ? localStorage.getItem(`skillswap_bio_${profile._id}`) || "" : "";
  const isNameModified = Boolean(profile && formData.name.trim() !== (profile.name || "").trim());
  const isLocationModified = Boolean(profile && formData.location.trim() !== (profile.location || "").trim());
  const isBioModified = Boolean(formData.bio.trim() !== storedBio.trim());

  const isFormDirty = isNameModified || isLocationModified || isBioModified;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormDirty || saving) return;

    setSaving(true);
    setError("");

    try {
      const updatedData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
      };

      const res = await updateOwnProfile(updatedData);

      if (res.success) {
        if (profile?._id) {
          localStorage.setItem(`skillswap_bio_${profile._id}`, formData.bio.trim());
        }
        setProfile(res.data);
        updateUser(res.data);
        setIsEditing(false);
        showToast("Profile updated successfully", "success");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to update profile";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleBackToHome = () => {
    if (isEditing && isFormDirty) {
      setPendingAction(() => () => navigate("/"));
      setShowConfirmModal(true);
    } else {
      navigate("/");
    }
  };

  // Skeleton Loading State
  if (loading) {
    return <ProfileSkeleton />;
  }

  const currentPicture =
    avatarPreviewUrl ||
    profile?.profilePicture ||
    profile?.avatar ||
    profile?.profilePhoto ||
    profile?.avatarUrl ||
    authUser?.profilePicture ||
    authUser?.avatar ||
    "";
  const usernameHandle = profile?.email ? `@${profile.email.split("@")[0]}` : "@swapper";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jan 2026";

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] antialiased flex flex-col animate-fadeIn">
      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast({ ...toast, show: false })} />

      {/* Unsaved Changes Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Discard Unsaved Changes?"
        message="You have unsaved modifications in your profile form. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        onConfirm={() => {
          setShowConfirmModal(false);
          if (pendingAction) pendingAction();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Avatar Crop Modal (1:1 Ratio) */}
      {showAvatarCropModal && rawAvatarImageSrc && (
        <ImageCropModal
          imageSrc={rawAvatarImageSrc}
          aspect={1}
          cropShape="round"
          title="Crop Profile Photo"
          onCropComplete={handleAvatarCropComplete}
          onCancel={() => {
            setShowAvatarCropModal(false);
            setRawAvatarImageSrc(null);
          }}
        />
      )}

      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-6">
        
        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center justify-between animate-fadeIn shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* PROFILE HEADER CARD WITH BANNER & HERO AVATAR */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
          
          {/* Profile Banner */}
          <ProfileBanner
            bannerUrl={profile?.profileBanner}
            isOwner={true}
            onBannerUpdated={(updatedUser) => setProfile(updatedUser)}
            showToast={showToast}
            badgeText="Member Profile"
          />

          <div className="p-6 sm:p-7 pt-0 relative">
            
            {/* Avatar & Header Action Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-20 sm:-mt-22 mb-4">
              
              {/* HERO AVATAR WITH CONTEXTUAL DROPDOWN */}
              <div className="relative shrink-0 z-20" ref={avatarMenuRef}>
                <div
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[5px] border-white bg-[#E4EEE8] flex items-center justify-center shadow-xl shadow-black/10 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.02]"
                  title="Click for profile photo options"
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={avatarMenuOpen}
                >
                  {currentPicture ? (
                    <img
                      src={currentPicture}
                      alt={profile?.name}
                      className="w-full h-full object-cover transition-opacity duration-300 select-none"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1B4332] text-white flex items-center justify-center font-black text-5xl select-none">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}

                  {/* Circular Upload Spinner */}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10">
                      <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[9px] font-semibold mt-1.5">Uploading...</span>
                    </div>
                  )}
                </div>

                {/* Contextual Dropdown Menu for Avatar */}
                {avatarMenuOpen && !uploadingAvatar && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white border border-[#E6E3DA] rounded-xl shadow-xl py-1.5 z-40 animate-fadeIn space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        console.log("[OwnProfile] Opening AvatarLightboxModal with imageSrc:", currentPicture);
                        setShowAvatarLightbox(true);
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-[#16160F] hover:bg-[#F7F6F2] hover:text-[#1B4332] transition-colors flex items-center gap-2 cursor-pointer text-left"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>View Profile Picture</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        avatarFileInputRef.current?.click();
                      }}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-[#16160F] hover:bg-[#F7F6F2] hover:text-[#1B4332] transition-colors flex items-center gap-2 cursor-pointer text-left"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>Change Profile Picture</span>
                    </button>
                  </div>
                )}
              </div>

              {/* EDIT PROFILE CTA BUTTON (ALIGNED ACROSS FROM HERO AVATAR) */}
              <div className="w-full sm:w-auto flex justify-center sm:justify-end shrink-0">
                {!isEditing ? (
                  <button
                    onClick={handleEditToggle}
                    className="w-full sm:w-auto h-10 px-5 text-xs font-bold text-[#16160F] hover:text-[#1B4332] bg-[#F7F6F2] hover:bg-[#E4EEE8] border border-[#E6E3DA] hover:border-[#1B4332]/40 rounded-xl transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-[#1B4332]" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    disabled={saving}
                    className="w-full sm:w-auto h-10 px-4 text-xs font-semibold text-[#6B6858] hover:text-[#16160F] bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Close Form
                  </button>
                )}
              </div>
            </div>

            {/* Hidden File Input for Avatar */}
            <input
              type="file"
              ref={avatarFileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />

            {/* PROFILE IDENTITY HEADER */}
            <div className="space-y-3 text-center sm:text-left">
              
              {/* Standalone Full Name & Handle */}
              <div className="space-y-0.5">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#16160F]">
                  {profile?.name}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-[#1B4332]">
                  {usernameHandle}
                </p>
              </div>

              {/* Metadata Line */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#6B6858] pt-0.5">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-[#1B4332]" />
                  <span>{profile?.location || "Location not set"}</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-[#6B6858]" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {/* INTEGRATED COMPACT STATISTICS SUMMARY BAR */}
              <CompactProfileStats
                rating={profile?.avgRating || 0.0}
                completedSwaps={profile?.completedSwaps || 0}
                totalSkills={skillsMeta.total}
                portfolioCount="0 items"
                className="mt-4"
              />

              {/* Read-Only Bio Presentation */}
              {!isEditing && (
                <div className="pt-2">
                  <p className="text-xs sm:text-sm text-[#16160F]/95 leading-relaxed font-normal max-w-2xl">
                    {formData.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself and describe your skill swap interests."}
                  </p>
                </div>
              )}
            </div>

            {/* EDIT MODE FORM (APPEARS BELOW HEADER IDENTITY) */}
            {isEditing && (
              <form onSubmit={handleSubmit} className="mt-6 pt-5 border-t border-[#E6E3DA] space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1B4332] uppercase tracking-wider">Edit Profile Information</span>
                  <span className="text-[11px] text-[#6B6858]">Highlighted fields have unsaved edits</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#16160F]">Full Name</label>
                      {isNameModified && (
                        <span className="text-[10px] font-semibold text-[#1B4332] bg-[#E4EEE8] px-2 py-0.5 rounded-full">Modified</span>
                      )}
                    </div>
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full h-10 px-3.5 text-xs bg-[#F7F6F2] border rounded-xl focus:outline-none focus:border-[#1B4332] text-[#16160F] transition-colors ${
                        isNameModified ? "border-[#1B4332] bg-[#E4EEE8]/30 font-medium" : "border-[#E6E3DA]"
                      }`}
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* Location Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#16160F]">Location (City, Country)</label>
                      {isLocationModified && (
                        <span className="text-[10px] font-semibold text-[#1B4332] bg-[#E4EEE8] px-2 py-0.5 rounded-full">Modified</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`w-full h-10 px-3.5 text-xs bg-[#F7F6F2] border rounded-xl focus:outline-none focus:border-[#1B4332] text-[#16160F] transition-colors ${
                        isLocationModified ? "border-[#1B4332] bg-[#E4EEE8]/30 font-medium" : "border-[#E6E3DA]"
                      }`}
                      placeholder="e.g. San Francisco, CA or Bangalore, IN"
                    />
                  </div>
                </div>

                {/* Bio Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#16160F]">Short Bio</label>
                    <div className="flex items-center gap-2">
                      {isBioModified && (
                        <span className="text-[10px] font-semibold text-[#1B4332] bg-[#E4EEE8] px-2 py-0.5 rounded-full">Modified</span>
                      )}
                      <span className={`text-[11px] font-semibold ${formData.bio.length >= 150 ? "text-amber-600" : "text-[#6B6858]"}`}>
                        {formData.bio.length} / 160
                      </span>
                    </div>
                  </div>
                  <textarea
                    ref={bioTextareaRef}
                    rows={3}
                    maxLength={160}
                    value={formData.bio}
                    onChange={handleBioChange}
                    className={`w-full p-3 text-xs bg-[#F7F6F2] border rounded-xl focus:outline-none focus:border-[#1B4332] text-[#16160F] transition-colors resize-none ${
                      isBioModified ? "border-[#1B4332] bg-[#E4EEE8]/30 font-medium" : "border-[#E6E3DA]"
                    }`}
                    placeholder="Tell other swappers about your experience, background, and learning goals..."
                  />
                </div>

                {/* Profile Photo Upload Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOverAvatar(true);
                  }}
                  onDragLeave={() => setIsDragOverAvatar(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverAvatar(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      processAvatarFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    isDragOverAvatar
                      ? "border-[#1B4332] bg-[#E4EEE8]/60"
                      : "border-[#E6E3DA] bg-[#F7F6F2] hover:border-[#1B4332]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E3DA] flex items-center justify-center text-[#1B4332] shrink-0 shadow-2xs">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#16160F]">Profile Photo</p>
                      <p className="text-[11px] text-[#6B6858]">Drag & drop or click to upload (PNG • JPG • WEBP • Max 5 MB)</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="h-8 px-3.5 text-xs font-semibold text-[#16160F] bg-white border border-[#E6E3DA] rounded-lg hover:bg-[#E4EEE8] hover:border-[#1B4332] transition-all cursor-pointer shadow-2xs shrink-0"
                  >
                    Select Photo
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    disabled={saving}
                    className="w-full sm:w-auto h-10 px-5 text-xs font-semibold text-[#6B6858] hover:text-[#16160F] bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!isFormDirty || saving}
                    className={`w-full sm:w-auto h-10 px-6 text-xs font-semibold text-white rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                      isFormDirty && !saving
                        ? "bg-[#1B4332] hover:bg-[#143326] shadow-sm hover:shadow-md cursor-pointer"
                        : "bg-[#1B4332]/50 cursor-not-allowed"
                    }`}
                  >
                    {saving && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* PROFILE COMPLETION CARD */}
        <ProfileCompletionCard
          profile={profile}
          bio={formData.bio}
          skillsCount={{ offered: skillsMeta.offered, wanted: skillsMeta.wanted }}
        />

        {/* PHASE 4: DEDICATED SKILLS MANAGEMENT SECTION */}
        <SkillsSection
          userId={profile?._id}
          isOwner={true}
          showToast={showToast}
          onSkillsCountChanged={(total) => {
            // Count offered & wanted skills dynamically
            setSkillsMeta((prev) => ({ ...prev, total }));
          }}
        />

        {/* PORTFOLIO PLACEHOLDER CARD */}
        <div className="bg-white rounded-2xl border border-[#E6E3DA] p-6 text-center shadow-xs hover:shadow-md transition-all">
          <div className="max-w-md mx-auto py-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E4EEE8] border border-[#1B4332]/20 flex items-center justify-center text-xl text-[#1B4332] mb-3 shadow-2xs">
              🎨
            </div>
            <h3 className="text-sm font-bold text-[#16160F]">Portfolio Grid</h3>
            <p className="text-xs text-[#6B6858] mt-1 max-w-sm">
              Showcase photos, project media, and proof of work demonstrating your skill expertise.
            </p>
            <div className="mt-4 px-4 py-1.5 bg-[#F7F6F2] border border-[#E6E3DA] text-[11px] font-bold text-[#1B4332] rounded-full tracking-wide inline-flex items-center gap-1.5 shadow-2xs">
              <span>✨</span>
              <span>Portfolio Grid — Coming Soon</span>
            </div>
          </div>
        </div>

      </main>

      {/* Profile Photo Lightbox Viewer Modal */}
      <AvatarLightboxModal
        isOpen={showAvatarLightbox}
        onClose={() => setShowAvatarLightbox(false)}
        imageSrc={currentPicture || profile?.profilePicture || ""}
        userName={profile?.name || "User"}
      />
    </div>
  );
}
