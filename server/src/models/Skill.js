const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  SKILL_TYPES,
  SKILL_STATUS,
} = require("../constants/skillConstants");

const skillSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: SKILL_CATEGORIES,
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: SKILL_LEVELS,
      default: "Intermediate",
      index: true,
    },
    type: {
      type: String,
      enum: SKILL_TYPES,
      required: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 250,
      default: "",
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      max: 50,
      default: null,
    },
    status: {
      type: String,
      enum: SKILL_STATUS,
      default: "Active",
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Prevents duplicate skills of the same type for the same user (case-insensitive name)
skillSchema.index({ owner: 1, type: 1, normalizedName: 1 }, { unique: true });

// Discovery Query Index: Optimizes discovery queries filtered by status, category, type, level, and sorted by createdAt
skillSchema.index({ status: 1, category: 1, type: 1, level: 1, createdAt: -1 });

module.exports = mongoose.model("Skill", skillSchema);
