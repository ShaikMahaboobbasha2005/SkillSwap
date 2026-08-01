import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";

export const SocketContext = createContext(null);

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }
  return null;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const listenerMap = useRef(new Map());

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Logged out or unauthenticated: clean up active socket connection
    if (!token || !isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setConnectionError(null);
      listenerMap.current.clear();
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
      listenerMap.current.clear();
    }

    // Instantiate Socket.io connection with JWT authentication
    const socket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setConnectionError(err?.data?.code || err?.message || "Connection error");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      listenerMap.current.clear();
    };
  }, [token, isAuthenticated]);

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

  const subscribeToMessages = useCallback((callback) => {
    if (typeof callback !== "function") return;
    if (listenerMap.current.has(callback)) return; // Ignore duplicate registrations

    const wrapper = (payload) => {
      if (payload && payload.success && payload.data) {
        callback(payload.data);
      }
    };

    listenerMap.current.set(callback, wrapper);
    if (socketRef.current) {
      socketRef.current.on("new_message", wrapper);
    }
  }, []);

  const unsubscribeFromMessages = useCallback((callback) => {
    if (typeof callback !== "function") return;
    const wrapper = listenerMap.current.get(callback);
    if (wrapper) {
      if (socketRef.current) {
        socketRef.current.off("new_message", wrapper);
      }
      listenerMap.current.delete(callback);
    }
  }, []);

  const value = {
    isConnected,
    connectionError,
    joinSwapChat,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
