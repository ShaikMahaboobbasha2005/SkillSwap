import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConversationList from "../components/chat/ConversationList";
import chatService from "../services/chatService";
import useSocket from "../hooks/useSocket";
import useAuth from "../hooks/useAuth";
import ChatPage from "./ChatPage";
import { MessageSquareDashed } from "lucide-react";
import { getSwapActivityTimestamp } from "../utils/dateUtils";

/**
 * Resolves the user-relative skill context string for a conversation entry.
 * Used for sidebar display of the most recently active swap's skill pair.
 */
function getSkillContext(conv) {
  const offered = conv.offeredSkillName;
  const learned = conv.learnedSkillName;
  if (offered && learned) return `${offered} ↔ ${learned}`;
  return offered || learned || "Skill Swap";
}

export default function ChatsPage() {
  const { swapId: urlSwapId, userId: urlUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const {
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToStatusUpdates,
    unsubscribeFromStatusUpdates,
    subscribeToUnreadUpdates,
    unsubscribeFromUnreadUpdates,
  } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active swap selection state (managed here, not in URL)
  const [activeSwapId, setActiveSwapId] = useState(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await chatService.getConversations();
      if (res && res.success && Array.isArray(res.data)) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Listen for real-time messages, status & unread updates to refresh conversation list previews
  const handleRealtimeUpdate = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    subscribeToMessages(handleRealtimeUpdate);
    subscribeToStatusUpdates(handleRealtimeUpdate);
    subscribeToUnreadUpdates(handleRealtimeUpdate);
    return () => {
      unsubscribeFromMessages(handleRealtimeUpdate);
      unsubscribeFromStatusUpdates(handleRealtimeUpdate);
      unsubscribeFromUnreadUpdates(handleRealtimeUpdate);
    };
  }, [
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToStatusUpdates,
    unsubscribeFromStatusUpdates,
    subscribeToUnreadUpdates,
    unsubscribeFromUnreadUpdates,
    handleRealtimeUpdate,
  ]);

  // ──────────────────────────────────────────────────
  // Group conversations by counterpart user ID
  // ──────────────────────────────────────────────────
  const groupedConversations = useMemo(() => {
    const grouped = new Map();

    conversations.forEach((conv) => {
      const counterpartId = conv.counterpart?._id;

      // Guard: skip malformed conversations that lack counterpart ID
      if (!counterpartId) return;

      const key = counterpartId.toString();
      if (!grouped.has(key)) {
        grouped.set(key, {
          counterpartId: key,
          counterpart: conv.counterpart,
          swaps: [],
          totalUnreadCount: 0,
        });
      }

      const group = grouped.get(key);
      group.swaps.push(conv);
      group.totalUnreadCount += conv.unreadCount || 0;
    });

    // Sort swaps within each group by activity (most recent first) and compute display fields
    grouped.forEach((group) => {
      group.swaps.sort(
        (a, b) => getSwapActivityTimestamp(b) - getSwapActivityTimestamp(a)
      );

      const latest = group.swaps[0];
      group.latestActivityAt = latest?.lastActivityAt;
      group.latestLastMessage = latest?.lastMessage;
      group.latestSkillContext = getSkillContext(latest);
    });

    // Sort groups by latest activity, newest first
    return Array.from(grouped.values()).sort((a, b) => {
      const tsA = a.swaps[0] ? getSwapActivityTimestamp(a.swaps[0]) : 0;
      const tsB = b.swaps[0] ? getSwapActivityTimestamp(b.swaps[0]) : 0;
      return tsB - tsA;
    });
  }, [conversations]);

  // ──────────────────────────────────────────────────
  // Determine active user and active swap from route
  // ──────────────────────────────────────────────────

  // Derive the active user ID from URL
  const activeUserId = useMemo(() => {
    // Route A: /chats/:userId — directly from URL param
    if (urlUserId) return urlUserId;

    // Route B: /swaps/:swapId/chat — find the counterpart from the matching conversation
    if (urlSwapId) {
      const matchingConv = conversations.find(
        (c) => c.swapId?.toString() === urlSwapId.toString()
      );
      return matchingConv?.counterpart?._id?.toString() || null;
    }

    return null;
  }, [urlUserId, urlSwapId, conversations]);

  // All swaps for the active user (used by ChatPage/ChatHeader/SwapSelector)
  const allSwapsForActiveUser = useMemo(() => {
    if (!activeUserId) return [];
    const group = groupedConversations.find(
      (g) => g.counterpartId === activeUserId.toString()
    );
    return group?.swaps || [];
  }, [activeUserId, groupedConversations]);

  // Auto-select the active swap when route or conversations change
  useEffect(() => {
    if (!activeUserId) {
      setActiveSwapId(null);
      return;
    }

    // Route B: /swaps/:swapId/chat — use exact swap, no auto-selection override
    if (urlSwapId) {
      setActiveSwapId(urlSwapId);
      return;
    }

    // Route A: /chats/:userId — auto-select most recently active swap
    if (allSwapsForActiveUser.length > 0) {
      // Check if current activeSwapId is still in the user's swap list
      const currentStillValid = allSwapsForActiveUser.some(
        (s) => (s.swapId || s.swap?._id)?.toString() === activeSwapId?.toString()
      );

      // Only auto-select if there's no valid current selection
      if (!currentStillValid) {
        const mostRecent = allSwapsForActiveUser[0]; // Already sorted by activity
        const swapId = (mostRecent.swapId || mostRecent.swap?._id)?.toString();
        setActiveSwapId(swapId);
      }
    } else {
      setActiveSwapId(null);
    }
  }, [activeUserId, urlSwapId, allSwapsForActiveUser]);

  // ──────────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────────

  const handleSelectConversation = (counterpartId) => {
    navigate(`/chats/${counterpartId}`);
  };

  const handleSwapChange = useCallback((newSwapId) => {
    setActiveSwapId(newSwapId);
  }, []);

  // Determine if we have a selected conversation to show
  const hasActiveChat = activeUserId && activeSwapId;

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#F7F6F2] dark:bg-[#0F1210] text-[#16160F] dark:text-[#F2F1EC] font-sans antialiased flex flex-col overflow-hidden">
      {/* Top Application Navbar */}
      <Navbar />

      {/* Main Two-Panel Chat Workspace (Full Viewport Height & Width Layout) */}
      <div className="flex-1 flex min-h-0 w-full bg-white dark:bg-[#181B18] overflow-hidden">
        {/* Left Sidebar: Conversation List (Fixed 300px width on desktop) */}
        <aside
          className={`w-full md:w-[300px] md:min-w-[300px] md:max-w-[300px] border-r border-[#E6E3DA] dark:border-[#2A2E29] flex flex-col bg-white dark:bg-[#181B18] shrink-0 overflow-hidden ${
            hasActiveChat ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="px-3.5 pt-3 pb-1 shrink-0">
            <h2 className="text-sm font-extrabold text-[#16160F] dark:text-[#F2F1EC]">
              Conversations
            </h2>
            <p className="text-[11px] text-[#6B6858] dark:text-[#9C9A8C]">
              Your active accepted skill swaps
            </p>
          </div>

          <ConversationList
            groupedConversations={groupedConversations}
            activeUserId={activeUserId}
            loading={loading}
            onSelectConversation={handleSelectConversation}
          />
        </aside>

        {/* Right Main Panel: Active Chat Workspace or Neutral Empty State */}
        <main
          className={`flex-1 flex flex-col min-w-0 bg-[#F7F6F2] dark:bg-[#0F1210] overflow-hidden ${
            hasActiveChat ? "flex" : "hidden md:flex"
          }`}
        >
          {hasActiveChat ? (
            <ChatPage
              isEmbedded={true}
              swapId={activeSwapId}
              allSwaps={allSwapsForActiveUser}
              onSwapChange={handleSwapChange}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F7F6F2] dark:bg-[#0F1210]">
              <div className="w-14 h-14 rounded-2xl bg-[#E4EEE8] dark:bg-[#1C2E24] text-[#1B4332] dark:text-[#3FA873] border border-[#1B4332]/20 dark:border-[#3FA873]/30 flex items-center justify-center mb-3 shadow-2xs">
                <MessageSquareDashed className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-[#16160F] dark:text-[#F2F1EC] mb-1">
                Select a conversation
              </h3>
              <p className="text-xs text-[#6B6858] dark:text-[#9C9A8C] max-w-xs leading-relaxed">
                Choose an accepted skill swap from the left sidebar to start messaging.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
