import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderGit2, ArrowRight, Play, Tag, Plus } from "lucide-react";
import portfolioService from "../../services/portfolioService";
import PortfolioLightbox from "../portfolio/PortfolioLightbox";
import PortfolioReactionsModal from "../portfolio/PortfolioReactionsModal";
import PortfolioReportModal from "../portfolio/PortfolioReportModal";
import ToastNotification from "../ToastNotification";
import useAuth from "../../hooks/useAuth";

/**
 * PortfolioSection Component
 *
 * Compact portfolio preview section embedded in the Profile page.
 * Displays up to 3 recent media thumbnails with a "View all →" entry point.
 *
 * @param {Object} props
 * @param {string} [props.userId] - Target user ID (fetches portfolio if provided)
 * @param {boolean} [props.isOwner=false] - Whether current user is profile owner
 * @param {string} [props.userName="This member"] - Display name for public profile
 * @param {Array} [props.initialItems] - Optional initial portfolio items
 */
export default function PortfolioSection({
  userId,
  isOwner = false,
  userName = "This member",
  initialItems,
}) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [items, setItems] = useState(Array.isArray(initialItems) ? initialItems : []);
  const [loading, setLoading] = useState(!initialItems && Boolean(userId));
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [reactionsModalItem, setReactionsModalItem] = useState(null);
  const [reportModalItem, setReportModalItem] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const pendingReactionIdsRef = useRef(new Set());

  const fetchPreviewItems = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await portfolioService.getUserPortfolio(userId);
      const list = Array.isArray(res?.data?.portfolio)
        ? res.data.portfolio
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setItems(list);
    } catch (err) {
      console.warn("Failed to load profile portfolio preview:", err?.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!initialItems && userId) {
      fetchPreviewItems();
    }
  }, [userId, initialItems, fetchPreviewItems]);

  const handleToggleReaction = useCallback(
    async (targetItem, reactionType) => {
      if (!authUser) {
        return;
      }

      const itemId = targetItem._id || targetItem.id;
      if (!itemId) return;

      if (pendingReactionIdsRef.current.has(itemId)) return;
      pendingReactionIdsRef.current.add(itemId);

      const prevItem = items.find((i) => (i._id || i.id) === itemId);
      const prevReaction = prevItem?.currentUserReaction || null;
      const prevSummary = prevItem?.reactionSummary || {
        like: 0,
        impressive: 0,
        great_work: 0,
        creative: 0,
        total: 0,
      };

      const nextSummary = { ...prevSummary };
      let nextReaction = null;

      if (prevReaction === reactionType) {
        nextSummary[reactionType] = Math.max(0, (nextSummary[reactionType] || 0) - 1);
        nextSummary.total = Math.max(0, (nextSummary.total || 0) - 1);
        nextReaction = null;
      } else if (prevReaction) {
        nextSummary[prevReaction] = Math.max(0, (nextSummary[prevReaction] || 0) - 1);
        nextSummary[reactionType] = (nextSummary[reactionType] || 0) + 1;
        nextReaction = reactionType;
      } else {
        nextSummary[reactionType] = (nextSummary[reactionType] || 0) + 1;
        nextSummary.total = (nextSummary.total || 0) + 1;
        nextReaction = reactionType;
      }

      setItems((prev) =>
        prev.map((i) =>
          (i._id || i.id) === itemId
            ? { ...i, reactionSummary: nextSummary, currentUserReaction: nextReaction }
            : i
        )
      );

      try {
        const res = await portfolioService.togglePortfolioReaction(itemId, reactionType);
        if (res?.success && res?.data) {
          setItems((prev) =>
            prev.map((i) =>
              (i._id || i.id) === itemId
                ? {
                    ...i,
                    reactionSummary: res.data.reactionSummary,
                    currentUserReaction: res.data.currentUserReaction,
                  }
                : i
            )
          );
        }
      } catch (err) {
        console.error("Failed to toggle reaction in preview:", err);
        setItems((prev) =>
          prev.map((i) =>
            (i._id || i.id) === itemId
              ? { ...i, reactionSummary: prevSummary, currentUserReaction: prevReaction }
              : i
          )
        );
      } finally {
        pendingReactionIdsRef.current.delete(itemId);
      }
    },
    [authUser, items]
  );

  const targetPortfolioUrl = isOwner ? "/portfolio" : `/portfolio/user/${userId}`;
  const previewList = items.slice(0, 3);
  const totalCount = items.length;

  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleOpenReport = useCallback((item) => {
    if (!authUser) {
      setToast({
        show: true,
        message: "Please log in to report content.",
        type: "error",
      });
      return;
    }
    setReportModalItem(item);
  }, [authUser]);

  const handleReportSuccess = useCallback(() => {
    setToast({
      show: true,
      message: "Report submitted. Thank you for helping keep SkillSwap safe.",
      type: "success",
    });
    setReportModalItem(null);
  }, []);

  return (
    <section
      aria-label="Portfolio preview"
      className="bg-white rounded-2xl border border-[#E6E3DA] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 space-y-4"
    >
      <ToastNotification
        toast={toast}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Portfolio Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332]" />
          <h2 className="text-sm font-extrabold text-[#16160F]">
            Portfolio {totalCount > 0 && `(${totalCount})`}
          </h2>
        </div>

        <Link
          to={targetPortfolioUrl}
          className="text-xs font-semibold text-[#1B4332] hover:text-[#143326] hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="aspect-square rounded-xl bg-[#E6E3DA]/60 border border-[#E6E3DA]"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && totalCount === 0 && (
        <div className="bg-[#F7F6F2] border border-[#E6E3DA] rounded-xl p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E4EEE8] border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332] mx-auto shadow-2xs">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#16160F]">No portfolio items yet</h3>
            <p className="text-[11px] text-[#6B6858] mt-0.5 max-w-sm mx-auto leading-relaxed">
              {isOwner
                ? "Showcase your work, projects, images, and videos here."
                : `${userName} hasn't added any portfolio items yet.`}
            </p>
          </div>

          {isOwner && (
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1B4332] text-white text-xs font-bold rounded-lg hover:bg-[#143326] transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Work</span>
            </Link>
          )}
        </div>
      )}

      {/* 3-Item Preview Grid */}
      {!loading && totalCount > 0 && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {previewList.map((item, idx) => {
            const isVideo = item.media?.type === "video";
            const thumb = item.media?.thumbnailUrl || item.media?.url;
            const caption = item.caption || "";

            return (
              <div
                key={item._id || item.id || idx}
                onClick={() => handleOpenLightbox(idx)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[#F7F6F2] border border-[#E6E3DA] hover:border-[#1B4332]/50 transition-all duration-300 shadow-2xs cursor-pointer select-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenLightbox(idx);
                  }
                }}
                aria-label={`View portfolio ${isVideo ? "video" : "image"}`}
              >
                <img
                  src={thumb}
                  alt={caption || "Portfolio preview"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Video Play Indicator Badge */}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center shadow-xs group-hover:bg-[#1B4332]/90 transition-all">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Skill tag overlay */}
                {item.skill?.name && (
                  <div className="absolute top-1.5 left-1.5 pointer-events-none">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs shadow-2xs truncate max-w-[80px] inline-block">
                      {item.skill.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox for preview thumbnails */}
      <PortfolioLightbox
        isOpen={lightboxOpen}
        item={lightboxIndex >= 0 ? previewList[lightboxIndex] : null}
        items={previewList}
        onClose={() => setLightboxOpen(false)}
        onSelectIndex={(newIdx) => setLightboxIndex(newIdx)}
        onReact={handleToggleReaction}
        onViewReactions={(i) => setReactionsModalItem(i)}
        onReport={handleOpenReport}
      />

      {/* Reactions Modal */}
      <PortfolioReactionsModal
        isOpen={Boolean(reactionsModalItem)}
        item={reactionsModalItem}
        onClose={() => setReactionsModalItem(null)}
        onCloseLightbox={() => setLightboxOpen(false)}
      />

      {/* Report Portfolio Item Modal */}
      <PortfolioReportModal
        isOpen={Boolean(reportModalItem)}
        item={reportModalItem}
        onClose={() => setReportModalItem(null)}
        onSuccess={handleReportSuccess}
      />
    </section>
  );
}
