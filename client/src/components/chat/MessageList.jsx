import { useState, useEffect, useRef, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import { MessageSquareDashed, ArrowDown } from "lucide-react";

/**
 * MessageList Component
 *
 * Renders scrollable thread of chat messages with priority opening positioning:
 * - CASE 1: Scrolls to the FIRST UNREAD incoming message if present.
 * - CASE 2: Scrolls to the BOTTOM / latest message if all messages are read.
 * - CASE 3: Renders empty state normally for brand new conversations.
 * Preserves scroll position on incoming messages when user is scrolled up,
 * presents a floating scroll-to-bottom button with a new-message counter, and
 * executes viewport-aware read receipts via IntersectionObserver.
 */
export default function MessageList({
  messages = [],
  currentUserId,
  loading = false,
  initialUnreadId = null,
  swapId,
  onMarkMessagesRead,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessagesBelow, setNewMessagesBelow] = useState(0);

  // Track initialization per conversation
  const hasInitializedRef = useRef(false);
  const prevSwapIdRef = useRef(swapId);
  const prevMessageIdsRef = useRef(new Set());

  // IntersectionObserver for Viewport-Aware Read Receipts
  const observerRef = useRef(null);
  const pendingReadIdsRef = useRef(new Set());
  const batchTimeoutRef = useRef(null);

  const flushReadBatch = useCallback(() => {
    if (pendingReadIdsRef.current.size === 0) return;

    const idsToMark = Array.from(pendingReadIdsRef.current);
    pendingReadIdsRef.current.clear();

    if (typeof onMarkMessagesRead === "function" && swapId) {
      onMarkMessagesRead(swapId, idsToMark);
    }
  }, [onMarkMessagesRead, swapId]);

  // Reset initialization flag and counter when switching conversations
  useEffect(() => {
    if (prevSwapIdRef.current !== swapId) {
      hasInitializedRef.current = false;
      prevSwapIdRef.current = swapId;
      setNewMessagesBelow(0);
      setShowScrollButton(false);
      prevMessageIdsRef.current = new Set();
      pendingReadIdsRef.current.clear();
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    }
  }, [swapId]);

  // Viewport-aware IntersectionObserver setup
  useEffect(() => {
    if (loading || !containerRef.current || !messages || messages.length === 0) {
      return;
    }

    const container = containerRef.current;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const handleIntersection = (entries) => {
      // Tab/Document visibility guard
      if (document.visibilityState !== "visible") return;

      let hasNewRead = false;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const msgId = entry.target.getAttribute("data-message-id");
          if (msgId && !pendingReadIdsRef.current.has(msgId)) {
            pendingReadIdsRef.current.add(msgId);
            hasNewRead = true;
            if (observerRef.current) {
              observerRef.current.unobserve(entry.target);
            }
          }
        }
      });

      if (hasNewRead) {
        if (batchTimeoutRef.current) {
          clearTimeout(batchTimeoutRef.current);
        }
        batchTimeoutRef.current = setTimeout(() => {
          flushReadBatch();
        }, 250);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: container,
      threshold: 0.2,
    });

    const unreadElements = container.querySelectorAll(
      "[data-unread-incoming='true']"
    );
    unreadElements.forEach((el) => {
      observerRef.current.observe(el);
    });

    // Handle tab visibility change (e.g. user returns to background tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && observerRef.current) {
        const currentElements = container.querySelectorAll(
          "[data-unread-incoming='true']"
        );
        currentElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const rootRect = container.getBoundingClientRect();
          const isVisible =
            rect.top < rootRect.bottom &&
            rect.bottom > rootRect.top &&
            rect.height > 0;

          if (isVisible) {
            const msgId = el.getAttribute("data-message-id");
            if (msgId && !pendingReadIdsRef.current.has(msgId)) {
              pendingReadIdsRef.current.add(msgId);
              observerRef.current.unobserve(el);
            }
          }
        });
        flushReadBatch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [messages, loading, swapId, currentUserId, flushReadBatch]);

  // Monitor manual scroll position
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNear = distanceFromBottom < 120;

    if (isNear) {
      setShowScrollButton(false);
      setNewMessagesBelow(0);
    } else {
      setShowScrollButton(true);
    }
  };

  // Scroll smoothly to bottom and reset counter
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessagesBelow(0);
    setShowScrollButton(false);
  };

  // Handle Initial Opening Position & Subsequent Real-Time Scrolls
  useEffect(() => {
    if (loading || !containerRef.current || !messages || messages.length === 0) {
      return;
    }

    const container = containerRef.current;

    // --- PHASE 1: INITIAL POSITIONING (ON CONVERSATION LOAD) ---
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;

      // Seed initial history message IDs
      prevMessageIdsRef.current = new Set(
        messages.map((m) => m._id).filter(Boolean)
      );

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

            const distanceFromBottom =
              container.scrollHeight -
              container.scrollTop -
              container.clientHeight;
            if (distanceFromBottom >= 120) {
              setShowScrollButton(true);
            }
            return;
          }
        }

        // CASE 2: All messages read -> Scroll to BOTTOM / latest message
        container.scrollTop = container.scrollHeight;
        setShowScrollButton(false);
        setNewMessagesBelow(0);
      });
      return;
    }

    // --- PHASE 2: SUBSEQUENT REAL-TIME MESSAGES ---
    const currentIds = new Set(messages.map((m) => m._id).filter(Boolean));

    // Find genuinely new incoming messages from counterpart
    const newIncomingMsgs = messages.filter((m) => {
      if (!m._id || prevMessageIdsRef.current.has(m._id)) return false;
      const senderId = m.sender?._id || m.sender?.id || m.sender;
      return (
        currentUserId && senderId?.toString() !== currentUserId?.toString()
      );
    });

    // Update tracked IDs set
    prevMessageIdsRef.current = currentIds;

    const lastMessage = messages[messages.length - 1];
    const lastSenderId =
      lastMessage?.sender?._id ||
      lastMessage?.sender?.id ||
      lastMessage?.sender;

    const isOwnMessage =
      currentUserId && lastSenderId?.toString() === currentUserId?.toString();

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 120;

    if (isOwnMessage || isNearBottom) {
      // Scroll to bottom if current user sent the message OR if user is already near bottom
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setNewMessagesBelow(0);
      setShowScrollButton(false);
    } else if (newIncomingMsgs.length > 0) {
      // User is scrolled up and new incoming messages arrived: increment counter & show button
      setNewMessagesBelow((prev) => prev + newIncomingMsgs.length);
      setShowScrollButton(true);
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
    <div className="flex-1 relative flex flex-col min-h-0 w-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 space-y-1 scrollbar-thin scrollbar-thumb-zinc-300 pr-2 min-h-0"
      >
        {messages.map((msg, index) => {
          const msgIdStr = (msg._id || msg.id)?.toString();
          const senderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString();
          const isIncoming =
            currentUserId && senderId !== currentUserId.toString();
          const isUnread = msg.status !== "read";

          return (
            <div
              key={msgIdStr || `msg-${index}`}
              data-message-id={msgIdStr}
              data-unread-incoming={isIncoming && isUnread ? "true" : "false"}
              className="w-full"
            >
              <MessageBubble
                message={msg}
                currentUserId={currentUserId}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {showScrollButton && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-3 right-4 sm:right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E6E3DA] text-[#1B4332] font-bold text-xs shadow-md hover:bg-[#F7F6F2] hover:border-[#1B4332]/30 active:scale-95 transition-all cursor-pointer animate-in fade-in duration-200"
          aria-label={
            newMessagesBelow > 0
              ? `Scroll to bottom, ${newMessagesBelow} new message${newMessagesBelow > 1 ? "s" : ""}`
              : "Scroll to latest messages"
          }
        >
          <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          {newMessagesBelow > 0 && (
            <span className="bg-[#1B4332] text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
              {newMessagesBelow > 99 ? "99+" : newMessagesBelow}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
