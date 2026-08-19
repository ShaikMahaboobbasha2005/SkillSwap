import { useState } from "react";
import Modal from "../Modal";
import ratingService from "../../services/ratingService";
import { Star, Loader2, AlertCircle } from "lucide-react";

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
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F6F2] border border-[#E6E3DA]">
          <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white font-bold text-sm flex items-center justify-center border-2 border-white shadow-xs shrink-0 overflow-hidden">
            {partnerAvatar ? (
              <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
            ) : (
              partnerName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#16160F] truncate">{partnerName}</h4>
            <p className="text-[11px] text-[#6B6858]">How was your skill swap experience?</p>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Star Rating Selector */}
        <div className="space-y-2 text-center">
          <label className="text-xs font-bold text-[#16160F] block">
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
                  className="p-1 rounded-lg hover:bg-amber-50 transition-transform active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      isFilled
                        ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                        : "text-zinc-300 hover:text-amber-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          {validationError && (
            <p className="text-xs font-semibold text-red-600 mt-1">{validationError}</p>
          )}
        </div>

        {/* Optional Review Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="review-textarea" className="font-bold text-[#16160F]">
              Review <span className="text-[#6B6858] font-normal">(optional)</span>
            </label>
            <span className="text-[11px] font-medium text-[#6B6858]">
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
            className="w-full text-xs p-3 rounded-xl border border-[#E6E3DA] bg-[#F7F6F2] text-[#16160F] placeholder-[#6B6858] focus:bg-white focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20 outline-none transition-all resize-none"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E3DA]">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-[#16160F] bg-[#F7F6F2] hover:bg-[#E4EEE8] border border-[#E6E3DA] rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#143326] rounded-xl transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
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
