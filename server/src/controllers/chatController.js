const chatService = require("../services/chatService");

const getMessages = async (req, res, next) => {
  try {
    const result = await chatService.getMessagesBySwapId(
      req.params.swapId,
      req.user.id,
      req.query
    );
    res.status(200).json({
      success: true,
      data: result.messages,
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
    const conversations = await chatService.getConversations(req.user.id);
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
    const totalUnreadCount = await chatService.getTotalUnreadCount(req.user.id);
    res.status(200).json({
      success: true,
      data: { totalUnreadCount },
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const result = await chatService.markMessagesAsRead(req.params.swapId, req.user.id);
    res.status(200).json({
      success: true,
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
};
