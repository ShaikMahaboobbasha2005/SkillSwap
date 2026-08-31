const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    swap: {
      type: Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: false,
    },
    type: {
      type: String,
      enum: [
        "completion_request",
        "completion_confirmed",
        "completion_cancelled",
        "swap_request",
        "swap_accepted",
        "swap_rejected",
        "swap_left",
        "meeting_scheduled",
        "meeting_reminder",
        "meeting_started",
        "meeting_cancelled",
        "rating_received",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast unread notifications list & unread count queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
