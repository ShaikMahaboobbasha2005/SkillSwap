const { z } = require("zod");

const isValidHttpUrl = (val) => {
  if (!val || typeof val !== "string" || val.trim() === "") return true;
  try {
    const parsed = new URL(val.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_) {
    return false;
  }
};

const createPlatformValidator = (platformName, allowedHostnames) => {
  return z
    .string({
      invalid_type_error: `${platformName} link must be a string URL`,
    })
    .trim()
    .max(500, `${platformName} URL must be at most 500 characters`)
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        if (!isValidHttpUrl(val)) return false;
        try {
          const parsed = new URL(val.trim());
          const host = parsed.hostname.toLowerCase();
          return allowedHostnames.some(
            (allowed) => host === allowed || host.endsWith("." + allowed)
          );
        } catch (_) {
          return false;
        }
      },
      {
        message: `Please enter a valid ${platformName} URL (e.g. https://${allowedHostnames[0]}/...)`,
      }
    )
    .nullable()
    .optional()
    .or(z.literal(""));
};

const websiteValidator = z
  .string({
    invalid_type_error: "Personal website must be a string URL",
  })
  .trim()
  .max(500, "Website URL must be at most 500 characters")
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      return isValidHttpUrl(val);
    },
    {
      message: "Please enter a valid website URL starting with http:// or https://",
    }
  )
  .nullable()
  .optional()
  .or(z.literal(""));

const socialLinksSchema = z
  .object({
    linkedin: createPlatformValidator("LinkedIn", ["linkedin.com"]),
    github: createPlatformValidator("GitHub", ["github.com"]),
    instagram: createPlatformValidator("Instagram", ["instagram.com"]),
    youtube: createPlatformValidator("YouTube", ["youtube.com", "youtu.be"]),
    website: websiteValidator,
  })
  .strict("Unrecognized fields inside socialLinks are not allowed")
  .nullable()
  .optional();

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
  socialLinks: socialLinksSchema,
});

module.exports = {
  updateProfileSchema,
  socialLinksSchema,
};
