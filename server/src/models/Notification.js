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
      required: true,
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

module.exports = mongoose.model("Notification", notificationSchema);
