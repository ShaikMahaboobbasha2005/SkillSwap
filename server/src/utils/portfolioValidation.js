const { z } = require("zod");
const mongoose = require("mongoose");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createPortfolioSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(500, "Caption must be at most 500 characters")
    .optional()
    .default(""),
  skillId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid skill ID format")
    .optional()
    .or(z.literal("")),
});

const updatePortfolioSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(500, "Caption must be at most 500 characters")
    .optional(),
  skillId: z
    .string()
    .trim()
    .regex(objectIdRegex, "Invalid skill ID format")
    .nullable()
    .optional()
    .or(z.literal("")),
});

const portfolioTypeFilterSchema = z.object({
  type: z
    .enum(["image", "video"], {
      errorMap: () => ({ message: "Invalid type filter. Allowed values: image, video" }),
    })
    .optional(),
});

const portfolioReactionSchema = z.object({
  type: z.enum(["like", "impressive", "great_work", "creative"], {
    errorMap: () => ({ message: "Invalid reaction type. Allowed values: like, impressive, great_work, creative" }),
  }),
});

module.exports = {
  createPortfolioSchema,
  updatePortfolioSchema,
  portfolioTypeFilterSchema,
  portfolioReactionSchema,
};
