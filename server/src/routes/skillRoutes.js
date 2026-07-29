const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skillController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  createSkillSchema,
  updateSkillSchema,
} = require("../utils/skillValidation");

// Protected own skills routes
router.post(
  "/",
  authMiddleware,
  validateRequest(createSkillSchema),
  skillController.createSkill
);

router.get("/me", authMiddleware, skillController.getOwnSkills);

// Active skills of a user
router.get("/user/:userId", skillController.getUserActiveSkills);

// Skill modification routes (owner protected)
router.put(
  "/:id",
  authMiddleware,
  validateRequest(updateSkillSchema),
  skillController.updateSkill
);

router.delete("/:id", authMiddleware, skillController.deleteSkill);

module.exports = router;
