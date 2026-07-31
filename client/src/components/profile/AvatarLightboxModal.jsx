import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User } from "lucide-react";

/**
 * AvatarLightboxModal Component
 *
 * Full-screen, fully-responsive image lightbox viewer for profile pictures.
 * Portaled to document.body with z-[9999] for bulletproof stack-level rendering.
 * Gracefully handles missing or broken image URLs with fallback letter avatars.
 * Supports click outside, Escape key handling, and background body scroll locking.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback to close modal
 * @param {string} [props.imageSrc] - URL of full-size profile picture
 * @param {string} [props.userName="User"] - User name for alt text & title
 */
export default function AvatarLightboxModal({
  isOpen,
  onClose,
  imageSrc,
  userName = "User",
}) {
  const [imageError, setImageError] = useState(false);

  // Reset image error state & log received prop whenever modal opens or imageSrc changes
  useEffect(() => {
    if (isOpen) {
      console.log("[AvatarLightboxModal] Received imageSrc:", imageSrc, "userName:", userName);
      setImageError(false);
    }
  }, [isOpen, imageSrc, userName]);

  // Handle Escape key & body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasValidImage = Boolean(
    imageSrc && typeof imageSrc === "string" && imageSrc.trim() !== "" && !imageError
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${userName}'s profile photo viewer`}
    >
      {/* Lightbox Container with max-height constraint */}
      <div
        className="relative max-w-2xl w-full max-h-[90vh] bg-[#16160F] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col shadow-2xl animate-slideDown overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Top Header Bar */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-bold text-white truncate">{userName}'s Profile Photo</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo viewer"
            className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Image Canvas (Viewport-constrained & fallback safe) */}
        <div className="flex-1 min-h-0 w-full rounded-xl bg-black/50 border border-white/5 flex items-center justify-center p-2 overflow-auto">
          {hasValidImage ? (
            <img
              src={imageSrc}
              alt={userName}
              onError={() => setImageError(true)}
              className="max-h-[70vh] max-w-full w-auto h-auto object-contain rounded-lg select-none shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-black text-6xl shadow-inner select-none my-6">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </div>

        {/* Fixed Footer Info */}
        <div className="text-center pt-3 shrink-0">
          <p className="text-xs text-white/60">
            Press <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 border border-white/20 rounded-md">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
