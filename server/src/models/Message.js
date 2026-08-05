const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    swapRequest: {
      type: Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: function () {
        return !this.isDeleted;
      },
      trim: true,
      maxlength: 2000,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient message history & unread count queries
messageSchema.index({ swapRequest: 1, createdAt: -1 });
messageSchema.index({ swapRequest: 1, createdAt: 1 });
messageSchema.index({ swapRequest: 1, sender: 1, status: 1 });

module.exports = mongoose.model("Message", messageSchema);
