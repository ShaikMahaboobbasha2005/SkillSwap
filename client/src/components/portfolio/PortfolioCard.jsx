import { Play, Edit2, Trash2, Tag, AlertCircle, RefreshCw } from "lucide-react";
import { REACTION_CONFIG } from "./ReactionPicker";

const REACTION_LIST = Object.values(REACTION_CONFIG);

/**
 * PortfolioCard Component
 *
 * Renders a single square portfolio media thumbnail with hover overlay, action buttons,
 * optimistic upload progress / failure states, and minimal reaction indicator.
 * The full interactive reaction experience belongs inside PortfolioLightbox.
 *
 * @param {Object} props
 * @param {Object} props.item - Portfolio item data (supports temporary uploading items)
 * @param {boolean} [props.isOwner=false] - Whether current user is owner
 * @param {Function} props.onSelect - Triggered when card is clicked to open in Lightbox
 * @param {Function} [props.onEdit] - Triggered when edit button is clicked (owner only)
 * @param {Function} [props.onDelete] - Triggered when delete button is clicked (owner only)
 * @param {Function} [props.onRetry] - Triggered when retry is clicked on failed upload
 * @param {Function} [props.onRemoveTemp] - Triggered when remove is clicked on failed upload
 */
export default function PortfolioCard({
  item,
  isOwner = false,
  onSelect,
  onEdit,
  onDelete,
  onRetry,
  onRemoveTemp,
}) {
  if (!item || !item.media) return null;

  const isTemp = Boolean(item.isUploading || item.uploadStatus === "failed");
  const isVideo = item.media.type === "video";
  const mediaUrl = item.media.url;
  const thumbnailUrl = item.media.thumbnailUrl || mediaUrl;
  const caption = item.caption || "";
  const skillName = item.skill?.name || "";

  const reactionSummary = item.reactionSummary || {
    like: 0,
    impressive: 0,
    great_work: 0,
    creative: 0,
    total: 0,
  };

  const uploadProgress = typeof item.uploadProgress === "number" ? item.uploadProgress : 0;
  const isProcessing = item.uploadStatus === "processing" || (item.isUploading && uploadProgress >= 100);
  const isFailed = item.uploadStatus === "failed";
  const isUploading = item.isUploading && !isFailed;

  const handleCardClick = () => {
    if (isTemp) return;
    onSelect?.(item);
  };

  // Top active reaction types sorted by count
  const activeReactionTypes = REACTION_LIST.filter(
    (r) => (reactionSummary[r.type] || 0) > 0
  ).sort((a, b) => (reactionSummary[b.type] || 0) - (reactionSummary[a.type] || 0));

  const totalReactions = reactionSummary.total || 0;

  return (
    <div
      className={`group relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F7F6F2] border transition-all duration-300 shadow-xs select-none ${
        isTemp
          ? "border-[#1B4332]/30 cursor-default"
          : "border-[#E6E3DA] hover:border-[#1B4332]/40 cursor-pointer"
      }`}
      onClick={handleCardClick}
      role={isTemp ? "region" : "button"}
      tabIndex={isTemp ? -1 : 0}
      onKeyDown={(e) => {
        if (!isTemp && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect?.(item);
        }
      }}
      aria-label={
        isUploading
          ? `Uploading ${isVideo ? "video" : "image"}: ${uploadProgress}%`
          : isFailed
          ? `Upload failed for ${isVideo ? "video" : "image"}`
          : `View ${isVideo ? "video" : "image"} portfolio item${caption ? `: ${caption}` : ""}`
      }
    >
      {/* Media Thumbnail */}
      {isVideo ? (
        <div className="w-full h-full relative">
          <img
            src={thumbnailUrl}
            alt={caption || "Portfolio video thumbnail"}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isTemp ? "blur-[0.5px]" : "group-hover:scale-105"
            }`}
            loading="lazy"
          />
          {/* Central Play Indicator Badge (for non-uploading video) */}
          {!isTemp && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#1B4332]/90 transition-all">
                <Play className="w-5 h-5 fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <img
          src={mediaUrl}
          alt={caption || "Portfolio image"}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isTemp ? "blur-[0.5px]" : "group-hover:scale-105"
          }`}
          loading="lazy"
        />
      )}

      {/* Top badges bar (Skill tag + Video duration badge) */}
      {!isTemp && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none z-10">
          {skillName ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs shadow-2xs truncate max-w-[70%] inline-flex items-center gap-1">
              <Tag className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{skillName}</span>
            </span>
          ) : (
            <div />
          )}

          {isVideo && item.media.duration && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs shadow-2xs shrink-0">
              {Math.round(item.media.duration)}s
            </span>
          )}
        </div>
      )}

      {/* Persistent Minimal Reaction Indicator on Thumbnail (Visible when total reactions > 0) */}
      {!isTemp && totalReactions > 0 && (
        <div
          className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-black/75 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md pointer-events-none border border-white/10"
        >
          <span className="inline-flex items-center gap-0.5 text-xs">
            {activeReactionTypes.slice(0, 2).map((r) => (
              <span key={r.type}>{r.emoji}</span>
            ))}
          </span>
          <span className="text-[11px] font-extrabold text-white/90">
            {totalReactions}
          </span>
        </div>
      )}

      {/* OPTIMISTIC UPLOAD PROGRESS OVERLAY */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-30 select-none animate-fadeIn">
          {/* Circular Spinner */}
          <div className="w-8 h-8 rounded-full border-3 border-white/20 border-t-[#3FA873] animate-spin mb-2.5 shadow-sm" />

          {/* Status Text */}
          <p className="text-white text-xs font-bold tracking-tight drop-shadow-xs">
            {isProcessing
              ? isVideo
                ? "Processing video..."
                : "Processing media..."
              : `Uploading... ${uploadProgress}%`}
          </p>

          {/* Smooth Progress Bar */}
          <div className="w-full max-w-[82%] h-2 bg-white/20 rounded-full overflow-hidden mt-2.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isProcessing ? "w-full bg-[#3FA873] animate-pulse" : "bg-[#3FA873]"
              }`}
              style={{ width: isProcessing ? "100%" : `${Math.max(5, uploadProgress)}%` }}
            />
          </div>

          {caption && (
            <p className="text-white/80 text-[10px] font-medium line-clamp-1 mt-2 max-w-[85%]">
              {caption}
            </p>
          )}
        </div>
      )}

      {/* UPLOAD FAILED OVERLAY */}
      {isFailed && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center z-30 select-none animate-fadeIn space-y-2">
          <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shadow-xs">
            <AlertCircle className="w-4 h-4" />
          </div>

          <div>
            <p className="text-white text-xs font-bold">Upload failed</p>
            {item.errorMessage && (
              <p className="text-red-300 text-[10px] line-clamp-1 max-w-[90%] mt-0.5 font-medium" title={item.errorMessage}>
                {item.errorMessage}
              </p>
            )}
          </div>

          {/* Retry and Remove Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetry?.(item);
              }}
              className="px-3 py-1 bg-[#1B4332] hover:bg-[#143326] text-white text-[11px] font-bold rounded-lg transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer active:scale-95 border border-white/20"
              title="Retry Upload"
              aria-label="Retry upload"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveTemp?.(item);
              }}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold rounded-lg transition-all cursor-pointer active:scale-95"
              title="Remove Item"
              aria-label="Remove failed upload"
            >
              <span>Remove</span>
            </button>
          </div>
        </div>
      )}

      {/* Regular Hover Overlay with Caption snippet & Owner Action buttons */}
      {!isTemp && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 z-20">
          {/* Top Row: Owner controls if owner, else empty */}
          <div className="flex items-center justify-end gap-1">
            {isOwner && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(item);
                  }}
                  className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-[#16160F] hover:text-[#1B4332] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Edit Caption / Skill"
                  aria-label="Edit portfolio item"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(item);
                  }}
                  className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Delete Media"
                  aria-label="Delete portfolio item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Caption snippet */}
          {caption && (
            <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-xs">
              {caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
