import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { MessageSquareDashed } from "lucide-react";

/**
 * MessageList Component
 *
 * Renders scrollable thread of chat messages with priority opening positioning:
 * - CASE 1: Scrolls to the FIRST UNREAD incoming message if present.
 * - CASE 2: Scrolls to the BOTTOM / latest message if all messages are read.
 * - CASE 3: Renders empty state normally for brand new conversations.
 * Preserves scroll position on incoming messages when user is scrolled up.
 */
export default function MessageList({
  messages = [],
  currentUserId,
  loading = false,
  initialUnreadId = null,
  swapId,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // Track initialization per conversation
  const hasInitializedRef = useRef(false);
  const prevSwapIdRef = useRef(swapId);

  // Reset initialization flag when switching conversations
  useEffect(() => {
    if (prevSwapIdRef.current !== swapId) {
      hasInitializedRef.current = false;
      prevSwapIdRef.current = swapId;
    }
  }, [swapId]);

  // Handle Initial Opening Position & Subsequent Real-Time Scrolls
  useEffect(() => {
    if (loading || !containerRef.current || !messages || messages.length === 0) {
      return;
    }

    const container = containerRef.current;

    // --- PHASE 1: INITIAL POSITIONING (ON CONVERSATION LOAD) ---
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Wrap in requestAnimationFrame to guarantee DOM layout calculations are finished
      requestAnimationFrame(() => {
        if (!containerRef.current) return;

        // CASE 1: Unread incoming messages exist -> Scroll to FIRST UNREAD
        if (initialUnreadId) {
          const unreadElement = container.querySelector(
            `[data-message-id="${initialUnreadId}"]`
          );
          if (unreadElement) {
            unreadElement.scrollIntoView({ block: "start", behavior: "auto" });
            return;
          }
        }

        // CASE 2: All messages read -> Scroll to BOTTOM / latest message
        container.scrollTop = container.scrollHeight;
      });
      return;
    }

    // --- PHASE 2: SUBSEQUENT REAL-TIME MESSAGES ---
    const lastMessage = messages[messages.length - 1];
    const lastSenderId =
      lastMessage?.sender?._id ||
      lastMessage?.sender?.id ||
      lastMessage?.sender;

    const isOwnMessage =
      currentUserId && lastSenderId?.toString() === currentUserId?.toString();

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    // Scroll to bottom if current user sent the message OR if user is already near bottom
    if (isOwnMessage || isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, initialUnreadId, currentUserId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-[#6B6858]">
          <div className="w-6 h-6 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold">Loading messages…</span>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F7F6F2]">
        <div className="w-12 h-12 rounded-2xl bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 flex items-center justify-center mb-3">
          <MessageSquareDashed className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#16160F] mb-1">
          No messages yet
        </h3>
        <p className="text-xs text-[#6B6858] max-w-xs">
          Start the conversation about your skill swap. Send a friendly message below!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 space-y-1 scrollbar-thin scrollbar-thumb-zinc-300 pr-2 min-h-0"
    >
      {messages.map((msg, index) => (
        <div
          key={msg._id || `msg-${index}`}
          data-message-id={msg._id}
          className="w-full"
        >
          <MessageBubble
            message={msg}
            currentUserId={currentUserId}
          />
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
