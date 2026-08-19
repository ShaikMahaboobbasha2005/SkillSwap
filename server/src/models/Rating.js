const mongoose = require("mongoose");
const { Schema } = mongoose;

const ratingSchema = new Schema(
  {
    swapRequest: {
      type: Schema.Types.ObjectId,
      ref: "SwapRequest",
      required: true,
      index: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ratedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Database Constraint: Compound unique index ensures 1 rating per reviewer per swap
ratingSchema.index({ swapRequest: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
