import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import swapService from "../services/swapService";
import chatService from "../services/chatService";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import ToastNotification from "../components/ToastNotification";
import { AlertCircle, ArrowLeft, ShieldAlert } from "lucide-react";

export default function ChatPage({ isEmbedded = false }) {
  const { swapId } = useParams();
  const { user } = useAuth();
  const {
    isConnected,
    connectionError,
    markSwapAsRead,
    joinSwapChat,
    sendMessage,
    deleteMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToStatusUpdates,
    unsubscribeFromStatusUpdates,
    subscribeToMessageDeleted,
    unsubscribeFromMessageDeleted,
  } = useSocket();

  const [swap, setSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [initialUnreadId, setInitialUnreadId] = useState(null);
  const [initialUnreadCount, setInitialUnreadCount] = useState(0);
  const [isDividerDismissed, setIsDividerDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null); // Permanent access errors
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const currentUserId = user?._id || user?.id;

  // Active swapId ref to prevent stale async responses from populating wrong chat
  const activeSwapIdRef = useRef(swapId);
  useEffect(() => {
    activeSwapIdRef.current = swapId;
  }, [swapId]);

  // Race-safe message merging helper for same swapId
  const mergeMessages = useCallback((currentMsgs, newMsgs) => {
    const map = new Map();
    (currentMsgs || []).forEach((m) => {
      if (m && m._id) map.set(m._id, m);
    });
    (newMsgs || []).forEach((m) => {
      if (m && m._id) map.set(m._id, m);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, []);

  // Real-time message listener callback
  const handleNewMessage = useCallback(
    (incomingMsg) => {
      if (!incomingMsg || !incomingMsg.swapRequest) return;

      const msgSwapId =
        typeof incomingMsg.swapRequest === "object"
          ? incomingMsg.swapRequest._id
          : incomingMsg.swapRequest;

      // Strict validation: message MUST belong to currently active swapId
      if (msgSwapId?.toString() === activeSwapIdRef.current?.toString()) {
        setMessages((prev) => mergeMessages(prev, [incomingMsg]));
      }
    },
    [mergeMessages]
  );

  // Real-time message status updates (sent -> delivered -> read)
  const handleStatusUpdate = useCallback(
    (payload) => {
      if (!payload) return;

      if (payload.type === "read" && payload.swapId?.toString() === activeSwapIdRef.current?.toString()) {
        const readMsgIds = Array.isArray(payload.messageIds)
          ? new Set(payload.messageIds.map((id) => id.toString()))
          : null;

        setMessages((prev) =>
          prev.map((msg) => {
            const msgIdStr = (msg._id || msg.id)?.toString();
            const senderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString();
            const isOwn = currentUserId && senderId === currentUserId.toString();
            
            const isMatch = readMsgIds
              ? readMsgIds.has(msgIdStr)
              : isOwn;

            if (isMatch) {
              return { ...msg, status: "read", readAt: payload.readAt || new Date() };
            }
            return msg;
          })
        );
      } else if (payload.type === "delivered") {
        setMessages((prev) =>
          prev.map((msg) => {
            const senderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString();
            const isOwn = currentUserId && senderId === currentUserId.toString();
            if (isOwn && msg.status === "sent") {
              return { ...msg, status: "delivered" };
            }
            return msg;
          })
        );
      }
    },
    [currentUserId]
  );

  // Real-time message_deleted callback (updates target message AND any replies referencing it)
  const handleMessageDeleted = useCallback((payload) => {
    if (!payload || !payload.messageId || !payload.swapId) return;

    if (payload.swapId.toString() === activeSwapIdRef.current?.toString()) {
      const deletedIdStr = payload.messageId.toString();

      setMessages((prev) =>
        prev.map((msg) => {
          const msgIdStr = (msg._id || msg.id)?.toString();
          let updatedMsg = msg;

          // Update target message if it matches deleted ID
          if (msgIdStr === deletedIdStr) {
            updatedMsg = {
              ...updatedMsg,
              isDeleted: true,
              deletedAt: payload.deletedAt || new Date(),
              content: "",
            };
          }

          // ALSO update replyTo reference if it points to the deleted message
          if (updatedMsg.replyTo) {
            const replyToIdStr = (
              updatedMsg.replyTo._id ||
              updatedMsg.replyTo.id ||
              updatedMsg.replyTo
            )?.toString();

            if (replyToIdStr === deletedIdStr) {
              updatedMsg = {
                ...updatedMsg,
                replyTo: {
                  ...(typeof updatedMsg.replyTo === "object"
                    ? updatedMsg.replyTo
                    : {}),
                  isDeleted: true,
                  content: "",
                },
              };
            }
          }

          return updatedMsg;
        })
      );

      // Also update replyingTo composer preview if currently replying to the deleted message
      setReplyingTo((prev) => {
        if (!prev) return null;
        const prevIdStr = (prev._id || prev.id)?.toString();
        if (prevIdStr === deletedIdStr) {
          return { ...prev, isDeleted: true, content: "" };
        }
        return prev;
      });
    }
  }, []);

  // Predictable Lifecycle for active swapId: Clear state -> SwapDetails -> History -> Subscribe -> Join -> Read -> Ready
  useEffect(() => {
    let isMounted = true;
    const currentSwapId = swapId;

    // 1. Immediately reset message & page state when swapId changes
    setMessages([]);
    setSwap(null);
    setPageError(null);
    setInitialUnreadId(null);
    setInitialUnreadCount(0);
    setIsDividerDismissed(false);
    setReplyingTo(null);
    setLoading(true);

    const initializeChat = async () => {
      try {
        // Step 1: Validate SwapRequest details & user access for currentSwapId
        const swapData = await swapService.getSwapDetails(currentSwapId);

        // Guard against unmounted component or stale user navigation (e.g. A -> B -> C)
        if (!isMounted || activeSwapIdRef.current !== currentSwapId) return;

        const activeSwap = swapData?.data || (swapData?.status ? swapData : null);

        if (!activeSwap) {
          setPageError({
            code: "SWAP_NOT_FOUND",
            message: "Swap request details could not be loaded.",
          });
          setLoading(false);
          return;
        }

        if (activeSwap.status !== "accepted") {
          setPageError({
            code: "SWAP_NOT_ACCEPTED",
            message: "Chat is only available for accepted skill swap requests.",
          });
          setLoading(false);
          return;
        }

        setSwap(activeSwap);

        // Step 2: Fetch persisted message history for currentSwapId
        try {
          const historyRes = await chatService.getMessageHistory(currentSwapId);
          if (
            isMounted &&
            activeSwapIdRef.current === currentSwapId &&
            historyRes?.success &&
            Array.isArray(historyRes.data)
          ) {
            const historyMsgs = historyRes.data;

            // Capture FIRST incoming unread message AND total unread count BEFORE mark-as-read alters status
            const unreadIncoming = historyMsgs.filter((m) => {
              const senderId = m.sender?._id || m.sender?.id || m.sender;
              return (
                senderId?.toString() !== currentUserId?.toString() &&
                m.status !== "read" &&
                !m.isDeleted
              );
            });

            const firstUnread = unreadIncoming.length > 0 ? unreadIncoming[0] : null;
            const firstUnreadId = firstUnread ? (firstUnread._id || firstUnread.id)?.toString() : null;

            setInitialUnreadId(firstUnreadId);
            setInitialUnreadCount(unreadIncoming.length);
            setIsDividerDismissed(false);
            setMessages(historyMsgs);
          }
        } catch (histErr) {
          console.error("Failed to load message history:", histErr);
          if (isMounted && activeSwapIdRef.current === currentSwapId) {
            setToast({
              show: true,
              message: "Could not load complete message history. Real-time chat is active.",
              type: "warning",
            });
          }
        }

        // Step 3: Register subscribers
        subscribeToMessages(handleNewMessage);
        subscribeToStatusUpdates(handleStatusUpdate);
        subscribeToMessageDeleted(handleMessageDeleted);

        // Step 4: Join Socket.io room for currentSwapId
        try {
          await joinSwapChat(currentSwapId);
        } catch (joinErr) {
          console.warn("Socket room join warning:", joinErr);
        }

        if (isMounted && activeSwapIdRef.current === currentSwapId) {
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted || activeSwapIdRef.current !== currentSwapId) return;
        console.error("Chat initialization error:", err);

        const status = err.response?.status;
        const errMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to access chat room.";

        if (status === 404 || err.code === "SWAP_NOT_FOUND") {
          setPageError({ code: "SWAP_NOT_FOUND", message: "Swap request not found." });
        } else if (status === 403 || err.code === "FORBIDDEN") {
          setPageError({
            code: "FORBIDDEN",
            message: "Access denied. You are not a participant in this swap request.",
          });
        } else if (status === 400 || err.code === "INVALID_SWAP_ID") {
          setPageError({
            code: "INVALID_SWAP_ID",
            message: "Invalid swap request ID format.",
          });
        } else if (!err.response) {
          // Temporary network / backend offline error
          setToast({
            show: true,
            message: "Backend server is offline or unreachable. Reconnecting…",
            type: "warning",
          });
        } else {
          setPageError({
            code: "SERVER_ERROR",
            message: errMsg,
          });
        }
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup: Unsubscribe listeners for currentSwapId on unmount or swapId change
    return () => {
      isMounted = false;
      unsubscribeFromMessages(handleNewMessage);
      unsubscribeFromStatusUpdates(handleStatusUpdate);
      unsubscribeFromMessageDeleted(handleMessageDeleted);
    };
  }, [
    swapId,
    isConnected,
    joinSwapChat,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToStatusUpdates,
    unsubscribeFromStatusUpdates,
    subscribeToMessageDeleted,
    unsubscribeFromMessageDeleted,
    handleNewMessage,
    handleStatusUpdate,
    handleMessageDeleted,
  ]);

  const handleSelectReply = useCallback((msg) => {
    setReplyingTo(msg);
  }, []);

  // Handle message sending
  const handleSendMessage = async (content) => {
    if (!content || isSending || !swapId) return false;

    setIsSending(true);
    try {
      const replyToId = replyingTo ? (replyingTo._id || replyingTo.id) : null;
      const response = await sendMessage(swapId, content, replyToId);

      // If ACK returned saved message, merge safely if still on same swapId
      if (
        response &&
        response.success &&
        response.data &&
        activeSwapIdRef.current === swapId
      ) {
        setMessages((prev) => mergeMessages(prev, [response.data]));
      }

      // Clear replyingTo state & dismiss unread divider ONLY AFTER successful send
      setReplyingTo(null);
      setIsDividerDismissed(true);
      setIsSending(false);
      return true;
    } catch (err) {
      console.error("Send message failed:", err);
      setIsSending(false);

      setToast({
        show: true,
        message:
          err.message ||
          err.data?.message ||
          "Failed to send message. Please try again.",
        type: "error",
      });
      return false;
    }
  };

  // Handle message deletion (REST mutation)
  const handleDeleteMessage = async (messageId) => {
    if (!swapId || !messageId) return false;

    try {
      const response = await deleteMessage(swapId, messageId);

      if (response && response.success && activeSwapIdRef.current === swapId) {
        setMessages((prev) =>
          prev.map((msg) => {
            const msgIdStr = (msg._id || msg.id)?.toString();
            if (msgIdStr === messageId.toString()) {
              return {
                ...msg,
                isDeleted: true,
                deletedAt: response.data?.deletedAt || new Date(),
                content: "",
              };
            }
            return msg;
          })
        );
      }
      return true;
    } catch (err) {
      console.error("Delete message failed:", err);
      setToast({
        show: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete message. Please try again.",
        type: "error",
      });
      return false;
    }
  };

  // Filter visible messages strictly to active swapId
  const visibleMessages = messages.filter((m) => {
    if (!m) return false;
    const msgSwapId =
      typeof m.swapRequest === "object" ? m.swapRequest._id : m.swapRequest;
    return msgSwapId?.toString() === swapId?.toString();
  });

  // Render Page-Level Permanent Access Errors
  if (pageError) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] text-[#16160F] flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white border border-[#E6E3DA] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto shrink-0">
            {pageError.code === "FORBIDDEN" ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#16160F]">
              {pageError.code === "SWAP_NOT_ACCEPTED"
                ? "Chat Not Available"
                : pageError.code === "FORBIDDEN"
                ? "Access Denied"
                : "Swap Not Found"}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6858] leading-relaxed">
              {pageError.message}
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/chats"
              className="w-full py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs sm:text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Conversations</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F7F6F2] text-[#16160F] font-sans antialiased overflow-hidden">
      {/* Toast Notification Container */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast({ show: false, message: "", type: "info" })}
      />

      {/* Header */}
      <ChatHeader
        swap={swap}
        currentUserId={currentUserId}
        isConnected={isConnected}
        connectionError={connectionError}
      />

      {/* Scrollable Message List */}
      <main className="flex-1 flex flex-col min-h-0 w-full">
        <MessageList
          messages={visibleMessages}
          currentUserId={currentUserId}
          loading={loading}
          initialUnreadId={initialUnreadId}
          initialUnreadCount={initialUnreadCount}
          isDividerDismissed={isDividerDismissed}
          swapId={swapId}
          onMarkMessagesRead={markSwapAsRead}
          onDeleteMessage={handleDeleteMessage}
          onSelectReply={handleSelectReply}
        />
      </main>

      {/* Bottom Message Input Bar */}
      <MessageInput
        key={swapId}
        onSendMessage={handleSendMessage}
        isSending={isSending}
        isConnected={isConnected}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
