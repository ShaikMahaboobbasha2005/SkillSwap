import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

/**
 * MessageInput Component
 *
 * Renders message composition textarea with single container focus border,
 * max 2000 char counter, submission guards, and keyboard shortcuts.
 */
export default function MessageInput({
  onSendMessage,
  isSending = false,
  isConnected = true,
}) {
  const [content, setContent] = useState("");
  const textareaRef = useRef(null);

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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!canSend) return;

    const messageToSend = trimmedContent;

    try {
      const success = await onSendMessage(messageToSend);
      if (success) {
        setContent("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } catch (err) {
      console.error("Send message error caught in input component:", err);
    } finally {
      setTimeout(() => {
        if (textareaRef.current && !textareaRef.current.disabled) {
          textareaRef.current.focus();
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-t border-[#E6E3DA] p-2.5 sm:p-3 sticky bottom-0 z-20 shrink-0"
    >
      <div className="w-full flex items-end gap-2 sm:gap-3">
        <div className="flex-1 relative bg-[#F7F6F2] border border-[#E6E3DA] focus-within:border-[#1B4332] rounded-2xl transition-all shadow-2xs overflow-hidden">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected || isSending}
            placeholder={
              !isConnected
                ? "Reconnecting to real-time chat…"
                : "Type a message… (Enter to send, Shift+Enter for new line)"
            }
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-[#16160F] placeholder-[#6B6858] bg-transparent outline-none border-none ring-0 focus:outline-none focus:ring-0 focus:border-none resize-none max-h-32 disabled:opacity-60"
          />

          {/* Character counter warning when approaching 2000 char limit */}
          {content.length > 1800 && (
            <div className="px-3 pb-1 text-[10px] text-right text-amber-700 font-bold">
              {2000 - content.length} chars remaining
            </div>
          )}
        </div>

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
