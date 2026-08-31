const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const USER_POPULATE_FIELDS = "name avatar profilePicture email location";
let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => {
  return ioInstance;
};

const isValidObjectId = (id) => {
  return Boolean(id && mongoose.Types.ObjectId.isValid(id));
};

const createNotification = async ({ user, sender, swap, type, title, message, io = null }) => {
  const notification = await Notification.create({
    user,
    sender,
    swap: swap || undefined,
    type,
    title,
    message,
    read: false,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", USER_POPULATE_FIELDS)
    .populate({
      path: "swap",
      populate: [
        { path: "offeredSkill", select: "name category level" },
        { path: "wantedSkill", select: "name category level" },
      ],
    })
    .lean();

  // Broadcast real-time event to the recipient's personal room
  const activeIO = io || ioInstance;
  if (activeIO && user) {
    try {
      const recipientId = user.toString();
      const unreadCount = await Notification.countDocuments({ user: recipientId, read: false });

      activeIO.to(`user:${recipientId}`).emit("notification", {
        success: true,
        data: populatedNotification,
        unreadCount,
        // Backwards compatibility properties
        type,
        title,
        swapId: swap ? (swap._id || swap).toString() : undefined,
      });

      activeIO.to(`user:${recipientId}`).emit("notification_unread_update", {
        success: true,
        data: { unreadCount },
      });
    } catch (socketErr) {
      console.warn("[NotificationService] Socket emission warning:", socketErr.message);
    }
  }

  return populatedNotification;
};

const getUserNotifications = async (userId, queryParams = {}) => {
  const { page = 1, limit = 20, unreadOnly = false, status } = queryParams;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const isUnreadFilter = unreadOnly === true || unreadOnly === "true" || status === "unread";

  const filter = { user: userId };
  if (isUnreadFilter) {
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
  if (!isValidObjectId(notificationId)) {
    const error = new Error("Invalid notification ID format.");
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { read: true } },
    { new: true }
  )
    .populate("sender", USER_POPULATE_FIELDS)
    .populate({
      path: "swap",
      populate: [
        { path: "offeredSkill", select: "name category level" },
        { path: "wantedSkill", select: "name category level" },
      ],
    })
    .lean();

  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }

  // Real-time unread update sync
  const activeIO = ioInstance;
  if (activeIO && userId) {
    try {
      const unreadCount = await Notification.countDocuments({ user: userId, read: false });
      activeIO.to(`user:${userId.toString()}`).emit("notification_unread_update", {
        success: true,
        data: { unreadCount },
      });
    } catch (err) {
      console.warn("[NotificationService] Unread sync warning:", err.message);
    }
  }

  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });

  // Real-time unread update sync
  const activeIO = ioInstance;
  if (activeIO && userId) {
    try {
      activeIO.to(`user:${userId.toString()}`).emit("notification_unread_update", {
        success: true,
        data: { unreadCount: 0 },
      });
    } catch (err) {
      console.warn("[NotificationService] Unread sync warning:", err.message);
    }
  }

  return { success: true };
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, read: false });
};

module.exports = {
  setIO,
  getIO,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};

