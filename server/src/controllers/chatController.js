const chatService = require("../services/chatService");

const getMessages = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await chatService.getMessagesBySwapId(
      req.params.swapId,
      userId,
      req.query
    );
    res.status(200).json({
      success: true,
      data: result.messages,
      swapRequest: result.swapRequest,
      isReadOnly: result.isReadOnly,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const conversations = await chatService.getConversations(userId);
    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const counts = await chatService.getUnreadCounts(userId);
    res.status(200).json({
      success: true,
      data: {
        unreadConversationCount: counts.unreadConversationCount,
        totalUnreadMessageCount: counts.totalUnreadMessageCount,
        totalUnreadCount: counts.unreadConversationCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { messageIds } = req.body || {};
    const result = await chatService.markMessagesAsRead(
      req.params.swapId,
      userId,
      messageIds
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`swap:${req.params.swapId}`).emit("messages_status_update", {
        success: true,
        type: "read",
        swapId: req.params.swapId,
        readBy: userId,
        readAt: result.readAt,
        messageIds: result.messageIds,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await chatService.deleteMessage(
      req.params.swapId,
      req.params.messageId,
      userId
    );

    const io = req.app.get("io");
    if (io) {
      // Broadcast real-time message_deleted event AFTER successful DB persistence
      io.to(`swap:${result.swapId}`).emit("message_deleted", {
        swapId: result.swapId,
        messageId: result.messageId,
        deletedAt: result.deletedAt,
      });

      // If deleted message was unread, emit authoritative unread update to recipient
      if (result.wasUnread && result.recipientUnreadCounts) {
        io.to(`user:${result.recipientId}`).emit("chat_unread_update", {
          success: true,
          data: {
            swapId: result.swapId,
            senderId: result.senderId,
            unreadConversationCount: result.recipientUnreadCounts.unreadConversationCount,
            totalUnreadMessageCount: result.recipientUnreadCounts.totalUnreadMessageCount,
            totalUnreadCount: result.recipientUnreadCounts.unreadConversationCount,
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        messageId: result.messageId,
        swapId: result.swapId,
        isDeleted: true,
        deletedAt: result.deletedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteChatHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const result = await chatService.deleteChatHistoryForUser(
      req.params.swapId,
      userId
    );
    res.status(200).json({
      success: true,
      message: "Chat deleted from history successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  getConversations,
  getUnreadCount,
  markAsRead,
  deleteMessage,
  deleteChatHistory,
};
