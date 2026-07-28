import { useState, useRef } from "react";
import ImageCropModal from "./ImageCropModal";
import { uploadProfilePicture, updateOwnProfile } from "../services/profileService";

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
  const fileInputRef = useRef(null);

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

      {/* Banner Image with Vignette Overlay */}
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
      <div className="absolute top-3 right-4 z-10 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-[#E6E3DA] text-[10px] font-bold text-[#1B4332] tracking-wider uppercase shadow-2xs">
        {badgeText}
      </div>

      {/* Owner Banner Hover Action Overlay */}
      {isOwner && !uploading && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-10 p-4 backdrop-blur-2xs">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-9 px-4 text-xs font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-xl border border-white/20 transition-all shadow-md active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Change Banner</span>
          </button>

          {bannerUrl && (
            <button
              type="button"
              onClick={handleRemoveBanner}
              className="h-9 px-3.5 text-xs font-semibold text-white bg-red-600/90 hover:bg-red-700 rounded-xl border border-white/20 transition-all shadow-md active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Remove</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
