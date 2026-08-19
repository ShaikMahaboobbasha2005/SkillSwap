const Notification = require("../models/Notification");

const USER_POPULATE_FIELDS = "name avatar profilePicture email location";

const createNotification = async ({ user, sender, swap, type, title, message }) => {
  const notification = await Notification.create({
    user,
    sender,
    swap,
    type,
    title,
    message,
    read: false,
  });

  return await Notification.findById(notification._id)
    .populate("sender", USER_POPULATE_FIELDS)
    .populate({
      path: "swap",
      populate: [
        { path: "offeredSkill", select: "name category level" },
        { path: "wantedSkill", select: "name category level" },
      ],
    });
};

const getUserNotifications = async (userId, queryParams = {}) => {
  const { page = 1, limit = 20, unreadOnly = false } = queryParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const filter = { user: userId };
  if (unreadOnly) {
    filter.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("sender", USER_POPULATE_FIELDS)
      .populate({
        path: "swap",
        populate: [
          { path: "offeredSkill", select: "name category level" },
          { path: "wantedSkill", select: "name category level" },
        ],
      })
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, read: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
  return { success: true };
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, read: false });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
