import { useState, useRef, useEffect } from "react";
import { Check, CheckCheck, MoreVertical, Trash2, Ban, Reply } from "lucide-react";

/**
 * Helper to format timestamp cleanly for chat messages without third-party dependencies.
 */
function formatMessageTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const timeStr = `${formattedHours}:${minutes} ${ampm}`;

  if (isToday) return timeStr;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${timeStr}`;
}

/**
 * MessageBubble Component
 *
 * Desktop: Hover reveals contextual ⋮ button beside bubble.
 * Mobile: Clean thread (no permanent ⋮ button), Swipe Right (50px) to Reply, Long Press (450ms) for Action Sheet.
 */
export default function MessageBubble({
  message,
  currentUserId,
  onDeleteMessage,
  onSelectReply,
  onSelectReplyToMessage,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const menuRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const isGestureCancelledRef = useRef(false);
  const longPressTimerRef = useRef(null);

  if (!message) return null;

  const msgIdStr = (message._id || message.id)?.toString();
  const senderId = message.sender?._id || message.sender?.id || message.sender;
  const isMine = senderId?.toString() === currentUserId?.toString();
  const timeString = formatMessageTime(message.createdAt);
  const status = message.status || "sent";
  const isDeleted = Boolean(message.isDeleted);

  // Close contextual menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting || !onDeleteMessage || !msgIdStr) return;
    setIsDeleting(true);
    try {
      await onDeleteMessage(msgIdStr);
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
      setMenuOpen(false);
    }
  };

  // Mobile Touch Gesture Handlers
  const handleTouchStart = (e) => {
    if (isDeleted) return;
    const touch = e.touches[0];
    if (!touch) return;

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchDeltaRef.current = { x: 0, y: 0 };
    isGestureCancelledRef.current = false;
    setIsSwiping(false);

    // Start 450ms long press timer for mobile action sheet
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      if (
        !isGestureCancelledRef.current &&
        Math.abs(touchDeltaRef.current.x) < 10 &&
        Math.abs(touchDeltaRef.current.y) < 10
      ) {
        setShowMobileSheet(true);
        if (typeof window !== "undefined" && window.navigator?.vibrate) {
          try {
            window.navigator.vibrate(40);
          } catch (_) {}
        }
      }
    }, 450);
  };

  const handleTouchMove = (e) => {
    if (isDeleted || isGestureCancelledRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchDeltaRef.current = { x: deltaX, y: deltaY };

    // Prioritize normal vertical scrolling: cancel swipe & long press if vertical > horizontal or moving left
    if (Math.abs(deltaY) > Math.abs(deltaX) || deltaX < 0) {
      if (Math.abs(deltaY) > 8) {
        isGestureCancelledRef.current = true;
        clearLongPressTimer();
        setDragX(0);
        setIsSwiping(false);
      }
      return;
    }

    // Cancel long press timer once horizontal movement exceeds 8px
    if (deltaX > 8) {
      clearLongPressTimer();
    }

    // Rightward swipe gesture
    if (deltaX > 10) {
      setIsSwiping(true);
      const cappedX = Math.min(65, deltaX * 0.7);
      setDragX(cappedX);
    }
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
    if (isDeleted) return;

    if (dragX >= 50 && !isGestureCancelledRef.current) {
      if (typeof onSelectReply === "function") {
        onSelectReply(message);
      }
    }

    // Smoothly return bubble to original position
    setDragX(0);
    setIsSwiping(false);
  };

  const replyTarget = message.replyTo;
  const replyTargetIdStr = replyTarget
    ? (replyTarget._id || replyTarget.id || replyTarget)?.toString()
    : null;
  const replySenderName =
    replyTarget?.sender?.name || replyTarget?.sender?.fullName || "User";
  const replyIsDeleted = Boolean(replyTarget?.isDeleted);
  const replyPreviewText = replyIsDeleted
    ? "This message was deleted"
    : replyTarget?.content || "";

  // Render Desktop contextual action control (⋮ button + dropdown) - HIDDEN ON MOBILE (sm:block)
  const renderDesktopActionMenu = () => {
    if (isDeleted) return null;

    return (
      <div className="hidden sm:block relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-7 h-7 flex items-center justify-center text-[#6B6858] hover:text-[#16160F] hover:bg-black/5 rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Message options"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {/* Desktop Dropdown Menu */}
        {menuOpen && (
          <div
            className={`absolute ${
              isMine ? "right-0" : "left-0"
            } bottom-full mb-1.5 z-30 w-36 bg-white border border-[#E6E3DA] rounded-xl shadow-lg p-1 animate-in fade-in zoom-in-95 duration-100`}
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                if (typeof onSelectReply === "function") {
                  onSelectReply(message);
                }
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-[#16160F] hover:bg-[#F7F6F2] hover:text-[#1B4332] flex items-center gap-2 transition-colors rounded-lg cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5 text-[#6B6858]" />
              <span>Reply</span>
            </button>

            {isMine && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setShowConfirmModal(true);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-lg cursor-pointer border-t border-[#E6E3DA]/60 mt-0.5 pt-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Delete message</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render message bubble box with touch gesture handlers
  const renderBubbleBox = () => (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        transform: `translateX(${dragX}px)`,
        transition: isSwiping ? "none" : "transform 200ms ease-out",
      }}
      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-2xs select-none sm:select-text ${
        isDeleted
          ? isMine
            ? "bg-[#1B4332]/80 text-white/80 rounded-tr-xs italic"
            : "bg-[#F7F6F2] text-[#6B6858] border border-[#E6E3DA] rounded-tl-xs italic"
          : isMine
          ? "bg-[#1B4332] text-white rounded-tr-xs"
          : "bg-white text-[#16160F] border border-[#E6E3DA] rounded-tl-xs"
      }`}
    >
      {/* Quoted Reply Block */}
      {replyTarget && !isDeleted && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (replyTargetIdStr && typeof onSelectReplyToMessage === "function") {
              onSelectReplyToMessage(replyTargetIdStr);
            }
          }}
          className={`w-full text-left mb-2 p-2 rounded-xl border-l-3 transition-all cursor-pointer ${
            isMine
              ? "bg-black/20 border-emerald-300 text-white/90 hover:bg-black/30"
              : "bg-[#F7F6F2] border-[#1B4332] text-[#16160F] hover:bg-zinc-200/80"
          }`}
        >
          <div
            className={`text-[10px] font-extrabold truncate ${
              isMine ? "text-emerald-200" : "text-[#1B4332]"
            }`}
          >
            {replySenderName}
          </div>
          <div
            className={`text-[11px] truncate mt-0.5 ${
              replyIsDeleted ? "italic opacity-80" : ""
            }`}
          >
            {replyPreviewText}
          </div>
        </button>
      )}

      {isDeleted ? (
        <p className="flex items-center gap-1.5 text-xs select-none">
          <Ban className="w-3.5 h-3.5 opacity-75 shrink-0" />
          <span>This message was deleted</span>
        </p>
      ) : (
        <p className="whitespace-pre-wrap">{message.content}</p>
      )}

      <div
        className={`flex items-center justify-end gap-1.5 text-[10px] mt-1 select-none ${
          isMine ? "text-white/75" : "text-[#6B6858]"
        }`}
      >
        <span>{timeString}</span>

        {/* Status Ticks for Current User's Non-Deleted Outgoing Messages */}
        {isMine && !isDeleted && (
          <span className="inline-flex items-center ml-0.5">
            {status === "sent" && <Check className="w-3 h-3 text-white/70" />}
            {status === "delivered" && (
              <CheckCheck className="w-3.5 h-3.5 text-white/75" />
            )}
            {status === "read" && (
              <CheckCheck className="w-3.5 h-3.5 text-emerald-300 font-bold" />
            )}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`group relative flex w-full my-1 px-1 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div className="relative flex items-center gap-2 max-w-[85%] sm:max-w-[70%]">
        {/* Mobile Swipe Reply Icon Visual Indicator */}
        {dragX > 5 && !isDeleted && (
          <div
            className="absolute -left-9 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-[#1B4332] text-white shadow-sm transition-opacity duration-150 z-10 pointer-events-none"
            style={{ opacity: Math.min(1, dragX / 40) }}
          >
            <Reply className="w-3.5 h-3.5" />
          </div>
        )}

        {isMine ? (
          <>
            {renderDesktopActionMenu()}
            {renderBubbleBox()}
          </>
        ) : (
          <>
            {renderBubbleBox()}
            {renderDesktopActionMenu()}
          </>
        )}
      </div>

      {/* Mobile Long Press Action Sheet */}
      {showMobileSheet && !isDeleted && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 pb-[calc(12px+env(safe-area-inset-bottom,0px))]"
          onClick={() => setShowMobileSheet(false)}
        >
          <div
            className="bg-white border border-[#E6E3DA] rounded-2xl p-3 sm:p-4 max-w-[420px] w-full shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-150 mx-auto"
            style={{ height: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-8 h-1 bg-[#E6E3DA] rounded-full mx-auto mb-2 sm:hidden" />
            <div className="px-1 pb-1.5">
              <h4 className="text-[10px] font-extrabold text-[#6B6858] uppercase tracking-wider">
                Message Options
              </h4>
              <p className="text-xs text-[#16160F] font-medium leading-snug mt-1 line-clamp-2">
                "{message.content}"
              </p>
            </div>

            <div className="pt-0.5 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setShowMobileSheet(false);
                  if (typeof onSelectReply === "function") {
                    onSelectReply(message);
                  }
                }}
                className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#16160F] hover:bg-[#F7F6F2] hover:text-[#1B4332] flex items-center gap-2.5 transition-colors rounded-xl cursor-pointer min-h-[44px]"
              >
                <Reply className="w-4 h-4 text-[#1B4332] shrink-0" />
                <span>Reply</span>
              </button>

              {isMine && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMobileSheet(false);
                    setShowConfirmModal(true);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors rounded-xl cursor-pointer min-h-[44px] border-t border-[#E6E3DA]/60 mt-1 pt-2.5"
                >
                  <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Delete message</span>
                </button>
              )}
            </div>

            <div className="pt-2 mt-1.5 border-t border-[#E6E3DA]">
              <button
                type="button"
                onClick={() => setShowMobileSheet(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-[#6B6858] bg-[#F7F6F2] hover:bg-zinc-200 transition-all cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E6E3DA] rounded-2xl p-5 max-w-xs w-full shadow-xl space-y-3 animate-in zoom-in-95 duration-150">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#16160F]">
                Delete message?
              </h3>
              <p className="text-xs text-[#6B6858] leading-relaxed">
                This message will be deleted for everyone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E3DA]">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#16160F] bg-[#F7F6F2] hover:bg-zinc-200 border border-[#E6E3DA] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                {isDeleting && (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
