import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ConversationList from "../components/chat/ConversationList";
import chatService from "../services/chatService";
import useSocket from "../hooks/useSocket";
import ChatPage from "./ChatPage";
import { MessageSquareDashed } from "lucide-react";

export default function ChatsPage() {
  const { swapId } = useParams();
  const navigate = useNavigate();
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

  const handleSelectConversation = (selectedSwapId) => {
    navigate(`/swaps/${selectedSwapId}/chat`);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#F7F6F2] text-[#16160F] font-sans antialiased flex flex-col overflow-hidden">
      {/* Top Application Navbar */}
      <Navbar />

      {/* Main Two-Panel Chat Workspace (Full Viewport Height & Width Layout) */}
      <div className="flex-1 flex min-h-0 w-full bg-white overflow-hidden">
        {/* Left Sidebar: Conversation List (Fixed 300px width on desktop) */}
        <aside
          className={`w-full md:w-[300px] md:min-w-[300px] md:max-w-[300px] border-r border-[#E6E3DA] flex flex-col bg-white shrink-0 overflow-hidden ${
            swapId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="px-3.5 pt-3 pb-1 shrink-0">
            <h2 className="text-sm font-extrabold text-[#16160F]">
              Conversations
            </h2>
            <p className="text-[11px] text-[#6B6858]">
              Your active accepted skill swaps
            </p>
          </div>

          <ConversationList
            conversations={conversations}
            activeSwapId={swapId}
            loading={loading}
            onSelectConversation={handleSelectConversation}
          />
        </aside>

        {/* Right Main Panel: Active Chat Workspace or Neutral Empty State */}
        <main
          className={`flex-1 flex flex-col min-w-0 bg-[#F7F6F2] overflow-hidden ${
            swapId ? "flex" : "hidden md:flex"
          }`}
        >
          {swapId ? (
            <ChatPage isEmbedded={true} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F7F6F2]">
              <div className="w-14 h-14 rounded-2xl bg-[#E4EEE8] text-[#1B4332] border border-[#1B4332]/20 flex items-center justify-center mb-3 shadow-2xs">
                <MessageSquareDashed className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-[#16160F] mb-1">
                Select a conversation
              </h3>
              <p className="text-xs text-[#6B6858] max-w-xs leading-relaxed">
                Choose an accepted skill swap from the left sidebar to start messaging.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
