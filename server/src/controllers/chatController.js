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

module.exports = {
  getMessages,
};
