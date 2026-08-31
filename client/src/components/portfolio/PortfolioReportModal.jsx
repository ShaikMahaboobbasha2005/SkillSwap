import { useState, useEffect } from "react";
import Modal from "../Modal";
import {
  Flag,
  Loader2,
  AlertCircle,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { reportPortfolioItem } from "../../services/portfolioService";

export const REPORT_CATEGORIES = [
  {
    id: "nudity",
    label: "Nudity or sexual content",
    description: "Explicit, pornographic, or sexually suggestive imagery",
  },
  {
    id: "violence",
    label: "Violence or harmful content",
    description: "Graphic violence, physical harm, self-harm, or dangerous activities",
  },
  {
    id: "illegal",
    label: "Illegal or prohibited content",
    description: "Unlawful activities, contraband, or regulated goods",
  },
  {
    id: "hate_harassment",
    label: "Hate or harassment",
    description: "Targeted bullying, threats, slurs, or discriminatory attacks",
  },
  {
    id: "spam",
    label: "Spam or misleading content",
    description: "Deceptive promotions, clickbait, phishing, or fake claims",
  },
  {
    id: "copyright",
    label: "Copyright concern",
    description: "Unauthorized use of your intellectual property or copyright work",
  },
  {
    id: "other",
    label: "Other",
    description: "Any other issue violating SkillSwap community guidelines",
  },
];

/**
 * PortfolioReportModal Component
 *
 * Provides a clean, accessible dialog for authenticated visitors to report
 * portfolio items violating community standards.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Object} props.item - Target portfolio item
 * @param {Function} props.onClose - Modal close handler
 * @param {Function} props.onSuccess - Success callback
 */
export default function PortfolioReportModal({
  isOpen,
  item,
  onClose,
  onSuccess,
}) {
  const [selectedReason, setSelectedReason] = useState("nudity");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens with a new item
  useEffect(() => {
    if (isOpen) {
      setSelectedReason("nudity");
      setDescription("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const itemId = item._id || item.id;
  const isVideo = item.media?.type === "video";
  const thumbnailUrl = item.media?.thumbnailUrl || item.media?.url;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason || submitting || !itemId) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await reportPortfolioItem(itemId, {
        reason: selectedReason,
        description: description.trim(),
      });

      if (res?.success) {
        onSuccess?.(itemId);
        onClose?.();
      }
    } catch (err) {
      console.error("Failed to submit portfolio report:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit report. Please try again.";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? undefined : onClose}
      maxWidth="max-w-lg"
      title="Report portfolio item"
      showCloseButton={!submitting}
      closeOnBackdrop={!submitting}
      closeOnEsc={!submitting}
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Thumbnail & Context Summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F6F2] border border-[#E6E3DA]">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-[#E6E3DA]">
            <img
              src={thumbnailUrl}
              alt="Portfolio media preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#16160F] truncate">
              {item.caption ? item.caption : isVideo ? "Video item" : "Image item"}
            </p>
            <p className="text-[11px] text-[#6B6858] mt-0.5">
              Reports are confidential and reviewed according to community guidelines.
            </p>
          </div>
        </div>

        {/* Section Heading */}
        <div>
          <label className="text-xs font-extrabold text-[#16160F] block">
            Why are you reporting this content?
          </label>
          <p className="text-[11px] text-[#6B6858] mt-0.5">
            Select the reason that best describes your concern with this portfolio media.
          </p>
        </div>

        {/* Categories Radio Group */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {REPORT_CATEGORIES.map((cat) => {
            const isSelected = selectedReason === cat.id;

            return (
              <label
                key={cat.id}
                htmlFor={`report-reason-${cat.id}`}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#E4EEE8]/60 border-[#1B4332] shadow-2xs"
                    : "bg-white border-[#E6E3DA] hover:bg-[#F7F6F2]"
                }`}
              >
                <input
                  type="radio"
                  id={`report-reason-${cat.id}`}
                  name="reportReason"
                  value={cat.id}
                  checked={isSelected}
                  onChange={() => setSelectedReason(cat.id)}
                  disabled={submitting}
                  className="mt-0.5 accent-[#1B4332] w-4 h-4 text-[#1B4332] focus:ring-[#1B4332] cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#16160F] block leading-tight">
                    {cat.label}
                  </span>
                  <span className="text-[11px] text-[#6B6858] block mt-0.5 leading-snug">
                    {cat.description}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Optional Description / Explanation */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="report-description"
              className="text-xs font-bold text-[#16160F]"
            >
              Additional details{" "}
              <span className="text-[#6B6858] font-normal">
                {selectedReason === "other" ? "(Recommended)" : "(Optional)"}
              </span>
            </label>
            <span className="text-[10px] text-[#6B6858] font-medium">
              {description.length}/500
            </span>
          </div>
          <textarea
            id="report-description"
            rows={3}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            placeholder="Provide any additional context or timestamps to assist with review..."
            className="w-full px-3.5 py-2 text-xs text-[#16160F] bg-white border border-[#E6E3DA] rounded-xl focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] placeholder:text-[#6B6858]/60 resize-none transition-all disabled:opacity-50"
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6E3DA]">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-[#16160F] bg-[#F7F6F2] hover:bg-[#E4EEE8] border border-[#E6E3DA] rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || !selectedReason}
            className="px-5 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#143326] rounded-xl transition-all active:scale-[0.98] shadow-2xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Flag className="w-3.5 h-3.5" />
                <span>Submit Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
