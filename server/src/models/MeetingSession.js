const mongoose = require("mongoose");
const { Schema } = mongoose;

const meetingSessionSchema = new Schema(
  {
    swap: {
      type: Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
      index: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      default: 30, // in minutes
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    type: {
      type: String,
      enum: ["instant", "scheduled"],
      default: "scheduled",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    reminded15m: {
      type: Boolean,
      default: false,
      index: true,
    },
    remindedStart: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient query access
meetingSessionSchema.index({ swap: 1, createdAt: -1 });
meetingSessionSchema.index({ participants: 1, status: 1 });
meetingSessionSchema.index({ status: 1, scheduledAt: 1, reminded15m: 1 });
meetingSessionSchema.index({ status: 1, scheduledAt: 1, remindedStart: 1 });

module.exports = mongoose.model("MeetingSession", meetingSessionSchema);
