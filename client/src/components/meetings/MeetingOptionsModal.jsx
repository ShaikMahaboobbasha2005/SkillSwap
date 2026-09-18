import { Video, Calendar, Sparkles, X } from "lucide-react";
import Modal from "../Modal";

/**
 * MeetingOptionsModal Component
 *
 * Presents two distinct choices when the user clicks the video call button in Chat:
 * 1. Start Instant Meeting Now
 * 2. Schedule Future Session
 */
export default function MeetingOptionsModal({
  isOpen,
  onClose,
  partnerName = "Swap Partner",
  onStartInstant,
  onOpenSchedule,
  isStarting = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      showCloseButton={false}
    >
      <div className="p-5 sm:p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6E3DA] dark:border-[#2A2E29]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#16160F] dark:text-[#F2F1EC]">
                Start or Schedule a Session
              </h3>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C]">
                Video learning with <strong className="text-[#16160F] dark:text-[#F2F1EC]">{partnerName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F7F6F2] dark:bg-[#202520] hover:bg-[#E6E3DA] dark:hover:bg-[#2A2E29] text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close options"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Option Cards */}
        <div className="py-4 space-y-3">
          {/* Option A: Start Now */}
          <button
            type="button"
            onClick={onStartInstant}
            disabled={isStarting}
            className="w-full text-left p-4 rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332] dark:hover:border-[#3FA873] bg-white dark:bg-[#202520] hover:bg-[#F7F6F2]/60 dark:hover:bg-[#242A24] transition-all group cursor-pointer shadow-2xs flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] dark:bg-[#3FA873] text-white dark:text-[#0F1210] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#16160F] dark:text-[#F2F1EC] group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873] transition-colors">
                  Start Video Call Now
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                  Instant
                </span>
              </div>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] mt-0.5 leading-relaxed">
                Launch an immediate 1-on-1 video call. Your partner can join directly from the chat.
              </p>
            </div>
          </button>

          {/* Option B: Schedule */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSchedule();
            }}
            disabled={isStarting}
            className="w-full text-left p-4 rounded-xl border border-[#E6E3DA] dark:border-[#2A2E29] hover:border-[#1B4332] dark:hover:border-[#3FA873] bg-white dark:bg-[#202520] hover:bg-[#F7F6F2]/60 dark:hover:bg-[#242A24] transition-all group cursor-pointer shadow-2xs flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F7F6F2] dark:bg-[#181B18] text-[#1B4332] dark:text-[#3FA873] border border-[#E6E3DA] dark:border-[#2A2E29] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Calendar className="w-5 h-5 text-[#1B4332] dark:text-[#3FA873]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#16160F] dark:text-[#F2F1EC] group-hover:text-[#1B4332] dark:group-hover:text-[#3FA873] transition-colors">
                  Schedule for Later
                </span>
              </div>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] mt-0.5 leading-relaxed">
                Pick a date, time, and topic. Both participants will receive in-app reminders before the call.
              </p>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#6B6858] dark:text-[#9C9A8C] border-t border-[#E6E3DA]/60 dark:border-[#2A2E29]">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#3FA873]" />
            Powered by Jitsi Meet (Private & Encrypted)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#6B6858] dark:text-[#9C9A8C] hover:text-[#16160F] dark:hover:text-[#F2F1EC] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
