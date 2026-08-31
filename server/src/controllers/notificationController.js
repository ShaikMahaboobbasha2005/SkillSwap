const notificationService = require("../services/notificationService");

const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: result.notifications,
      meta: {
        total: result.total,
        unreadCount: result.unreadCount,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: { count: 0, unreadCount: 0 },
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json({
      success: true,
      data: { count, unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
};
