import { useState } from "react";
import { Video, Calendar, Clock, CheckCircle2, Ban, ExternalLink, Play, AlertCircle } from "lucide-react";

/**
 * Formats meeting scheduled date/time cleanly without external date libraries
 * @param {string|Date} dateInput
 * @returns {{ dateStr: string, timeStr: string, relativeStr: string }}
 */
function formatMeetingDateTime(dateInput) {
  if (!dateInput) return { dateStr: "", timeStr: "", relativeStr: "" };
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return { dateStr: "", timeStr: "", relativeStr: "" };

  const dateStr = d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const timeStr = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  // Calculate relative time
  const now = Date.now();
  const diffMs = d.getTime() - now;
  const diffMins = Math.round(diffMs / (60 * 1000));
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  let relativeStr = "";
  if (diffMs < 0 && diffMs > -60 * 60 * 1000) {
    relativeStr = "Happening now";
  } else if (diffMs < 0) {
    relativeStr = "Past session";
  } else if (diffMins <= 15) {
    relativeStr = "Starts in a few minutes";
  } else if (diffMins < 60) {
    relativeStr = `Starts in ${diffMins} mins`;
  } else if (diffHours < 24) {
    relativeStr = `Starts in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  } else {
    relativeStr = `In ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  }

  return { dateStr, timeStr, relativeStr };
}

/**
 * MeetingMessageCard Component
 *
 * Renders structured, interactive video session cards inside the message stream.
 */
export default function MeetingMessageCard({
  message,
  currentUserId,
  onJoinMeeting,
  onCancelMeeting,
}) {
  const meeting = message.meetingSession || {};
  const status = meeting.status || "scheduled";
  const type = meeting.type || "scheduled";
  const note = meeting.note || "";
  const duration = meeting.duration || 30;
  const scheduledAt = meeting.scheduledAt || message.createdAt;

  const { dateStr, timeStr, relativeStr } = formatMeetingDateTime(scheduledAt);

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const isSender = (message.sender?._id || message.sender)?.toString() === currentUserId?.toString();
  const meetingId = meeting._id || message.meetingSession;

  const handleCancel = async () => {
    if (!meetingId || isCancelling || !onCancelMeeting) return;
    setIsCancelling(true);
    try {
      await onCancelMeeting(meetingId);
      setCancelConfirmOpen(false);
    } catch (err) {
      console.error("Failed to cancel meeting:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const isInstant = type === "instant";
  const isActive = status === "active";
  const isScheduled = status === "scheduled";
  const isCancelled = status === "cancelled";
  const isCompleted = status === "completed";

  return (
    <div data-meeting-card="true" className="w-full max-w-sm sm:max-w-md mx-auto my-2 px-1">
      <div
        className={`rounded-2xl border transition-all overflow-hidden shadow-2xs ${
          isCancelled
            ? "bg-[#F7F6F2] dark:bg-[#181B18] border-[#E6E3DA] dark:border-[#2A2E29] opacity-80"
            : isActive
            ? "bg-white dark:bg-[#202520] border-[#1B4332] dark:border-[#3FA873]/50 ring-1 ring-[#1B4332]/20 dark:ring-[#3FA873]/20"
            : "bg-white dark:bg-[#202520] border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332]/40 dark:hover:border-[#3FA873]/40"
        }`}
      >
        {/* Card Header Banner */}
        <div
          className={`px-4 py-2.5 flex items-center justify-between border-b ${
            isCancelled
              ? "bg-[#E6E3DA]/40 dark:bg-[#181B18] border-[#E6E3DA] dark:border-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C]"
              : isActive
              ? "bg-[#E4EEE8] dark:bg-[#1C2E24] border-[#1B4332]/20 dark:border-[#3FA873]/30 text-[#1B4332] dark:text-[#3FA873]"
              : "bg-[#F7F6F2] dark:bg-[#181B18] border-[#E6E3DA] dark:border-[#2A2E29] text-[#16160F] dark:text-[#F2F1EC]"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                isActive
                  ? "bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] animate-pulse"
                  : isCancelled
                  ? "bg-[#E6E3DA] dark:bg-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C]"
                  : "bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873]"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold">
              {isInstant ? "Instant Video Call" : "Scheduled Video Session"}
            </span>
          </div>

          {/* Status Badge */}
          <div>
            {isActive && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live / Ready
              </span>
            )}
            {isScheduled && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873]">
                {relativeStr || "Scheduled"}
              </span>
            )}
            {isCancelled && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 dark:bg-[#2A2E29] text-gray-700 dark:text-gray-300">
                Cancelled
              </span>
            )}
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col gap-2.5">
          {/* Note / Goal Description */}
          {note && !isCancelled && (
            <p className="text-xs sm:text-sm font-semibold text-[#16160F] dark:text-[#F2F1EC] leading-snug">
              "{note}"
            </p>
          )}

          {/* Details Row: Date, Time & Duration */}
          {!isInstant && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B6858] dark:text-[#9C9A8C]">
              <div className="flex items-center gap-1.5 font-medium text-[#16160F] dark:text-[#F2F1EC]">
                <Calendar className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#3FA873]" />
                <span>{dateStr}</span>
                <span>•</span>
                <span>{timeStr}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#6B6858] dark:text-[#9C9A8C]" />
                <span>{duration} mins</span>
              </div>
            </div>
          )}

          {isInstant && !isCancelled && (
            <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C]">
              Click below to join the private video room on Jitsi Meet.
            </p>
          )}

          {isCancelled && (
            <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] italic flex items-center gap-1">
              <Ban className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              This video session was cancelled.
            </p>
          )}

          {/* Action Row */}
          <div className="pt-1.5 flex items-center justify-between gap-2">
            {!isCancelled && (
              <button
                type="button"
                onClick={() => onJoinMeeting && onJoinMeeting(meetingId)}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs bg-[#1B4332] dark:bg-[#3FA873] hover:bg-[#2D6A4F] dark:hover:bg-[#339162] text-white dark:text-[#0F1210]"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{isActive ? "Join Call Now" : "Join Video Room"}</span>
              </button>
            )}

            {/* Cancel Action for participants if scheduled or active */}
            {(isScheduled || isActive) && onCancelMeeting && (
              <>
                {!cancelConfirmOpen ? (
                  <button
                    type="button"
                    onClick={() => setCancelConfirmOpen(true)}
                    className="px-2.5 py-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                    title="Cancel this session"
                  >
                    Cancel
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="px-2 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                    >
                      {isCancelling ? "…" : "Confirm"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelConfirmOpen(false)}
                      className="px-2 py-1 text-[10px] font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2E29] rounded-lg transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
