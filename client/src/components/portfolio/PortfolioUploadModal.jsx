import { useState, useEffect, useRef } from "react";
import Modal from "../Modal";
import { UploadCloud, Image as ImageIcon, Film, X, Loader2, AlertCircle, Tag, Clock } from "lucide-react";
import { createPortfolioItem } from "../../services/portfolioService";
import { getOwnSkills } from "../../services/skillService";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_DURATION_SEC = 60; // 60s

const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_VIDEO_EXTS = [".mp4", ".webm"];

/**
 * PortfolioUploadModal Component
 *
 * Modal for configuring and validating portfolio uploads.
 * Dispatches an optimistic upload payload to the parent container.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onStartUpload - Callback invoked when upload begins
 * @param {number} [props.currentImageCount=0] - Current number of active portfolio images
 * @param {number} [props.currentVideoCount=0] - Current number of active portfolio videos
 * @param {boolean} [props.isUploadingActive=false] - Whether an upload is currently running
 */
export default function PortfolioUploadModal({
  isOpen,
  onClose,
  onStartUpload,
  currentImageCount = 0,
  currentVideoCount = 0,
  isUploadingActive = false,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaType, setMediaType] = useState("image"); // "image" | "video"
  const [videoDuration, setVideoDuration] = useState(null);
  const [caption, setCaption] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [userSkills, setUserSkills] = useState([]);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);
  const uploadStartedRef = useRef(false);

  // Fetch user's active skills for optional linking
  useEffect(() => {
    if (isOpen) {
      uploadStartedRef.current = false;
      getOwnSkills()
        .then((res) => {
          if (res?.success && Array.isArray(res.data)) {
            setUserSkills(res.data.filter((s) => s.status === "Active"));
          }
        })
        .catch((err) => {
          console.warn("Failed to load skills for portfolio upload:", err?.message);
        });
    }
  }, [isOpen]);

  // Reset form on modal open/close (revokes object URL only if upload was NOT initiated)
  useEffect(() => {
    if (!isOpen) {
      if (!uploadStartedRef.current && previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl("");
      setMediaType("image");
      setVideoDuration(null);
      setCaption("");
      setSelectedSkillId("");
      setError("");
      uploadStartedRef.current = false;
    }
  }, [isOpen]);

  const handleFileValidationAndSet = (file) => {
    setError("");
    if (!file) return;

    const ext = "." + file.name.split(".").pop().toLowerCase();
    const mime = file.mimetype || file.type || "";

    const isImage = ALLOWED_IMAGE_EXTS.includes(ext) || mime.startsWith("image/");
    const isVideo = ALLOWED_VIDEO_EXTS.includes(ext) || mime.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Invalid file format. Please upload JPG, PNG, WEBP for images or MP4, WEBM for videos.");
      return;
    }

    const type = isVideo ? "video" : "image";

    // 1. Portfolio Count Limit Checks
    if (type === "image" && currentImageCount >= 20) {
      setError("You have reached the maximum limit of 20 portfolio images.");
      return;
    }

    if (type === "video" && currentVideoCount >= 10) {
      setError("You have reached the maximum limit of 10 portfolio videos.");
      return;
    }

    if (currentImageCount + currentVideoCount >= 30) {
      setError("You have reached the maximum limit of 30 total portfolio items.");
      return;
    }

    // 2. Size Checks
    if (type === "image" && file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Image size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    if (type === "video" && file.size > MAX_VIDEO_SIZE_BYTES) {
      setError(`Video size exceeds the 50 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    // 3. Create Preview and Read Video Duration
    // Revoke previous preview if changing file before submit
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setMediaType(type);

    if (type === "video") {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      tempVideo.onloadedmetadata = () => {
        const dur = tempVideo.duration;
        setVideoDuration(dur);
        if (dur > MAX_VIDEO_DURATION_SEC) {
          setError(`Video duration (${Math.round(dur)}s) exceeds the maximum limit of 60 seconds.`);
        }
      };
      tempVideo.onerror = () => {
        console.warn("Could not read video duration metadata before upload");
      };
      tempVideo.src = objectUrl;
    } else {
      setVideoDuration(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidationAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile || isUploadingActive) return;

    // Final checks
    if (mediaType === "video" && videoDuration && videoDuration > MAX_VIDEO_DURATION_SEC) {
      setError("Video duration cannot exceed 60 seconds.");
      return;
    }

    const formData = new FormData();
    formData.append("media", selectedFile);
    if (caption.trim()) {
      formData.append("caption", caption.trim());
    }
    if (selectedSkillId) {
      formData.append("skillId", selectedSkillId);
    }

    const selectedSkill = userSkills.find((s) => s._id === selectedSkillId) || null;

    uploadStartedRef.current = true;

    onStartUpload?.({
      selectedFile,
      previewUrl,
      mediaType,
      videoDuration,
      caption: caption.trim(),
      selectedSkillId,
      skill: selectedSkill,
      formData,
    });

    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title="Upload to Portfolio"
      showCloseButton={true}
      closeOnBackdrop={true}
      closeOnEsc={true}
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Media Dropzone / Preview */}
        {!selectedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
              isDragOver
                ? "border-[#1B4332] dark:border-[#3FA873] bg-[#E4EEE8]/40 dark:bg-[#1C2E24]/40"
                : "border-[#E6E3DA] dark:border-[#2A2E29] bg-[#F7F6F2] dark:bg-[#202520] hover:border-[#1B4332]/50 dark:hover:border-[#3FA873]/50 hover:bg-[#E4EEE8]/20 dark:hover:bg-[#1C2E24]/20"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileValidationAndSet(e.target.files[0]);
                }
              }}
              accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30 flex items-center justify-center shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-[#16160F] dark:text-[#F2F1EC]">
                Drag and drop your media here, or <span className="text-[#1B4332] dark:text-[#3FA873] underline">browse</span>
              </p>
              <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C] mt-1">
                Images (JPG, PNG, WEBP ≤ 10MB) &middot; Videos (MP4, WEBM ≤ 50MB, max 60s)
              </p>
            </div>

            {/* Limits Info Pills */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C]">
                Images: {currentImageCount}/20
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C]">
                Videos: {currentVideoCount}/10
              </span>
            </div>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-[#E6E3DA] dark:border-[#2A2E29] bg-black aspect-video max-h-56 flex items-center justify-center group">
            {mediaType === "video" ? (
              <video
                src={previewUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-full h-full object-contain"
              />
            )}

            {/* Remove File Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl("");
                setError("");
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
              title="Change File"
              aria-label="Remove selected file"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Media Type & Duration Tag */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 pointer-events-none">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs shadow-2xs inline-flex items-center gap-1">
                {mediaType === "video" ? (
                  <>
                    <Film className="w-3 h-3 text-emerald-400" />
                    <span>Video {videoDuration ? `(${Math.round(videoDuration)}s)` : ""}</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3 text-emerald-400" />
                    <span>Image ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                  </>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Optional Caption Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="portfolio-caption" className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC]">
              Caption <span className="text-[#6B6858] dark:text-[#9C9A8C] font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] font-medium">
              {caption.length}/500
            </span>
          </div>
          <textarea
            id="portfolio-caption"
            rows={3}
            maxLength={500}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Describe your work, tools used, or project context..."
            className="w-full px-3.5 py-2.5 text-xs text-[#16160F] dark:text-[#F2F1EC] bg-white dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#3FA873] placeholder:text-[#6B6858]/60 dark:placeholder:text-[#9C9A8C]/60 resize-none transition-all"
          />
        </div>

        {/* Optional Skill Link Dropdown */}
        <div className="space-y-1">
          <label htmlFor="portfolio-skill" className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-[#1B4332] dark:text-[#3FA873]" />
            <span>Link to Offered Skill <span className="text-[#6B6858] dark:text-[#9C9A8C] font-normal">(Optional)</span></span>
          </label>
          <select
            id="portfolio-skill"
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs text-[#16160F] dark:text-[#F2F1EC] bg-white dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-none focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#3FA873] transition-all cursor-pointer"
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
            className="px-4 py-2 text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] bg-[#F7F6F2] dark:bg-[#202520] hover:bg-[#E4EEE8] dark:hover:bg-[#2A2E29] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              !selectedFile ||
              isUploadingActive ||
              (mediaType === "video" && videoDuration > MAX_VIDEO_DURATION_SEC)
            }
            className="px-5 py-2 text-xs font-bold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#348C5E] rounded-xl transition-all active:scale-[0.98] shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            {isUploadingActive ? (
              <span>Upload in progress...</span>
            ) : (
              <span>Upload Media</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
