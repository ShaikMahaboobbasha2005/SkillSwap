import { useState } from "react";
import Modal from "../Modal";
import ratingService from "../../services/ratingService";
import { Star, Loader2, AlertCircle, ArrowLeftRight } from "lucide-react";

export default function RatingModal({
  isOpen,
  onClose,
  swap,
  currentUserId,
  onSuccess,
}) {
  const [stars, setStars] = useState(0);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [review, setReview] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  if (!swap) return null;

  const swapId = swap._id || swap.id;
  const fromUserId = swap.fromUser?._id || swap.fromUser?.id || swap.fromUser;
  const isFromMe = String(fromUserId) === String(currentUserId);
  const partner = isFromMe ? swap.toUser : swap.fromUser;
  const partnerName = partner?.name || "Swap Partner";
  const partnerAvatar = partner?.profilePicture || "";

  // Derive swap skill names
  const offeredName =
    swap.offeredSkill?.name ||
    (typeof swap.offeredSkill === "string" ? swap.offeredSkill : "") ||
    swap.offeredSkillSnapshot?.name ||
    swap.offeredSkillName ||
    "";
  const wantedName =
    swap.wantedSkill?.name ||
    (typeof swap.wantedSkill === "string" ? swap.wantedSkill : "") ||
    swap.wantedSkillSnapshot?.name ||
    swap.wantedSkillName ||
    "";

  const handleStarClick = (num) => {
    setStars(num);
    if (validationError) setValidationError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setStars(0);
    setHoveredStars(0);
    setReview("");
    setValidationError("");
    setServerError("");
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!stars || stars < 1 || stars > 5) {
      setValidationError("Please select a star rating between 1 and 5.");
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      const res = await ratingService.createRating(swapId, {
        stars,
        review: review.trim(),
      });

      const updatedAvgRating = res?.data?.updatedAvgRating;
      const createdRating = res?.data?.rating;

      if (onSuccess) {
        onSuccess(updatedAvgRating, createdRating);
      }
      handleClose();
    } catch (err) {
      console.error("Failed to submit rating:", err);
      const msg = err.response?.data?.message || err.message || "Failed to submit rating. Please try again.";
      setServerError(msg);
      setIsSubmitting(false);
    }
  };

  const displayStars = hoveredStars > 0 ? hoveredStars : stars;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-md"
      title={`Rate ${partnerName}`}
      showCloseButton={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Partner Header */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F6F2] dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29]">
          <div className="w-10 h-10 rounded-full bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] font-bold text-sm flex items-center justify-center border-2 border-white dark:border-[#2A2E29] shadow-xs shrink-0 overflow-hidden">
            {partnerAvatar ? (
              <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
            ) : (
              partnerName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] truncate">{partnerName}</h4>
            <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C]">How was your skill swap experience?</p>
          </div>
        </div>

        {/* Swap Skill Context Badge */}
        {(offeredName || wantedName) && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] shadow-2xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-md bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] truncate">
                {offeredName && wantedName ? `${offeredName} ↔ ${wantedName}` : offeredName || wantedName}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-[#6B6858] dark:text-[#9C9A8C] px-1.5 py-0.5 rounded bg-[#F7F6F2] dark:bg-[#181B18] border border-[#E6E3DA] dark:border-[#2A2E29] shrink-0">
              Skill Swap
            </span>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Star Rating Selector */}
        <div className="space-y-2 text-center">
          <label className="text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] block">
            Select Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center justify-center gap-2 pt-1">
            {[1, 2, 3, 4, 5].map((num) => {
              const isFilled = num <= displayStars;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleStarClick(num)}
                  onMouseEnter={() => setHoveredStars(num)}
                  onMouseLeave={() => setHoveredStars(0)}
                  aria-label={`Rate ${num} ${num === 1 ? "star" : "stars"}`}
                  className="p-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-transform active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-[#3FA873]"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      isFilled
                        ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                        : "text-zinc-300 dark:text-zinc-600 hover:text-amber-300 dark:hover:text-amber-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {validationError && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-1">{validationError}</p>
          )}
        </div>

        {/* Optional Review Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="review-textarea" className="font-bold text-[#16160F] dark:text-[#F2F1EC]">
              Review <span className="text-[#6B6858] dark:text-[#9C9A8C] font-normal">(optional)</span>
            </label>
            <span className="text-[11px] font-medium text-[#6B6858] dark:text-[#9C9A8C]">
              {review.length} / 500
            </span>
          </div>
          <textarea
            id="review-textarea"
            rows={4}
            maxLength={500}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={`Share feedback on your skill exchange with ${partnerName}...`}
            className="w-full text-xs p-3 rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] bg-[#F7F6F2] dark:bg-[#202520] text-[#16160F] dark:text-[#F2F1EC] placeholder-[#6B6858] dark:placeholder-[#9C9A8C]/60 focus:bg-white dark:focus:bg-[#181B18] focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#3FA873]/20 outline-none transition-all resize-none"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E3DA] dark:border-[#2A2E29]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-[#16160F] dark:text-[#F2F1EC] bg-[#F7F6F2] dark:bg-[#202520] hover:bg-[#E4EEE8] dark:hover:bg-[#2A2E29] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#143326] dark:hover:bg-[#339162] rounded-xl transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Review</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
