const { z } = require("zod");

const createRatingSchema = z.object({
  stars: z
    .number({
      required_error: "Star rating is required",
      invalid_type_error: "Star rating must be a number",
    })
    .int("Star rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  review: z
    .string({ invalid_type_error: "Review must be a string" })
    .trim()
    .max(500, "Review cannot exceed 500 characters")
    .optional()
    .default(""),
});

module.exports = {
  createRatingSchema,
};
