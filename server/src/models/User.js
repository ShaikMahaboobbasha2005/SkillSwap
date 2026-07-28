const mongoose = require("mongoose");
const { Schema } = mongoose;

const portfolioItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    linkedSkill: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    profileBanner: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    skillsOffered: [
      {
        type: Schema.Types.ObjectId,
        ref: "Skill",
        index: true,
      },
    ],
    skillsWanted: [
      {
        type: Schema.Types.ObjectId,
        ref: "Skill",
        index: true,
      },
    ],
    portfolio: [portfolioItemSchema],
    avgRating: {
      type: Number,
      default: 0,
    },
    completedSwaps: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
