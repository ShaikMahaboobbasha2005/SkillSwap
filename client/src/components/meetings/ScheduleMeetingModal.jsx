import { useState } from "react";
import { Calendar, Clock, FileText, AlertCircle, X, Sparkles } from "lucide-react";
import Modal from "../Modal";

/**
 * ScheduleMeetingModal Component
 *
 * Provides a clean, responsive modal for picking meeting date, time, duration, and optional topic notes.
 */
export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  partnerName = "Swap Partner",
  onSchedule,
  isSubmitting = false,
}) {
  // Default date to today formatted as YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  // Default time to next round hour or 30 minutes ahead
  const defaultDate = new Date(Date.now() + 30 * 60 * 1000);
  const defaultHours = defaultDate.getHours().toString().padStart(2, "0");
  const defaultMinutes = (Math.ceil(defaultDate.getMinutes() / 15) * 15 % 60)
    .toString()
    .padStart(2, "0");
  const defaultTimeStr = `${defaultHours}:${defaultMinutes}`;

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(defaultTimeStr);
  const [duration, setDuration] = useState(30);
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!date || !time) {
      setError("Please select both a date and a time.");
      return;
    }

    const scheduledDateTime = new Date(`${date}T${time}`);
    if (isNaN(scheduledDateTime.getTime())) {
      setError("Invalid date and time selection.");
      return;
    }

    // Ensure scheduled time is not more than 2 minutes in past
    if (scheduledDateTime.getTime() < Date.now() - 2 * 60 * 1000) {
      setError("The scheduled time cannot be in the past. Please choose a future time.");
      return;
    }

    try {
      await onSchedule({
        scheduledAt: scheduledDateTime.toISOString(),
        duration: parseInt(duration, 10),
        note: note.trim(),
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to schedule session.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E3DA] dark:border-[#2A2E29]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#16160F] dark:text-[#F2F1EC]">
                Schedule Video Session
              </h3>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C]">
                With <strong className="text-[#16160F] dark:text-[#F2F1EC]">{partnerName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F7F6F2] dark:bg-[#202520] hover:bg-[#E6E3DA] dark:hover:bg-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close scheduler"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="py-4 space-y-3.5">
          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  min={todayStr}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-[#16160F] dark:text-[#F2F1EC] bg-white dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#3FA873]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-[#16160F] dark:text-[#F2F1EC] bg-white dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#3FA873]"
                />
              </div>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6B6858] dark:text-[#9C9A8C]" />
              Estimated Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-[#16160F] dark:text-[#F2F1EC] bg-white dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#3FA873]"
            >
              <option value={15} className="bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC]">15 minutes (Quick Sync)</option>
              <option value={30} className="bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC]">30 minutes (Standard Session)</option>
              <option value={45} className="bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC]">45 minutes (Focused Learning)</option>
              <option value={60} className="bg-white dark:bg-[#181B18] text-[#16160F] dark:text-[#F2F1EC]">60 minutes (Deep Dive)</option>
            </select>
          </div>

          {/* Session Topic / Note */}
          <div>
            <label className="block text-xs font-bold text-[#16160F] dark:text-[#F2F1EC] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#6B6858] dark:text-[#9C9A8C]" />
                Session Topic or Goal (Optional)
              </span>
              <span className="text-[10px] text-[#6B6858] dark:text-[#9C9A8C] font-normal">
                {note.length}/300
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 300))}
              placeholder="e.g. Practice React hooks & review UI portfolio samples"
              rows={2}
              className="w-full px-3 py-2 text-xs sm:text-sm text-[#16160F] dark:text-[#F2F1EC] placeholder:text-[#6B6858]/60 dark:placeholder:text-[#9C9A8C]/60 bg-white dark:bg-[#202520] border border-[#E6E3DA] dark:border-[#2A2E29] rounded-xl focus:outline-hidden focus:border-[#1B4332] dark:focus:border-[#3FA873] focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#3FA873] resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#E6E3DA]/60 dark:border-[#2A2E29] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] hover:bg-[#F7F6F2] dark:hover:bg-[#202520] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-white dark:text-[#0F1210] bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#2D6A4F] dark:hover:bg-[#339162] rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Scheduling…</span>
            ) : (
              <>
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Session</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
