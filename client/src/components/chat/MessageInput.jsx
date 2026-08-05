import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, Reply, Smile } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

/**
 * MessageInput Component
 *
 * Renders message composition textarea with single container focus border,
 * compact composer reply preview banner, emoji picker popover, cursor preservation,
 * max 2000 char counter, submission guards, and keyboard shortcuts.
 */
export default function MessageInput({
  onSendMessage,
  isSending = false,
  isConnected = true,
  replyingTo = null,
  onCancelReply,
}) {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const textareaRef = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  const trimmedContent = content.trim();
  const isValid = trimmedContent.length > 0 && trimmedContent.length <= 2000;
  const canSend = isValid && !isSending && isConnected;

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [content]);

  // Focus textarea when replyingTo changes
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  }, [replyingTo]);

  // Update stored cursor position
  const updateSelection = () => {
    if (textareaRef.current) {
      selectionRef.current = {
        start: textareaRef.current.selectionStart ?? content.length,
        end: textareaRef.current.selectionEnd ?? content.length,
      };
    }
  };

  const handleSelectEmoji = (emojiStr) => {
    const start = selectionRef.current.start ?? content.length;
    const end = selectionRef.current.end ?? content.length;

    const newContent = content.slice(0, start) + emojiStr + content.slice(end);
    setContent(newContent);

    // Emoji string length correctly accounts for surrogate pairs
    const newCursorPos = start + emojiStr.length;
    selectionRef.current = { start: newCursorPos, end: newCursorPos };

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        try {
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        } catch (_) {}
      }
    }, 0);
  };

  const handleCancel = () => {
    if (typeof onCancelReply === "function") {
      onCancelReply();
    }
    setTimeout(() => {
      if (textareaRef.current && !textareaRef.current.disabled) {
        textareaRef.current.focus({ preventScroll: true });
      }
    }, 0);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!canSend) return;

    const messageToSend = trimmedContent;

    try {
      const success = await onSendMessage(messageToSend);
      if (success) {
        setContent("");
        setShowEmojiPicker(false);
        selectionRef.current = { start: 0, end: 0 };
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } catch (err) {
      console.error("Send message error caught in input component:", err);
    } finally {
      setTimeout(() => {
        if (textareaRef.current && !textareaRef.current.disabled) {
          textareaRef.current.focus({ preventScroll: true });
        }
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const replySenderName =
    replyingTo?.sender?.name ||
    replyingTo?.sender?.fullName ||
    "User";

  const replyPreviewText = replyingTo?.isDeleted
    ? "This message was deleted"
    : replyingTo?.content || "";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-t border-[#E6E3DA] p-2.5 sm:p-3 sticky bottom-0 z-20 shrink-0 relative"
    >
      {/* Composer Reply Preview Banner */}
      {replyingTo && (
        <div className="mb-2 px-3 py-2 bg-[#F7F6F2] border border-[#E6E3DA] border-l-4 border-l-[#1B4332] rounded-xl flex items-center justify-between gap-2 text-xs animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-bold text-[#1B4332] text-[11px]">
              <Reply className="w-3.5 h-3.5 shrink-0" />
              <span>Replying to {replySenderName}</span>
            </div>
            <p className="text-[11px] text-[#6B6858] truncate mt-0.5 italic">
              {replyPreviewText}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-[#6B6858] hover:text-[#16160F] hover:bg-black/5 rounded-md transition-colors cursor-pointer shrink-0"
            aria-label="Cancel reply"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="w-full flex items-end gap-2 sm:gap-3 relative">
        <div className="flex-1 relative bg-[#F7F6F2] border border-[#E6E3DA] focus-within:border-[#1B4332] rounded-2xl transition-all shadow-2xs overflow-hidden flex items-end pr-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              updateSelection();
            }}
            onSelect={updateSelection}
            onClick={updateSelection}
            onKeyUp={updateSelection}
            onKeyDown={handleKeyDown}
            disabled={!isConnected || isSending}
            placeholder={
              !isConnected
                ? "Reconnecting to real-time chat…"
                : "Type a message..."
            }
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#16160F] placeholder-[#6B6858] bg-transparent outline-none border-none ring-0 focus:outline-none focus:ring-0 focus:border-none resize-none max-h-32 disabled:opacity-60"
          />

          {/* Character counter warning when approaching 2000 char limit */}
          {content.length > 1800 && (
            <div className="px-2 pb-2.5 text-[10px] text-amber-700 font-bold shrink-0 select-none">
              {2000 - content.length}
            </div>
          )}
        </div>

        {/* Emoji Button Wrapper & Floating Popover */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              updateSelection();
              setShowEmojiPicker((prev) => !prev);
            }}
            disabled={!isConnected || isSending}
            className="h-10 w-10 rounded-2xl bg-[#F7F6F2] hover:bg-zinc-200 border border-[#E6E3DA] text-[#6B6858] hover:text-[#1B4332] font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0 shadow-2xs"
            aria-label="Choose emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Floating Emoji Picker Popover */}
          {showEmojiPicker && (
            <EmojiPicker
              onSelectEmoji={handleSelectEmoji}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSend}
          className="h-10 px-4 sm:px-5 rounded-2xl bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs sm:text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0 shadow-2xs gap-2"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
