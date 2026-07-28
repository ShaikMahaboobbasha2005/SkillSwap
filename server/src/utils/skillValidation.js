const { z } = require("zod");
const {
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  SKILL_TYPES,
  SKILL_VISIBILITY,
} = require("../constants/skillConstants");

const createSkillSchema = z.object({
  name: z
    .string({ required_error: "Skill name is required" })
    .trim()
    .min(2, "Skill name must be at least 2 characters")
    .max(60, "Skill name must be at most 60 characters"),
  category: z.enum(SKILL_CATEGORIES, {
    errorMap: () => ({ message: "Invalid skill category" }),
  }),
  level: z
    .enum(SKILL_LEVELS, {
      errorMap: () => ({ message: "Invalid skill level" }),
    })
    .default("Intermediate"),
  type: z.enum(SKILL_TYPES, {
    errorMap: () => ({ message: "Skill type must be 'Offer' or 'Learn'" }),
  }),
  description: z
    .string()
    .max(250, "Description must be at most 250 characters")
    .optional()
    .default(""),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(50, "Years of experience cannot exceed 50")
    .nullable()
    .optional()
    .default(null),
  visibility: z
    .enum(SKILL_VISIBILITY, {
      errorMap: () => ({ message: "Visibility must be 'Public' or 'Private'" }),
    })
    .optional()
    .default("Public"),
  displayOrder: z.number().optional().default(0),
});

const updateSkillSchema = createSkillSchema.partial();

module.exports = {
  createSkillSchema,
  updateSkillSchema,
};
