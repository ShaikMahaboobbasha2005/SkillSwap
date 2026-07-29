import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

let activeModalCount = 0;
let savedScrollY = 0;

export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-lg",
  showCloseButton = false,
  closeOnBackdrop = true,
  closeOnEsc = true,
  title = null,
  className = "",
}) {
  const isLockedRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      if (activeModalCount === 0) {
        savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.position = "fixed";
        document.body.style.top = `-${savedScrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      }
      activeModalCount += 1;
      isLockedRef.current = true;
    }

    return () => {
      if (isLockedRef.current) {
        activeModalCount -= 1;
        isLockedRef.current = false;
        if (activeModalCount <= 0) {
          activeModalCount = 0;
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.left = "";
          document.body.style.right = "";
          document.body.style.width = "";
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
          window.scrollTo(0, savedScrollY);
        }
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative bg-white border border-[#E6E3DA] rounded-2xl w-full ${maxWidth} overflow-hidden shadow-2xl animate-slideDown flex flex-col my-auto max-h-[90vh] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-5 py-3.5 border-b border-[#E6E3DA] flex items-center justify-between bg-[#F7F6F2] shrink-0">
            <h2 className="text-sm font-bold text-[#16160F]">{title}</h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-[#6B6858] hover:text-[#16160F] text-sm font-bold transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {showCloseButton && !title && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-10 text-[#6B6858] hover:text-[#16160F] text-sm font-bold transition-colors cursor-pointer w-7 h-7 rounded-full bg-[#F7F6F2] hover:bg-[#E4EEE8] flex items-center justify-center border border-[#E6E3DA]"
            aria-label="Close modal"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
