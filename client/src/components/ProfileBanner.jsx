import { useState, useRef, useEffect } from "react";
import ImageCropModal from "./ImageCropModal";
import { uploadProfilePicture, updateOwnProfile } from "../services/profileService";
import { Camera, Image as ImageIcon, Trash2, ChevronDown } from "lucide-react";

export default function ProfileBanner({
  bannerUrl,
  isOwner = false,
  onBannerUpdated,
  showToast,
  badgeText = "Member Profile",
}) {
  const [uploading, setUploading] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Handle Click Outside & Escape key for Banner Contextual Menu
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        if (showToast) showToast("Invalid format. Allowed: JPG, PNG, WEBP", "error");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        if (showToast) showToast("Banner image must be under 8 MB", "error");
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setRawImageSrc(objectUrl);
      setShowCropModal(true);
    }
    e.target.value = "";
  };

  const handleCropComplete = async (croppedFile, previewUrl) => {
    setShowCropModal(false);
    setUploading(true);

    try {
      // 1. Upload immediately to Cloudinary
      const uploadRes = await uploadProfilePicture(croppedFile);
      if (!uploadRes.success || !uploadRes.data?.url) {
        throw new Error(uploadRes.message || "Failed to upload banner image");
      }

      const newBannerUrl = uploadRes.data.url;

      // 2. Save profile immediately
      const updateRes = await updateOwnProfile({ profileBanner: newBannerUrl });
      if (updateRes.success) {
        if (onBannerUpdated) onBannerUpdated(updateRes.data);
        if (showToast) showToast("Profile banner updated successfully", "success");
      }
    } catch (err) {
      console.error("Banner upload error:", err);
      if (showToast) showToast(err.message || "Failed to update banner", "error");
    } finally {
      setUploading(false);
      setRawImageSrc(null);
    }
  };

  const handleRemoveBanner = async () => {
    if (!bannerUrl) return;
    setUploading(true);
    setMenuOpen(false);
    try {
      const updateRes = await updateOwnProfile({ profileBanner: "" });
      if (updateRes.success) {
        if (onBannerUpdated) onBannerUpdated(updateRes.data);
        if (showToast) showToast("Banner removed", "info");
      }
    } catch (err) {
      console.error("Error removing banner:", err);
      if (showToast) showToast("Failed to remove banner", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-full h-36 sm:h-44 lg:h-48 rounded-t-2xl overflow-hidden group border-b border-[#E6E3DA]/60 bg-[#F7F6F2]">
      {/* Hidden File Input */}
      {isOwner && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
        />
      )}

      {/* Dynamic Crop Modal (3:1 Ratio) */}
      {showCropModal && rawImageSrc && (
        <ImageCropModal
          imageSrc={rawImageSrc}
          aspect={3}
          cropShape="rect"
          title="Crop Profile Banner (3:1 Ratio)"
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropModal(false);
            setRawImageSrc(null);
          }}
        />
      )}

      {/* Banner Image with Vignette Overlay (Stays behind avatar) */}
      {bannerUrl ? (
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-500 ease-out relative"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        >
          {/* Subtle Dark Vignette Overlay for Image Readability */}
          <div className="absolute inset-0 bg-black/15 bg-gradient-to-t from-black/25 via-transparent to-black/10"></div>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-[#1B4332]/20 via-[#E4EEE8]/70 to-[#F7F6F2] flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#1B4332_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
      )}

      {/* Uploading Spinner */}
      {uploading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 animate-fadeIn">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold mt-2">Uploading Banner...</span>
        </div>
      )}

      {/* Badge Indicator */}
      <div className="absolute top-3 left-4 sm:left-6 z-10 bg-white/85 backdrop-blur-xs px-3 py-1 rounded-full border border-[#E6E3DA] text-[10px] font-bold text-[#1B4332] tracking-wider uppercase shadow-2xs">
        {badgeText}
      </div>

      {/* Single Clean "Edit Banner" Trigger & Dropdown Menu */}
      {isOwner && !uploading && (
        <div className="absolute bottom-3 right-4 z-10" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Edit banner options"
            className="h-8 px-3 text-xs font-bold text-[#16160F] bg-white/90 hover:bg-white backdrop-blur-md border border-[#E6E3DA] rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>Edit Banner</span>
            <ChevronDown className={`w-3 h-3 text-[#6B6858] transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Contextual Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 bottom-10 w-44 bg-white border border-[#E6E3DA] rounded-xl shadow-xl py-1.5 z-30 animate-fadeIn space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full px-3.5 py-2 text-xs font-semibold text-[#16160F] hover:bg-[#F7F6F2] hover:text-[#1B4332] transition-colors flex items-center gap-2 cursor-pointer text-left"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>Change Banner</span>
              </button>

              {bannerUrl && (
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Remove Banner</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
