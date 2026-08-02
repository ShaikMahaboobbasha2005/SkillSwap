const swapService = require("../services/swapService");

const createSwapRequest = async (req, res, next) => {
  try {
    const swapRequest = await swapService.createSwapRequest(req.user.id, req.body);

    const io = req.app.get("io");
    if (io && swapRequest) {
      const fromUserId = swapRequest.fromUser?._id?.toString?.() ?? swapRequest.fromUser?.toString?.();
      const toUserId = swapRequest.toUser?._id?.toString?.() ?? swapRequest.toUser?.toString?.();

      if (toUserId) {
        io.to(`user:${toUserId}`).emit("swap_request_created", {
          success: true,
          data: swapRequest,
        });
      }
      if (fromUserId) {
        io.to(`user:${fromUserId}`).emit("swap_request_created", {
          success: true,
          data: swapRequest,
        });
      }
      console.log(`[Swap Controller] Emitted swap_request_created to user:${toUserId} and user:${fromUserId}`);
    }

    res.status(201).json({
      success: true,
      message: "Swap request sent successfully",
      data: swapRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getSwapRequests = async (req, res, next) => {
  try {
    const result = await swapService.getSwapRequests(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: result.swapRequests,
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

const getIncomingSwapRequests = async (req, res, next) => {
  try {
    const result = await swapService.getSwapRequests(req.user.id, {
      ...req.query,
      type: "incoming",
    });
    res.status(200).json({
      success: true,
      data: result.swapRequests,
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

const getOutgoingSwapRequests = async (req, res, next) => {
  try {
    const result = await swapService.getSwapRequests(req.user.id, {
      ...req.query,
      type: "outgoing",
    });
    res.status(200).json({
      success: true,
      data: result.swapRequests,
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

const getSwapRequestById = async (req, res, next) => {
  try {
    const swapRequest = await swapService.getSwapRequestById(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: swapRequest,
    });
  } catch (error) {
    next(error);
  }
};

const emitSwapUpdate = (req, swapRequest) => {
  const io = req.app.get("io");
  if (io && swapRequest) {
    const fromUserId = swapRequest.fromUser?._id?.toString() || swapRequest.fromUser?.toString();
    const toUserId = swapRequest.toUser?._id?.toString() || swapRequest.toUser?.toString();

    if (fromUserId && toUserId) {
      io.to(`user:${fromUserId}`).to(`user:${toUserId}`).emit("swap_request_updated", {
        success: true,
        data: swapRequest,
      });
    }
  }
};

const acceptSwapRequest = async (req, res, next) => {
  try {
    const swapRequest = await swapService.acceptSwapRequest(req.params.id, req.user.id);
    emitSwapUpdate(req, swapRequest);
    res.status(200).json({
      success: true,
      message: "Swap request accepted successfully",
      data: swapRequest,
    });
  } catch (error) {
    next(error);
  }
};

const rejectSwapRequest = async (req, res, next) => {
  try {
    const swapRequest = await swapService.rejectSwapRequest(req.params.id, req.user.id);
    emitSwapUpdate(req, swapRequest);
    res.status(200).json({
      success: true,
      message: "Swap request rejected successfully",
      data: swapRequest,
    });
  } catch (error) {
    next(error);
  }
};

const cancelSwapRequest = async (req, res, next) => {
  try {
    const swapRequest = await swapService.cancelSwapRequest(req.params.id, req.user.id);
    emitSwapUpdate(req, swapRequest);
    res.status(200).json({
      success: true,
      message: "Swap request cancelled successfully",
      data: swapRequest,
    });
  } catch (error) {
    next(error);
  }
};

const getSwapStats = async (req, res, next) => {
  try {
    const stats = await swapService.getSwapStats(req.user.id);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSwapRequest,
  getSwapRequests,
  getIncomingSwapRequests,
  getOutgoingSwapRequests,
  getSwapRequestById,
  acceptSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest,
  getSwapStats,
};
