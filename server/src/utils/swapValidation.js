const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createSwapRequestSchema = z.object({
  toUser: z
    .string({ required_error: "Target user ID is required" })
    .regex(objectIdRegex, "Invalid target user ID format"),
  offeredSkill: z
    .string({ required_error: "Offered skill ID is required" })
    .regex(objectIdRegex, "Invalid offered skill ID format"),
  wantedSkill: z
    .string({ required_error: "Wanted skill ID is required" })
    .regex(objectIdRegex, "Invalid wanted skill ID format"),
  message: z
    .string()
    .max(500, "Message cannot exceed 500 characters")
    .optional()
    .default(""),
});

module.exports = {
  createSwapRequestSchema,
};
