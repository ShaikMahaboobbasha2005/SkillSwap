const mongoose = require("mongoose");
const { Schema } = mongoose;

const portfolioSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    media: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      thumbnailUrl: {
        type: String,
        default: "",
      },
      duration: {
        type: Number,
        default: null,
      },
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    skill: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      default: null,
    },
    moderationStatus: {
      type: String,
      enum: ["active", "reported", "flagged", "hidden", "removed"],
      default: "active",
      index: true,
    },
    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reactions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: ["like", "impressive", "great_work", "creative"],
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound Index: Optimizes user portfolio queries by moderationStatus, media type, and recency
portfolioSchema.index({ user: 1, moderationStatus: 1, "media.type": 1, createdAt: -1 });

module.exports = mongoose.model("Portfolio", portfolioSchema);
