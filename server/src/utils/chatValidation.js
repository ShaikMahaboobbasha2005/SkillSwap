const { z } = require("zod");

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const sendMessageSchema = z.object({
  content: z
    .string({ required_error: "Message content is required" })
    .trim()
    .min(1, "Message content cannot be empty")
    .max(2000, "Message content cannot exceed 2000 characters"),
});

const isValidObjectId = (id) => {
  if (!id || typeof id !== "string") return false;
  return objectIdRegex.test(id);
};

module.exports = {
  sendMessageSchema,
  isValidObjectId,
  objectIdRegex,
};
