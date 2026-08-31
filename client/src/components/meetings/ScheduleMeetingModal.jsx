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
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E3DA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E4EEE8] text-[#1B4332] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#16160F]">
                Schedule Video Session
              </h3>
              <p className="text-xs text-[#6B6858]">
                With <strong className="text-[#16160F]">{partnerName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F7F6F2] hover:bg-[#E6E3DA] text-[#6B6858] hover:text-[#16160F] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close scheduler"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="py-4 space-y-3.5">
          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#16160F] mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  min={todayStr}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-[#16160F] bg-white border border-[#E6E3DA] rounded-xl focus:outline-hidden focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16160F] mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-[#16160F] bg-white border border-[#E6E3DA] rounded-xl focus:outline-hidden focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-[#16160F] mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6B6858]" />
              Estimated Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-[#16160F] bg-white border border-[#E6E3DA] rounded-xl focus:outline-hidden focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
            >
              <option value={15}>15 minutes (Quick Sync)</option>
              <option value={30}>30 minutes (Standard Session)</option>
              <option value={45}>45 minutes (Focused Learning)</option>
              <option value={60}>60 minutes (Deep Dive)</option>
            </select>
          </div>

          {/* Session Topic / Note */}
          <div>
            <label className="block text-xs font-bold text-[#16160F] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#6B6858]" />
                Session Topic or Goal (Optional)
              </span>
              <span className="text-[10px] text-[#6B6858] font-normal">
                {note.length}/300
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 300))}
              placeholder="e.g. Practice React hooks & review UI portfolio samples"
              rows={2}
              className="w-full px-3 py-2 text-xs sm:text-sm text-[#16160F] placeholder:text-[#6B6858]/60 bg-white border border-[#E6E3DA] rounded-xl focus:outline-hidden focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#E6E3DA]/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-[#6B6858] hover:text-[#16160F] hover:bg-[#F7F6F2] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-white bg-[#1B4332] hover:bg-[#2D6A4F] rounded-xl transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
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
