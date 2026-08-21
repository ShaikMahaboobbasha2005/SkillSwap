import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PortfolioCard from "../components/portfolio/PortfolioCard";
import PortfolioLightbox from "../components/portfolio/PortfolioLightbox";
import PortfolioUploadModal from "../components/portfolio/PortfolioUploadModal";
import PortfolioEditModal from "../components/portfolio/PortfolioEditModal";
import PortfolioReactionsModal from "../components/portfolio/PortfolioReactionsModal";
import ConfirmModal from "../components/ConfirmModal";
import ToastNotification from "../components/ToastNotification";
import portfolioService from "../services/portfolioService";
import { getPublicProfile, getOwnProfile } from "../services/profileService";
import useAuth from "../hooks/useAuth";
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Film,
  LayoutGrid,
  AlertCircle,
  RefreshCw,
  FolderGit2,
  Loader2,
} from "lucide-react";

export default function PortfolioPage() {
  const { userId: paramUserId, id: paramId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const currentUserId = authUser?._id || authUser?.id || "";
  // If param is present, use it; otherwise default to logged in user ID
  const targetUserId = paramUserId || paramId || currentUserId;
  const isOwner = Boolean(currentUserId && targetUserId && String(currentUserId) === String(targetUserId));

  const [profileData, setProfileData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "image" | "video"

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reactionsModalItem, setReactionsModalItem] = useState(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Blob URLs tracker for unmount cleanup
  const activeBlobUrlsRef = useRef(new Set());
  // Concurrency guard for rapid reaction clicks
  const pendingReactionIdsRef = useRef(new Set());

  useEffect(() => {
    const urls = activeBlobUrlsRef.current;
    return () => {
      urls.forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      urls.clear();
    };
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  // Fetch Target User Profile Header Info
  const fetchUserInfo = useCallback(async () => {
    if (!targetUserId) return;
    try {
      if (isOwner) {
        const res = await getOwnProfile();
        if (res?.success && res.data) setProfileData(res.data);
      } else {
        const res = await getPublicProfile(targetUserId);
        if (res?.success && res.data) setProfileData(res.data);
      }
    } catch (err) {
      console.warn("Failed to load user profile info for portfolio:", err?.message);
    }
  }, [targetUserId, isOwner]);

  // Fetch Portfolio Items
  const fetchPortfolio = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (typeFilter === "image" || typeFilter === "video") {
        params.type = typeFilter;
      }

      const res = await portfolioService.getUserPortfolio(targetUserId, params);
      const portfolioList = Array.isArray(res?.data?.portfolio)
        ? res.data.portfolio
        : Array.isArray(res?.data)
        ? res.data
        : [];
      
      // Preserve any active uploading temporary items during refetch
      setItems((prev) => {
        const tempItems = prev.filter((i) => i.isUploading || i.uploadStatus === "failed");
        return [...tempItems, ...portfolioList];
      });
    } catch (err) {
      console.error("Failed to load portfolio items:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load portfolio. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [targetUserId, typeFilter]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Execute Upload API call with live Axios onUploadProgress
  const executeUpload = useCallback(async (tempItem) => {
    try {
      const res = await portfolioService.createPortfolioItem(
        tempItem.formData,
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setItems((prev) =>
              prev.map((i) =>
                i._id === tempItem._id
                  ? {
                      ...i,
                      uploadProgress: percent,
                      uploadStatus: percent >= 100 ? "processing" : "uploading",
                    }
                  : i
              )
            );
          }
        }
      );

      if (res?.success && res?.data) {
        const realItem = res.data;

        // Revoke temporary blob URL
        if (tempItem.media?.url && tempItem.media.url.startsWith("blob:")) {
          URL.revokeObjectURL(tempItem.media.url);
          activeBlobUrlsRef.current.delete(tempItem.media.url);
        }

        // Replace temporary item with real server item
        setItems((prev) =>
          prev.map((i) => (i._id === tempItem._id ? realItem : i))
        );

        showToast("Portfolio item uploaded successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to upload portfolio media:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Upload failed. Please check network and file restrictions.";

      setItems((prev) =>
        prev.map((i) =>
          i._id === tempItem._id
            ? {
                ...i,
                isUploading: false,
                uploadStatus: "failed",
                errorMessage: errMsg,
              }
            : i
        )
      );

      showToast("Failed to upload portfolio item.", "error");
    }
  }, []);

  // Optimistic Start Upload Handler
  const handleStartUpload = useCallback(
    (payload) => {
      const tempId = `temp-upload-${Date.now()}`;
      const tempItem = {
        _id: tempId,
        id: tempId,
        isUploading: true,
        uploadProgress: 0,
        uploadStatus: "uploading",
        errorMessage: "",
        media: {
          type: payload.mediaType,
          url: payload.previewUrl,
          thumbnailUrl: payload.previewUrl,
          duration: payload.videoDuration,
        },
        caption: payload.caption || "",
        skill: payload.skill || null,
        file: payload.selectedFile,
        formData: payload.formData,
        reactionSummary: {
          like: 0,
          impressive: 0,
          great_work: 0,
          creative: 0,
          total: 0,
        },
        currentUserReaction: null,
        createdAt: new Date().toISOString(),
      };

      if (payload.previewUrl && payload.previewUrl.startsWith("blob:")) {
        activeBlobUrlsRef.current.add(payload.previewUrl);
      }

      // Prepend temporary card to portfolio grid
      setItems((prev) => [tempItem, ...prev]);

      // Execute upload asynchronously
      executeUpload(tempItem);
    },
    [executeUpload]
  );

  // Retry Failed Upload Handler
  const handleRetryUpload = useCallback(
    (tempItem) => {
      setItems((prev) =>
        prev.map((i) =>
          i._id === tempItem._id
            ? {
                ...i,
                isUploading: true,
                uploadProgress: 0,
                uploadStatus: "uploading",
                errorMessage: "",
              }
            : i
        )
      );

      executeUpload(tempItem);
    },
    [executeUpload]
  );

  // Remove Failed Upload Handler
  const handleRemoveTempItem = useCallback((tempItem) => {
    if (tempItem.media?.url && tempItem.media.url.startsWith("blob:")) {
      URL.revokeObjectURL(tempItem.media.url);
      activeBlobUrlsRef.current.delete(tempItem.media.url);
    }
    setItems((prev) => prev.filter((i) => i._id !== tempItem._id));
  }, []);

  // Toggle Reaction Handler with Optimistic UI and Rollback
  const handleToggleReaction = useCallback(
    async (targetItem, reactionType) => {
      if (!authUser) {
        showToast("Please log in to react to portfolio items.", "error");
        return;
      }

      if (targetItem?.isUploading || targetItem?.uploadStatus === "failed") {
        return;
      }

      const itemId = targetItem._id || targetItem.id;
      if (!itemId) return;

      // Prevent concurrent duplicate requests for the same item
      if (pendingReactionIdsRef.current.has(itemId)) {
        return;
      }
      pendingReactionIdsRef.current.add(itemId);

      // Snapshot previous item state for rollback
      const prevItem = items.find((i) => (i._id || i.id) === itemId);
      const prevReaction = prevItem?.currentUserReaction || null;
      const prevSummary = prevItem?.reactionSummary || {
        like: 0,
        impressive: 0,
        great_work: 0,
        creative: 0,
        total: 0,
      };

      // Calculate next optimistic summary
      const nextSummary = { ...prevSummary };
      let nextReaction = null;

      if (prevReaction === reactionType) {
        // Toggle OFF (remove)
        nextSummary[reactionType] = Math.max(0, (nextSummary[reactionType] || 0) - 1);
        nextSummary.total = Math.max(0, (nextSummary.total || 0) - 1);
        nextReaction = null;
      } else if (prevReaction) {
        // Change from prevReaction to reactionType
        nextSummary[prevReaction] = Math.max(0, (nextSummary[prevReaction] || 0) - 1);
        nextSummary[reactionType] = (nextSummary[reactionType] || 0) + 1;
        nextReaction = reactionType;
      } else {
        // Add new reaction
        nextSummary[reactionType] = (nextSummary[reactionType] || 0) + 1;
        nextSummary.total = (nextSummary.total || 0) + 1;
        nextReaction = reactionType;
      }

      // Optimistic update
      setItems((prev) =>
        prev.map((i) =>
          (i._id || i.id) === itemId
            ? {
                ...i,
                reactionSummary: nextSummary,
                currentUserReaction: nextReaction,
              }
            : i
        )
      );

      try {
        const res = await portfolioService.togglePortfolioReaction(itemId, reactionType);
        if (res?.success && res?.data) {
          // Sync with authoritative server summary
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
        console.error("Failed to toggle reaction:", err);
        // Rollback state on failure
        setItems((prev) =>
          prev.map((i) =>
            (i._id || i.id) === itemId
              ? {
                  ...i,
                  reactionSummary: prevSummary,
                  currentUserReaction: prevReaction,
                }
              : i
          )
        );
        showToast(
          err.response?.data?.message || err.message || "Failed to update reaction.",
          "error"
        );
      } finally {
        pendingReactionIdsRef.current.delete(itemId);
      }
    },
    [authUser, items]
  );

  // Filter completed non-temporary items for Lightbox
  const completedItems = items.filter(
    (i) => !i.isUploading && i.uploadStatus !== "failed"
  );

  // Lightbox selection
  const handleOpenLightbox = (item) => {
    if (item.isUploading || item.uploadStatus === "failed") return;
    const idx = completedItems.findIndex(
      (i) => (i._id || i.id) === (item._id || item.id)
    );
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const handleLightboxSelectIndex = (newIndex) => {
    if (newIndex >= 0 && newIndex < completedItems.length) {
      setLightboxIndex(newIndex);
    }
  };

  // Edit success handler
  const handleEditSuccess = (updatedItem) => {
    setItems((prev) =>
      prev.map((i) =>
        (i._id || i.id) === (updatedItem._id || updatedItem.id) ? updatedItem : i
      )
    );
    showToast("Portfolio item updated successfully!", "success");
  };

  // Delete confirm handler
  const handleDeleteConfirm = async () => {
    if (!deleteTargetItem || deleting) return;
    setDeleting(true);

    const itemId = deleteTargetItem._id || deleteTargetItem.id;

    try {
      await portfolioService.deletePortfolioItem(itemId);
      setItems((prev) => prev.filter((i) => (i._id || i.id) !== itemId));
      showToast("Portfolio item deleted successfully.", "info");
      setDeleteTargetItem(null);
    } catch (err) {
      console.error("Failed to delete portfolio item:", err);
      showToast(
        err.response?.data?.message || err.message || "Failed to delete portfolio item.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Check if an upload is currently active
  const isUploadingActive = items.some(
    (i) => i.isUploading && i.uploadStatus !== "failed"
  );

  // Filter visible items according to type tab
  const visibleItems = items.filter((item) => {
    if (typeFilter === "all") return true;
    return item.media?.type === typeFilter;
  });

  // Compute counts for limits & display
  const imageCount = items.filter(
    (i) => i.media?.type === "image" && i.uploadStatus !== "failed"
  ).length;
  const videoCount = items.filter(
    (i) => i.media?.type === "video" && i.uploadStatus !== "failed"
  ).length;

  const targetName = profileData?.name || (isOwner ? "My" : "User");
  const targetAvatar = profileData?.profilePicture || "";
  const targetLocation = profileData?.location || "";
  const backProfileUrl = isOwner ? "/profile" : `/users/${targetUserId}`;

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <ToastNotification toast={toast} onClose={() => setToast({ show: false, message: "", type: "success" })} />

        {/* Top Navigation & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-[#E6E3DA] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-4">
            <Link
              to={backProfileUrl}
              className="w-10 h-10 rounded-xl bg-[#F7F6F2] hover:bg-[#E4EEE8] text-[#16160F] hover:text-[#1B4332] border border-[#E6E3DA] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
              title="Back to Profile"
              aria-label="Back to Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1B4332] text-white font-bold text-base flex items-center justify-center overflow-hidden border-2 border-white shadow-xs shrink-0">
                {targetAvatar ? (
                  <img src={targetAvatar} alt={targetName} className="w-full h-full object-cover" />
                ) : (
                  targetName.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-black text-[#16160F] tracking-tight">
                    {isOwner ? "My Portfolio" : `${targetName}'s Portfolio`}
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20">
                    {completedItems.length} {completedItems.length === 1 ? "item" : "items"}
                  </span>
                  {isUploadingActive && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                      <span>Uploading...</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B6858] mt-0.5">
                  {targetLocation ? `${targetLocation} &middot; ` : ""}Work samples & project media
                </p>
              </div>
            </div>
          </div>

          {/* Owner Action Button */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              disabled={isUploadingActive}
              className={`h-10 px-5 text-xs font-bold rounded-xl transition-all shadow-2xs inline-flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto ${
                isUploadingActive
                  ? "bg-[#1B4332]/70 text-white cursor-not-allowed opacity-80"
                  : "text-white bg-[#1B4332] hover:bg-[#143326] cursor-pointer active:scale-[0.98]"
              }`}
            >
              {isUploadingActive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Media...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Upload Media</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Filter Tabs Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-[#E6E3DA]/50 rounded-xl">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                typeFilter === "all"
                  ? "bg-white text-[#16160F] shadow-xs"
                  : "text-[#6B6858] hover:text-[#16160F]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All</span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("image")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                typeFilter === "image"
                  ? "bg-white text-[#16160F] shadow-xs"
                  : "text-[#6B6858] hover:text-[#16160F]"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images</span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("video")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                typeFilter === "video"
                  ? "bg-white text-[#16160F] shadow-xs"
                  : "text-[#6B6858] hover:text-[#16160F]"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Videos</span>
            </button>
          </div>

          {/* Quick Counter Info */}
          {isOwner && (
            <div className="text-[11px] text-[#6B6858] font-medium hidden sm:block">
              {imageCount}/20 images &middot; {videoCount}/10 videos
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-2xl bg-[#E6E3DA]/60 border border-[#E6E3DA]"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-xs space-y-4 max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto text-xl font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#16160F]">Failed to load portfolio</h3>
              <p className="text-xs text-[#6B6858] mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchPortfolio}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white text-xs font-semibold rounded-xl hover:bg-[#143326] transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && visibleItems.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E6E3DA] p-10 text-center shadow-xs space-y-4 max-w-lg mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 flex items-center justify-center mx-auto shadow-2xs">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#16160F]">
                {typeFilter !== "all"
                  ? `No ${typeFilter}s found`
                  : isOwner
                  ? "Your portfolio is empty"
                  : "No portfolio items yet"}
              </h3>
              <p className="text-xs text-[#6B6858] mt-1 max-w-sm mx-auto leading-relaxed">
                {isOwner
                  ? "Upload photos, short videos, project screenshots, or certificates to showcase your expertise."
                  : `${targetName} has not added any ${typeFilter !== "all" ? typeFilter + " " : ""}portfolio media yet.`}
              </p>
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                disabled={isUploadingActive}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] text-white text-xs font-bold rounded-xl hover:bg-[#143326] transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Your First Work</span>
              </button>
            )}
          </div>
        )}

        {/* Portfolio Media Grid (3-column desktop/tablet, 2-column mobile) */}
        {!loading && !error && visibleItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 animate-fadeIn">
            {visibleItems.map((item) => (
              <PortfolioCard
                key={item._id || item.id}
                item={item}
                isOwner={isOwner}
                onSelect={handleOpenLightbox}
                onEdit={(i) => setEditingItem(i)}
                onDelete={(i) => setDeleteTargetItem(i)}
                onRetry={handleRetryUpload}
                onRemoveTemp={handleRemoveTempItem}
                onReact={handleToggleReaction}
                onViewReactions={(i) => setReactionsModalItem(i)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal (operates only on completed items) */}
      <PortfolioLightbox
        isOpen={lightboxOpen}
        item={lightboxIndex >= 0 ? completedItems[lightboxIndex] : null}
        items={completedItems}
        onClose={() => setLightboxOpen(false)}
        onSelectIndex={handleLightboxSelectIndex}
        onReact={handleToggleReaction}
        onViewReactions={(i) => setReactionsModalItem(i)}
      />

      {/* Upload Media Modal (Owner Only) */}
      {isOwner && (
        <PortfolioUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onStartUpload={handleStartUpload}
          currentImageCount={imageCount}
          currentVideoCount={videoCount}
          isUploadingActive={isUploadingActive}
        />
      )}

      {/* Edit Portfolio Item Modal (Owner Only) */}
      {isOwner && editingItem && (
        <PortfolioEditModal
          isOpen={Boolean(editingItem)}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal (Owner Only) */}
      {isOwner && (
        <ConfirmModal
          isOpen={Boolean(deleteTargetItem)}
          title="Delete Portfolio Item?"
          message="Are you sure you want to delete this portfolio item? This will permanently remove the media asset."
          confirmText="Delete Media"
          cancelText="Cancel"
          isDestructive={true}
          isProcessing={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            if (!deleting) setDeleteTargetItem(null);
          }}
        />
      )}

      {/* View Reactions Modal (Opens above the lightbox) */}
      <PortfolioReactionsModal
        isOpen={Boolean(reactionsModalItem)}
        item={
          reactionsModalItem
            ? items.find((i) => (i._id || i.id) === (reactionsModalItem._id || reactionsModalItem.id)) || reactionsModalItem
            : null
        }
        onClose={() => setReactionsModalItem(null)}
        onCloseLightbox={() => setLightboxOpen(false)}
      />
    </div>
  );
}
