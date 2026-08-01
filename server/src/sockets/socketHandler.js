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

  io.on("connection", (socket) => {
    const userId = socket.user?.id;

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

    // Send message event
    socket.on("send_message", async (payload, callback) => {
      const ack = typeof callback === "function" ? callback : () => {};
      try {
        const { swapId, content } = payload || {};

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

        // Authorize participant & persist message in MongoDB
        const savedMessage = await chatService.saveMessage({
          swapId,
          senderId: userId,
          content: validation.data.content,
        });

        // Broadcast to room swap:<swapId>
        io.to(roomName).emit("new_message", {
          success: true,
          data: savedMessage,
        });

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
