import { createContext, useState, useEffect, useCallback, useRef } from "react";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import notificationService from "../services/notificationService";

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const {
    subscribeToNotifications,
    unsubscribeFromNotifications,
    subscribeToNotificationUnread,
    unsubscribeFromNotificationUnread,
  } = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const isFetchingRef = useRef(false);

  // Fetch unread count directly
  const refreshUnreadCount = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await notificationService.getUnreadNotificationCount();
      if (res && res.success && res.data) {
        const count = typeof res.data.unreadCount === "number" ? res.data.unreadCount : res.data.count;
        setUnreadCount(count || 0);
      }
    } catch (err) {
      console.warn("[NotificationContext] Failed to fetch unread count:", err.message);
    }
  }, [token, isAuthenticated]);

  // Fetch notifications with pagination and filtering
  const fetchNotifications = useCallback(
    async ({ page: pageNum = 1, limit = 20, unreadOnly = false, append = false } = {}) => {
      if (!token || !isAuthenticated) return;
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const res = await notificationService.getNotifications({
          page: pageNum,
          limit,
          unreadOnly,
        });

        if (res && res.success) {
          const fetchedItems = Array.isArray(res.data) ? res.data : [];
          const meta = res.meta || {};

          setNotifications((prev) => {
            if (!append) return fetchedItems;

            // Deduplicate on append by MongoDB _id
            const existingIds = new Set(prev.map((n) => n._id));
            const newItems = fetchedItems.filter((n) => !existingIds.has(n._id));
            return [...prev, ...newItems];
          });

          setPage(meta.page || pageNum);
          setTotal(meta.total || 0);
          setHasMore((meta.page || pageNum) < (meta.totalPages || 1));

          if (typeof meta.unreadCount === "number") {
            setUnreadCount(meta.unreadCount);
          }
        }
      } catch (err) {
        console.error("[NotificationContext] Error fetching notifications:", err);
        setError(err?.response?.data?.message || err?.message || "Failed to load notifications.");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [token, isAuthenticated]
  );

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await notificationService.markNotificationAsRead(notificationId);
      } catch (err) {
        console.warn("[NotificationContext] Failed to mark as read on backend:", err.message);
        // Refresh to guarantee accurate server state
        refreshUnreadCount();
      }
    },
    [refreshUnreadCount]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllNotificationsAsRead();
    } catch (err) {
      console.warn("[NotificationContext] Failed to mark all as read on backend:", err.message);
      refreshUnreadCount();
    }
  }, [refreshUnreadCount]);

  // Handle incoming real-time notification socket event
  const handleIncomingNotification = useCallback((payload) => {
    if (!payload) return;
    const notificationData = payload.data || payload;
    if (!notificationData || !notificationData._id) return;

    setNotifications((prev) => {
      // Deduplicate: replace if exists, prepend if new
      const existsIndex = prev.findIndex((n) => n._id === notificationData._id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = notificationData;
        return updated;
      }
      return [notificationData, ...prev];
    });

    if (typeof payload.unreadCount === "number") {
      setUnreadCount(payload.unreadCount);
    } else {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  // Handle unread count update socket event
  const handleUnreadUpdate = useCallback((payload) => {
    const count = payload?.data?.unreadCount;
    if (typeof count === "number") {
      setUnreadCount(count);
    }
  }, []);

  // Initial load on authentication
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshUnreadCount();
      fetchNotifications({ page: 1, limit: 15 });
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setPage(1);
      setHasMore(false);
      setTotal(0);
    }
  }, [isAuthenticated, token, refreshUnreadCount, fetchNotifications]);

  // Subscribe to real-time socket events
  useEffect(() => {
    if (!isAuthenticated || !subscribeToNotifications || !subscribeToNotificationUnread) return;

    subscribeToNotifications(handleIncomingNotification);
    subscribeToNotificationUnread(handleUnreadUpdate);

    return () => {
      if (unsubscribeFromNotifications) {
        unsubscribeFromNotifications(handleIncomingNotification);
      }
      if (unsubscribeFromNotificationUnread) {
        unsubscribeFromNotificationUnread(handleUnreadUpdate);
      }
    };
  }, [
    isAuthenticated,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    subscribeToNotificationUnread,
    unsubscribeFromNotificationUnread,
    handleIncomingNotification,
    handleUnreadUpdate,
  ]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    page,
    hasMore,
    total,
    fetchNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
export default NotificationContext;
