import { Play, Edit2, Trash2, Tag } from "lucide-react";

/**
 * PortfolioCard Component
 *
 * Renders a single square portfolio media thumbnail with hover overlay and action buttons.
 *
 * @param {Object} props
 * @param {Object} props.item - Portfolio item data
 * @param {boolean} [props.isOwner=false] - Whether current user is owner
 * @param {Function} props.onSelect - Triggered when card is clicked to open in Lightbox
 * @param {Function} [props.onEdit] - Triggered when edit button is clicked (owner only)
 * @param {Function} [props.onDelete] - Triggered when delete button is clicked (owner only)
 */
export default function PortfolioCard({
  item,
  isOwner = false,
  onSelect,
  onEdit,
  onDelete,
}) {
  if (!item || !item.media) return null;

  const isVideo = item.media.type === "video";
  const mediaUrl = item.media.url;
  const thumbnailUrl = item.media.thumbnailUrl || mediaUrl;
  const caption = item.caption || "";
  const skillName = item.skill?.name || "";

  return (
    <div
      className="group relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F7F6F2] border border-[#E6E3DA] hover:border-[#1B4332]/40 transition-all duration-300 shadow-xs cursor-pointer select-none"
      onClick={() => onSelect?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(item);
        }
      }}
      aria-label={`View ${isVideo ? "video" : "image"} portfolio item${caption ? `: ${caption}` : ""}`}
    >
      {/* Media Thumbnail */}
      {isVideo ? (
        <div className="w-full h-full relative">
          <img
            src={thumbnailUrl}
            alt={caption || "Portfolio video thumbnail"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Central Play Indicator Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:bg-[#1B4332]/90 transition-all">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        </div>
      ) : (
        <img
          src={mediaUrl}
          alt={caption || "Portfolio image"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      )}

      {/* Top badges bar (Skill tag + Video duration badge) */}
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

      {/* Hover Overlay with Caption snippet and Owner Action buttons */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3.5 z-20">
        {caption && (
          <p className="text-white text-xs font-medium line-clamp-2 mb-2 drop-shadow-xs">
            {caption}
          </p>
        )}

        {/* Owner Edit / Delete controls */}
        {isOwner && (
          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-white/20">
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
    </div>
  );
}
