import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import swapService from "../services/swapService";
import chatService from "../services/chatService";
import meetingService from "../services/meetingService";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import ConfirmModal from "../components/ConfirmModal";
import ToastNotification from "../components/ToastNotification";
import MeetingOptionsModal from "../components/meetings/MeetingOptionsModal";
import ScheduleMeetingModal from "../components/meetings/ScheduleMeetingModal";
import JitsiMeetingModal from "../components/meetings/JitsiMeetingModal";
import { AlertCircle, ArrowLeft, ShieldAlert, Lock, Info, Clock, Sparkles, Check, X } from "lucide-react";

export default function ChatPage({ isEmbedded = false, swapId: propSwapId = null, allSwaps = null, onSwapChange = null }) {
  const { swapId: urlSwapId } = useParams();
  const navigate = useNavigate();

  // effectiveSwapId: prop takes priority (grouped chat), falls back to URL param (direct link)
  const swapId = propSwapId || urlSwapId;
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
    subscribeToSwapRequests,
    unsubscribeFromSwapRequests,
    subscribeToMeetingUpdates,
    unsubscribeFromMeetingUpdates,
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
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false);

  // Video Meeting States
  const [meetingOptionsOpen, setMeetingOptionsOpen] = useState(false);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [activeMeetingData, setActiveMeetingData] = useState(null);
  const [isStartingInstant, setIsStartingInstant] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const currentUserId = user?._id || user?.id;

  // Derive counterpart profile info safely
  const isSender = swap?.fromUser?._id?.toString() === currentUserId?.toString();
  const counterpart = isSender ? swap?.toUser : swap?.fromUser;
  const counterpartName = counterpart?.name || "Swap Partner";

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

  // Real-time meeting updates (active / cancelled / scheduled)
  const handleMeetingUpdated = useCallback((payload) => {
    if (!payload || !payload.meetingId) return;

    setMessages((prev) =>
      prev.map((msg) => {
        const session = msg.meetingSession;
        const sId = session?._id || session;
        if (msg.type === "meeting" && sId?.toString() === payload.meetingId.toString()) {
          return {
            ...msg,
            meetingSession: {
              ...(typeof session === "object" ? session : {}),
              status: payload.status,
            },
          };
        }
        return msg;
      })
    );
  }, []);

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

  const handleSwapRequestUpdated = useCallback((updatedSwapData) => {
    if (!updatedSwapData) return;
    const updatedId = updatedSwapData._id || updatedSwapData.id;
    if (updatedId?.toString() === swapId?.toString()) {
      setSwap(updatedSwapData);
      if (updatedSwapData.status !== "accepted") {
        setIsReadOnly(true);
      } else {
        setIsReadOnly(false);
      }
    }
  }, [swapId]);

  const handleConfirmCompletionFromChat = async () => {
    try {
      const res = await swapService.confirmCompletion(swapId);
      const updatedSwap = res?.data || res;
      setSwap(updatedSwap);
      if (updatedSwap?.status === "completed") {
        setIsReadOnly(true);
        setToast({
          show: true,
          message: "Swap officially completed!",
          type: "success",
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || "Failed to confirm completion",
        type: "error",
      });
    }
  };

  const handleCancelCompletionFromChat = async () => {
    try {
      const res = await swapService.cancelCompletionRequest(swapId);
      const updatedSwap = res?.data || res;
      setSwap(updatedSwap);
      setToast({
        show: true,
        message: "Completion request updated.",
        type: "info",
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || "Failed to update completion request",
        type: "error",
      });
    }
  };

  // Video Meeting Handlers
  const handleStartInstantMeeting = async () => {
    if (isStartingInstant || !swapId) return;
    setIsStartingInstant(true);
    try {
      const res = await meetingService.createInstantMeeting(swapId);
      setMeetingOptionsOpen(false);
      if (res?.data?.meeting) {
        const joinRes = await meetingService.joinMeeting(res.data.meeting._id);
        setActiveMeetingData(joinRes.data);
      }
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || err.message || "Failed to start instant video session.",
        type: "error",
      });
    } finally {
      setIsStartingInstant(false);
    }
  };

  const handleScheduleMeeting = async (data) => {
    const res = await meetingService.scheduleMeeting({
      swapId,
      ...data,
    });
    setToast({
      show: true,
      message: "Video session scheduled successfully!",
      type: "success",
    });
    return res;
  };

  const handleJoinMeetingFromChat = async (meetingId) => {
    try {
      const res = await meetingService.joinMeeting(meetingId);
      if (res && res.data) {
        setActiveMeetingData(res.data);
      }
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || err.message || "Unable to join video session.",
        type: "error",
      });
    }
  };

  const handleCancelMeetingFromChat = async (meetingId) => {
    try {
      await meetingService.cancelMeeting(meetingId);
      setMessages((prev) =>
        prev.map((msg) => {
          const session = msg.meetingSession;
          const sId = session?._id || session;
          if (msg.type === "meeting" && sId?.toString() === meetingId.toString()) {
            return {
              ...msg,
              meetingSession: {
                ...(typeof session === "object" ? session : {}),
                status: "cancelled",
              },
            };
          }
          return msg;
        })
      );
      setToast({
        show: true,
        message: "Video session cancelled.",
        type: "info",
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || err.message || "Failed to cancel meeting.",
        type: "error",
      });
    }
  };

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
    setIsReadOnly(false);
    setLoading(true);

    const initializeChat = async () => {
      try {
        // Step 1: Fetch persisted message history first to get swap details & status
        const historyRes = await chatService.getMessageHistory(currentSwapId);

        // Guard against unmounted component or stale user navigation (e.g. A -> B -> C)
        if (!isMounted || activeSwapIdRef.current !== currentSwapId) return;

        const activeSwap =
          historyRes?.swapRequest ||
          historyRes?.data?.swapRequest ||
          (historyRes?.data && !Array.isArray(historyRes.data) && historyRes.data.status ? historyRes.data : null);

        const historyMsgs = Array.isArray(historyRes?.data)
          ? historyRes.data
          : Array.isArray(historyRes?.data?.messages)
          ? historyRes.data.messages
          : Array.isArray(historyRes?.messages)
          ? historyRes.messages
          : [];

        const readOnlyFlag = Boolean(
          historyRes?.isReadOnly ??
          historyRes?.data?.isReadOnly ??
          (activeSwap && activeSwap.status !== "accepted")
        );

        setSwap(activeSwap);
        setIsReadOnly(readOnlyFlag);

        // Calculate unread divider anchor
        if (historyMsgs.length > 0) {
          const unreadIncoming = historyMsgs.filter(
            (m) =>
              m.status !== "read" &&
              !m.isDeleted &&
              currentUserId &&
              (m.sender?._id || m.sender?.id || m.sender)?.toString() !== currentUserId.toString()
          );

          const firstUnread = unreadIncoming.length > 0 ? unreadIncoming[0] : null;
          const firstUnreadId = firstUnread ? (firstUnread._id || firstUnread.id)?.toString() : null;

          setInitialUnreadId(firstUnreadId);
          setInitialUnreadCount(unreadIncoming.length);
          setIsDividerDismissed(false);
          setMessages(historyMsgs);
        }

        // Register subscribers
        subscribeToMessages(handleNewMessage);
        subscribeToStatusUpdates(handleStatusUpdate);
        subscribeToMessageDeleted(handleMessageDeleted);
        subscribeToSwapRequests(handleSwapRequestUpdated);
        subscribeToMeetingUpdates(handleMeetingUpdated);

        // Join Socket.io room for currentSwapId (if active)
        if (activeSwap?.status === "accepted") {
          try {
            await joinSwapChat(currentSwapId);
          } catch (joinErr) {
            console.warn("Socket room join warning:", joinErr);
          }
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

        if (status === 404 || err.code === "SWAP_NOT_FOUND" || err.code === "CHAT_DELETED") {
          setPageError({
            code: "SWAP_NOT_FOUND",
            message: err.code === "CHAT_DELETED"
              ? "This conversation was removed from your history."
              : "Swap request not found or has been deleted.",
          });
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
      unsubscribeFromSwapRequests(handleSwapRequestUpdated);
      unsubscribeFromMeetingUpdates(handleMeetingUpdated);
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
    subscribeToSwapRequests,
    unsubscribeFromSwapRequests,
    subscribeToMeetingUpdates,
    unsubscribeFromMeetingUpdates,
    handleNewMessage,
    handleStatusUpdate,
    handleMessageDeleted,
    handleSwapRequestUpdated,
    handleMeetingUpdated,
    currentUserId
  ]);

  const handleSelectReply = useCallback((msg) => {
    if (isReadOnly) return;
    setReplyingTo(msg);
  }, [isReadOnly]);

  // Handle message sending (via Socket.io with REST fallback)
  const handleSendMessage = async (text, replyToId = null) => {
    if (!text || !swapId || isSending || isReadOnly) return false;

    setIsSending(true);
    try {
      const response = await sendMessage(swapId, text, replyToId);

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
    if (!swapId || !messageId || isReadOnly) return false;

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

  // Handle Per-User Archived Chat Deletion
  const handleDeleteHistory = async () => {
    if (!swapId || !isReadOnly) return;

    try {
      await chatService.deleteChatForMe(swapId);
      setToast({
        show: true,
        message: "Conversation removed from your history.",
        type: "success",
      });
      setTimeout(() => {
        navigate("/swaps?tab=history");
      }, 500);
    } catch (err) {
      console.error("Delete chat history error:", err);
      setToast({
        show: true,
        message: err.response?.data?.message || "Failed to remove conversation from history.",
        type: "error",
      });
    }
  };

  // Filter visible messages strictly to active swapId
  const visibleMessages = messages.filter((m) => {
    if (!m) return false;
    const msgSwapId =
      typeof m.swapRequest === "object" ? m.swapRequest._id : m.swapRequest;
    return msgSwapId?.toString() === swapId?.toString();
  });  // Render Page-Level Permanent Access Errors
  if (pageError) {
    return (
      <div className="h-[100dvh] max-h-[100dvh] bg-[#F7F6F2] text-[#16160F] font-sans antialiased flex flex-col overflow-hidden">
        {!isEmbedded && <Navbar />}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
                to="/swaps?tab=history"
                className="w-full py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs sm:text-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Swap History</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const endedDateFormatted = swap?.endedAt
    ? new Date(swap.endedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : swap?.updatedAt
    ? new Date(swap.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "an earlier date";

  const chatContent = (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#F7F6F2] text-[#16160F] font-sans antialiased overflow-hidden">
      {/* Toast Notification Container */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast({ show: false, message: "", type: "info" })}
      />

      {/* Delete Chat History Confirmation Modal */}
      {showDeleteHistoryModal && (
        <ConfirmModal
          isOpen={showDeleteHistoryModal}
          title="Delete Conversation from History?"
          message="Delete this conversation from your history? This will only remove it for you. Your swap partner will still be able to access their copy."
          confirmText="Delete for Me"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={() => {
            setShowDeleteHistoryModal(false);
            handleDeleteHistory();
          }}
          onCancel={() => setShowDeleteHistoryModal(false)}
        />
      )}

      {/* Header */}
      <ChatHeader
        swap={swap}
        currentUserId={currentUserId}
        isConnected={isConnected}
        connectionError={connectionError}
        isReadOnly={isReadOnly}
        onDeleteHistory={() => setShowDeleteHistoryModal(true)}
        allSwaps={allSwaps}
        activeSwapId={swapId}
        onSwapChange={onSwapChange}
        onOpenVideoMenu={() => setMeetingOptionsOpen(true)}
      />

      {/* Completion Request Pending Banner in Active Chat Workspace */}
      {!isReadOnly && swap?.status === "accepted" && swap?.completionRequestedBy && (
        <div
          className={`px-4 py-3 border-b text-xs flex items-center justify-between gap-3 shrink-0 flex-wrap ${
            String(swap.completionRequestedBy?._id || swap.completionRequestedBy?.id || swap.completionRequestedBy) === String(currentUserId)
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {String(swap.completionRequestedBy?._id || swap.completionRequestedBy?.id || swap.completionRequestedBy) === String(currentUserId) ? (
              <>
                <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                <span className="font-semibold">
                  Completion request sent. Waiting for partner to confirm.
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  {swap.completionRequestedBy?.name || "Your swap partner"} has requested to mark this swap as completed.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {String(swap.completionRequestedBy?._id || swap.completionRequestedBy?.id || swap.completionRequestedBy) === String(currentUserId) ? (
              <button
                type="button"
                onClick={handleCancelCompletionFromChat}
                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition-all text-xs cursor-pointer"
              >
                Cancel Request
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelCompletionFromChat}
                  className="px-3 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold rounded-lg transition-all text-xs cursor-pointer"
                >
                  Not Yet
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCompletionFromChat}
                  className="px-3.5 py-1 bg-[#1B4332] hover:bg-[#143326] text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-2xs"
                >
                  Confirm Completion
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Read-Only Informational Banner */}
      {isReadOnly && (
        <div className="bg-[#E4EEE8] border-b border-[#1B4332]/20 px-4 py-2.5 text-center text-xs font-bold text-[#1B4332] flex items-center justify-center gap-2 shrink-0">
          <Info className="w-4 h-4 text-[#1B4332] shrink-0" />
          <span>
            {swap?.status === "completed"
              ? `This swap was completed on ${endedDateFormatted}. This conversation is now read-only.`
              : `This swap ended on ${endedDateFormatted}. This conversation is now read-only.`}
          </span>
        </div>
      )}

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
          isReadOnly={isReadOnly}
          onMarkMessagesRead={markSwapAsRead}
          onDeleteMessage={isReadOnly ? undefined : handleDeleteMessage}
          onSelectReply={isReadOnly ? undefined : handleSelectReply}
          onJoinMeeting={handleJoinMeetingFromChat}
          onCancelMeeting={handleCancelMeetingFromChat}
        />
      </main>

      {/* Bottom Message Input Bar or Read-Only Locked Bar */}
      {isReadOnly ? (
        <div className="p-4 bg-white border-t border-[#E6E3DA] text-center text-xs font-semibold text-[#6B6858] flex items-center justify-center gap-2 shrink-0">
          <Lock className="w-3.5 h-3.5 text-[#6B6858]" />
          <span>This conversation is read-only because the swap has ended.</span>
        </div>
      ) : (
        <MessageInput
          key={swapId}
          onSendMessage={handleSendMessage}
          isSending={isSending}
          isConnected={isConnected}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      )}

      {/* Meeting Options Modal */}
      <MeetingOptionsModal
        isOpen={meetingOptionsOpen}
        onClose={() => setMeetingOptionsOpen(false)}
        partnerName={counterpartName}
        onStartInstant={handleStartInstantMeeting}
        onOpenSchedule={() => setScheduleMeetingOpen(true)}
        isStarting={isStartingInstant}
      />

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={scheduleMeetingOpen}
        onClose={() => setScheduleMeetingOpen(false)}
        partnerName={counterpartName}
        onSchedule={handleScheduleMeeting}
      />

      {/* Embedded Jitsi Video Session Modal */}
      {activeMeetingData && (
        <JitsiMeetingModal
          isOpen={Boolean(activeMeetingData)}
          onClose={() => setActiveMeetingData(null)}
          meetingData={activeMeetingData}
          currentUser={user}
        />
      )}
    </div>
  );

  if (isEmbedded) {
    return chatContent;
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#F7F6F2] text-[#16160F] font-sans antialiased flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-0 w-full bg-white overflow-hidden">
        {chatContent}
      </div>
    </div>
  );
}
