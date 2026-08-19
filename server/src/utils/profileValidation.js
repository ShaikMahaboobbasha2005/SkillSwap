const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be a string",
    })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .optional(),
  location: z
    .string({
      invalid_type_error: "Location must be a string",
    })
    .max(100, "Location must be at most 100 characters")
    .optional(),
  profilePicture: z
    .string({
      invalid_type_error: "Profile picture must be a string URL",
    })
    .optional(),
  profilePicturePublicId: z
    .string({
      invalid_type_error: "Profile picture public ID must be a string",
    })
    .optional(),
  profileBanner: z
    .string({
      invalid_type_error: "Profile banner must be a string URL",
    })
    .optional(),
  profileBannerPublicId: z
    .string({
      invalid_type_error: "Profile banner public ID must be a string",
    })
    .optional(),
});

module.exports = {
  updateProfileSchema,
};
