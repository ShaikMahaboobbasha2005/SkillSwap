const jwt = require("jsonwebtoken");
const chatService = require("../services/chatService");
const { sendMessageSchema, isValidObjectId } = require("../utils/chatValidation");

const initSockets = (io) => {
  // Authentication Middleware for Socket.io
  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.headers?.authorization;
      const authToken = socket.handshake.auth?.token;

      let token = authToken;
      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (!token) {
        const err = new Error("Authentication error: No token provided");
        err.data = { code: "UNAUTHORIZED" };
        return next(err);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role, iat, exp }
      next();
    } catch (error) {
      const err = new Error("Authentication error: Invalid or expired token");
      err.data = { code: "UNAUTHORIZED" };
      return next(err);
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user?.id || socket.user?._id || socket.user?.userId;

    // Safely join authenticated user to their own personal room (derived strictly from verified JWT identity)
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`[Socket] User connected: ${userId} joined room user:${userId}`);
    }

    // Automatically mark pending sent messages as delivered for newly connected recipient
    try {
      const deliveryResult = await chatService.markMessagesAsDeliveredForUser(userId);
      if (deliveryResult.modifiedCount > 0) {
        io.emit("messages_status_update", {
          type: "delivered",
          userId,
        });
      }
    } catch (err) {
      console.warn("Delivery update error on socket connect:", err.message);
    }

    // Join swap chat room
    socket.on("join_swap_chat", async (payload, callback) => {
      const ack = typeof callback === "function" ? callback : () => {};
      try {
        const swapId = typeof payload === "string" ? payload : payload?.swapId;

        if (!isValidObjectId(swapId)) {
          return ack({
            success: false,
            message: "Invalid swap request ID format.",
            code: "INVALID_SWAP_ID",
          });
        }

        // Centralized authorization: verifies existence, accepted status, participant identity
        await chatService.verifyAcceptedSwapParticipant(swapId, userId);

        const roomName = `swap:${swapId}`;
        socket.join(roomName);

        ack({
          success: true,
          message: "Joined chat room successfully",
          swapId,
        });
      } catch (error) {
        ack({
          success: false,
          message: error.message || "Failed to join chat room",
          code: error.code || "FORBIDDEN",
        });
      }
    });

    // Explicit Mark Messages as Read Event
    socket.on("mark_messages_read", async (payload, callback) => {
      const ack = typeof callback === "function" ? callback : () => {};
      try {
        const { swapId, messageIds } =
          typeof payload === "string" ? { swapId: payload } : payload || {};

        if (!isValidObjectId(swapId)) {
          return ack({
            success: false,
            message: "Invalid swap request ID format.",
            code: "INVALID_SWAP_ID",
          });
        }

        const readResult = await chatService.markMessagesAsRead(
          swapId,
          userId,
          messageIds
        );
        const roomName = `swap:${swapId}`;

        // Broadcast read status update to room swap:<swapId>
        io.to(roomName).emit("messages_status_update", {
          success: true,
          type: "read",
          swapId,
          readBy: userId,
          readAt: readResult.readAt,
          messageIds: readResult.messageIds,
        });

        // Emit updated unread count to user's personal room
        io.to(`user:${userId}`).emit("chat_unread_update", {
          success: true,
          data: {
            swapId,
            unreadConversationCount: readResult.unreadConversationCount,
            totalUnreadMessageCount: readResult.totalUnreadMessageCount,
            totalUnreadCount: readResult.unreadConversationCount,
          },
        });

        ack({
          success: true,
          data: readResult,
        });
      } catch (error) {
        ack({
          success: false,
          message: error.message || "Failed to mark messages as read",
          code: error.code || "SERVER_ERROR",
        });
      }
    });

    // Send message event
    socket.on("send_message", async (payload, callback) => {
      const ack = typeof callback === "function" ? callback : () => {};
      try {
        const { swapId, content, replyTo } = payload || {};

        if (!isValidObjectId(swapId)) {
          return ack({
            success: false,
            message: "Invalid swap request ID format.",
            code: "INVALID_SWAP_ID",
          });
        }

        const roomName = `swap:${swapId}`;

        // Verify socket has joined the room
        if (!socket.rooms.has(roomName)) {
          return ack({
            success: false,
            message: "You must join the chat room before sending messages.",
            code: "ROOM_NOT_JOINED",
          });
        }

        // Validate message content via Zod schema
        const validation = sendMessageSchema.safeParse({ content });
        if (!validation.success) {
          const issue = validation.error.issues[0];
          return ack({
            success: false,
            message: issue ? issue.message : "Invalid message content",
            code: "VALIDATION_ERROR",
          });
        }

        // Check if counterpart is connected in the room
        const roomSockets = io.sockets.adapter.rooms.get(roomName);
        const isRecipientConnected = roomSockets && roomSockets.size > 1;
        const initialStatus = isRecipientConnected ? "delivered" : "sent";

        // Authorize participant & get swap details to identify recipient
        const swapRequest = await chatService.verifyAcceptedSwapParticipant(swapId, userId);
        const recipientId =
          swapRequest.fromUser.toString() === userId.toString()
            ? swapRequest.toUser.toString()
            : swapRequest.fromUser.toString();

        // Persist message in MongoDB
        const savedMessage = await chatService.saveMessage({
          swapId,
          senderId: userId,
          content: validation.data.content,
          replyTo,
          status: initialStatus,
        });

        // Broadcast to room swap:<swapId> for open chat rendering
        io.to(roomName).emit("new_message", {
          success: true,
          data: savedMessage,
        });

        // Emit global chat_unread_update with authoritative unread count to recipient's personal user room
        try {
          const counts = await chatService.getUnreadCounts(recipientId);
          io.to(`user:${recipientId}`).emit("chat_unread_update", {
            success: true,
            data: {
              swapId,
              senderId: userId,
              unreadConversationCount: counts.unreadConversationCount,
              totalUnreadMessageCount: counts.totalUnreadMessageCount,
              totalUnreadCount: counts.unreadConversationCount,
            },
          });
        } catch (unreadErr) {
          console.warn("Failed to calculate/emit unread counts:", unreadErr.message);
        }

        // Acknowledge sender
        ack({
          success: true,
          data: savedMessage,
        });
      } catch (error) {
        ack({
          success: false,
          message: error.message || "Failed to send message",
          code: error.code || "SERVER_ERROR",
        });
      }
    });
  });
};

module.exports = initSockets;
