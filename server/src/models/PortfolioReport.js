const mongoose = require("mongoose");
const { Schema } = mongoose;

const portfolioReportSchema = new Schema(
  {
    portfolioItem: {
      type: Schema.Types.ObjectId,
      ref: "Portfolio",
      required: true,
      index: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: [
        "nudity",
        "violence",
        "illegal",
        "hate_harassment",
        "spam",
        "copyright",
        "other",
      ],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed", "action_taken"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Enforces max 1 report per user per portfolio item at the database level
portfolioReportSchema.index(
  { portfolioItem: 1, reporter: 1 },
  { unique: true }
);

module.exports = mongoose.model("PortfolioReport", portfolioReportSchema);
