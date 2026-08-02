import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";
import chatService from "../services/chatService";

export const SocketContext = createContext(null);

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }
  return "http://localhost:5000";
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);
  const messageListenerMap = useRef(new Map());
  const statusListenerMap = useRef(new Map());
  const swapRequestListenerMap = useRef(new Map());
  const unreadListenerMap = useRef(new Map());

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const currentUserId = user?._id || user?.id;

  // Fetch initial total unread count on login / auth change
  const refreshUnreadCount = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setTotalUnreadCount(0);
      return;
    }
    try {
      const res = await chatService.getUnreadCount();
      if (res && res.success && typeof res.data?.totalUnreadCount === "number") {
        setTotalUnreadCount(res.data.totalUnreadCount);
      }
    } catch (err) {
      console.warn("Failed to fetch total unread count:", err.message);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    // Logged out or unauthenticated: clean up active socket connection
    if (!token || !isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setConnectionError(null);
      setTotalUnreadCount(0);
      messageListenerMap.current.clear();
      statusListenerMap.current.clear();
      swapRequestListenerMap.current.clear();
      unreadListenerMap.current.clear();
      return;
    }

    const socketUrl = getSocketUrl();
    if (!socketUrl) {
      console.error(
        "Socket URL configuration missing: VITE_SOCKET_URL or VITE_API_URL must be defined."
      );
      setConnectionError("CONFIGURATION_ERROR");
      setIsConnected(false);
      return;
    }

    // Clean up existing socket if switching tokens
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      messageListenerMap.current.clear();
      statusListenerMap.current.clear();
      swapRequestListenerMap.current.clear();
      unreadListenerMap.current.clear();
    }

    const socket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected successfully:", socket.id);
      setIsConnected(true);
      setConnectionError(null);
      refreshUnreadCount();
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err?.message || err, err?.data);
      setIsConnected(false);
      setConnectionError(err?.data?.code || err?.message || "Connection error");
    });

    // Auto-update unread count when new message arrives for current user
    socket.on("new_message", (payload) => {
      const msg = payload?.data;
      if (msg) {
        const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
        if (currentUserId && senderId?.toString() !== currentUserId?.toString()) {
          setTotalUnreadCount((prev) => prev + 1);
        }
      }
    });

    // Global chat unread count update listener (emitted to personal room user:<userId>)
    socket.on("chat_unread_update", (payload) => {
      const data = payload?.data;
      if (data && typeof data.totalUnreadCount === "number") {
        setTotalUnreadCount(data.totalUnreadCount);
      } else {
        refreshUnreadCount();
      }
    });

    // Re-attach all registered component listeners to new socket instance
    messageListenerMap.current.forEach((wrapper) => {
      socket.on("new_message", wrapper);
    });
    statusListenerMap.current.forEach((wrapper) => {
      socket.on("messages_status_update", wrapper);
    });
    swapRequestListenerMap.current.forEach((wrapper) => {
      socket.on("swap_request_created", wrapper);
      socket.on("swap_request_updated", wrapper);
    });
    unreadListenerMap.current.forEach((wrapper) => {
      socket.on("chat_unread_update", wrapper);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      messageListenerMap.current.clear();
      statusListenerMap.current.clear();
    };
  }, [token, isAuthenticated, currentUserId, refreshUnreadCount]);

  const joinSwapChat = useCallback((swapId) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !socketRef.current.connected) {
        return reject({
          success: false,
          code: "SOCKET_NOT_CONNECTED",
          message: "Real-time connection is not available.",
        });
      }

      socketRef.current.emit("join_swap_chat", { swapId }, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(
            response || {
              success: false,
              code: "FORBIDDEN",
              message: "Failed to join chat room.",
            }
          );
        }
      });
    });
  }, []);

  const sendMessage = useCallback((swapId, content) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !socketRef.current.connected) {
        return reject({
          success: false,
          code: "SOCKET_NOT_CONNECTED",
          message: "Real-time connection is not available.",
        });
      }

      socketRef.current.emit("send_message", { swapId, content }, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(
            response || {
              success: false,
              code: "SERVER_ERROR",
              message: "Failed to send message.",
            }
          );
        }
      });
    });
  }, []);

  const markSwapAsRead = useCallback(
    async (swapId) => {
      try {
        const res = await chatService.markAsRead(swapId);
        if (res && res.success && typeof res.data?.totalUnreadCount === "number") {
          setTotalUnreadCount(res.data.totalUnreadCount);
        }
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("mark_messages_read", { swapId });
        }
        return res;
      } catch (err) {
        console.warn("Failed to mark swap as read:", err.message);
      }
    },
    []
  );

  const subscribeToMessages = useCallback((callback) => {
    if (typeof callback !== "function") return;
    if (messageListenerMap.current.has(callback)) return; // Prevent duplicate

    const wrapper = (payload) => {
      if (payload && payload.success && payload.data) {
        callback(payload.data);
      }
    };

    messageListenerMap.current.set(callback, wrapper);
    if (socketRef.current) {
      socketRef.current.on("new_message", wrapper);
    }
  }, []);

  const unsubscribeFromMessages = useCallback((callback) => {
    if (typeof callback !== "function") return;
    const wrapper = messageListenerMap.current.get(callback);
    if (wrapper) {
      if (socketRef.current) {
        socketRef.current.off("new_message", wrapper);
      }
      messageListenerMap.current.delete(callback);
    }
  }, []);

  const subscribeToStatusUpdates = useCallback((callback) => {
    if (typeof callback !== "function") return;
    if (statusListenerMap.current.has(callback)) return;

    const wrapper = (payload) => {
      callback(payload);
    };

    statusListenerMap.current.set(callback, wrapper);
    if (socketRef.current) {
      socketRef.current.on("messages_status_update", wrapper);
    }
  }, []);

  const unsubscribeFromStatusUpdates = useCallback((callback) => {
    if (typeof callback !== "function") return;
    const wrapper = statusListenerMap.current.get(callback);
    if (wrapper) {
      if (socketRef.current) {
        socketRef.current.off("messages_status_update", wrapper);
      }
      statusListenerMap.current.delete(callback);
    }
  }, []);

  const subscribeToSwapRequests = useCallback((callback) => {
    if (typeof callback !== "function") return;
    if (swapRequestListenerMap.current.has(callback)) return; // Prevent duplicate

    const wrapper = (payload) => {
      if (payload && payload.data) {
        callback(payload.data, payload);
      }
    };

    swapRequestListenerMap.current.set(callback, wrapper);
    if (socketRef.current) {
      socketRef.current.on("swap_request_created", wrapper);
      socketRef.current.on("swap_request_updated", wrapper);
    }
  }, []);

  const unsubscribeFromSwapRequests = useCallback((callback) => {
    if (typeof callback !== "function") return;
    const wrapper = swapRequestListenerMap.current.get(callback);
    if (wrapper) {
      if (socketRef.current) {
        socketRef.current.off("swap_request_created", wrapper);
        socketRef.current.off("swap_request_updated", wrapper);
      }
      swapRequestListenerMap.current.delete(callback);
    }
  }, []);

  const subscribeToUnreadUpdates = useCallback((callback) => {
    if (typeof callback !== "function") return;
    if (unreadListenerMap.current.has(callback)) return;

    const wrapper = (payload) => {
      callback(payload);
    };

    unreadListenerMap.current.set(callback, wrapper);
    if (socketRef.current) {
      socketRef.current.on("chat_unread_update", wrapper);
    }
  }, []);

  const unsubscribeFromUnreadUpdates = useCallback((callback) => {
    if (typeof callback !== "function") return;
    const wrapper = unreadListenerMap.current.get(callback);
    if (wrapper) {
      if (socketRef.current) {
        socketRef.current.off("chat_unread_update", wrapper);
      }
      unreadListenerMap.current.delete(callback);
    }
  }, []);

  const value = {
    isConnected,
    connectionError,
    totalUnreadCount,
    refreshUnreadCount,
    markSwapAsRead,
    joinSwapChat,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToStatusUpdates,
    unsubscribeFromStatusUpdates,
    subscribeToSwapRequests,
    unsubscribeFromSwapRequests,
    subscribeToUnreadUpdates,
    unsubscribeFromUnreadUpdates,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
