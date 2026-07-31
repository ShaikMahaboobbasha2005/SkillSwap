const mongoose = require("mongoose");
const { Schema } = mongoose;

const SWAP_STATUS = ["pending", "accepted", "rejected", "cancelled"];

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
