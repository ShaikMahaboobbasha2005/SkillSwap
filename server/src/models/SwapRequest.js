const mongoose = require("mongoose");
const { Schema } = mongoose;

const SWAP_STATUS = ["pending", "accepted", "rejected", "cancelled", "completed", "left"];

const swapRequestSchema = new Schema(
  {
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    offeredSkill: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    wantedSkill: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    offeredSkillSnapshot: {
      name: { type: String, default: "" },
      level: { type: String, default: "" },
    },
    wantedSkillSnapshot: {
      name: { type: String, default: "" },
      level: { type: String, default: "" },
    },
    offeredSkillName: {
      type: String,
      default: "",
    },
    offeredSkillLevel: {
      type: String,
      default: "",
    },
    wantedSkillName: {
      type: String,
      default: "",
    },
    wantedSkillLevel: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: SWAP_STATUS,
      default: "pending",
      index: true,
    },
    leftBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completionRequestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completionRequestedAt: {
      type: Date,
      default: null,
    },
    completion: {
      fromUserConfirmed: {
        type: Boolean,
        default: false,
      },
      toUserConfirmed: {
        type: Boolean,
        default: false,
      },
    },
    completedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    chatDeletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound Index: Optimizes exact duplicate detection queries and skill exchange matching
swapRequestSchema.index({
  fromUser: 1,
  toUser: 1,
  offeredSkill: 1,
  wantedSkill: 1,
  status: 1,
});

module.exports = mongoose.model("SwapRequest", swapRequestSchema);
